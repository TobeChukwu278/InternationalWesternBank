"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Link from "next/link";

type ResultStatus = "success" | "failure" | "pending";

interface SendResultProps {
  status: ResultStatus;
  amount: string;
  recipientName: string;
  reference: string;
  error?: string;
  scheduledDate?: string;
  preferredCurrency: string;
  onRetry: () => void;
  onClose: () => void;
}

const currencySymbols: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£",
};

const config: Record<ResultStatus, {
  icon: string;
  iconColor: string;
  heading: string;
  headingColor: string;
  borderColor: string;
}> = {
  success: {
    icon: "check_circle",
    iconColor: "text-iwb-teal",
    heading: "Money Sent!",
    headingColor: "text-iwb-teal-dark",
    borderColor: "border-iwb-teal",
  },
  failure: {
    icon: "cancel",
    iconColor: "text-iwb-error",
    heading: "Transfer Failed",
    headingColor: "text-iwb-error",
    borderColor: "border-iwb-error",
  },
  pending: {
    icon: "schedule",
    iconColor: "text-iwb-slate",
    heading: "Transfer Scheduled",
    headingColor: "text-iwb-navy",
    borderColor: "border-iwb-border",
  },
};

export function SendResult({
  status,
  amount,
  recipientName,
  reference,
  error,
  scheduledDate,
  preferredCurrency,
  onRetry,
  onClose,
}: SendResultProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState<string | null>(null);
  const isAdminPending = status === "pending" && !scheduledDate;
  const effectiveConfig = isAdminPending
    ? {
        icon: "hourglass_empty" as const,
        iconColor: "text-iwb-amber" as const,
        heading: "Pending Approval" as const,
        headingColor: "text-iwb-navy" as const,
        borderColor: "border-iwb-amber" as const,
      }
    : config[status];
  const c = effectiveConfig;
  const symbol = currencySymbols[preferredCurrency] ?? "$";

  async function captureReceipt(): Promise<HTMLCanvasElement | null> {
    if (!receiptRef.current) return null;
    return html2canvas(receiptRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
  }

  async function downloadPNG() {
    setCapturing("png");
    try {
      const canvas = await captureReceipt();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `receipt-${reference}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setCapturing(null);
    }
  }

  async function downloadPDF() {
    setCapturing("pdf");
    try {
      const canvas = await captureReceipt();
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "px", format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`receipt-${reference}.pdf`);
    } finally {
      setCapturing(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-iwb-xl border-2 ${c.borderColor} bg-white overflow-hidden`}>
        <div ref={receiptRef} className="p-8" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
          <div className="text-center border-b border-dashed border-iwb-border-light pb-6">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center">
              <img src="/logo.png" alt="IWB" className="size-14" />
            </div>
            <h2 className="text-lg font-bold text-iwb-navy">International Western Bank</h2>
          </div>

          <div className="py-6 text-center">
            <i className={`material-icons text-5xl ${c.iconColor} mb-2`}>{c.icon}</i>
            <p className={`text-lg font-semibold ${c.headingColor}`}>{c.heading}</p>
          </div>

          <div className="space-y-3 border-t border-dashed border-iwb-border-light pt-5">
            <div className="flex justify-between text-sm">
              <span className="text-iwb-slate-light">Amount</span>
              <span className="text-xl font-bold text-iwb-navy">
                {symbol}{parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-iwb-slate-light">Recipient</span>
              <span className="text-sm font-medium text-iwb-navy">{recipientName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-iwb-slate-light">Reference</span>
              <span className="font-mono text-xs text-iwb-navy">{reference}</span>
            </div>
            {status === "pending" && scheduledDate ? (
              <div className="flex justify-between text-sm">
                <span className="text-iwb-slate-light">Scheduled</span>
                <span className="text-sm text-iwb-navy">
                  {new Date(scheduledDate).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                  })}
                </span>
              </div>
            ) : null}
            {status === "pending" && scheduledDate ? (
              <div className="flex justify-between text-sm">
                <span className="text-iwb-slate-light">Status</span>
                <span className="rounded-iwb-full bg-iwb-navy/5 px-2.5 py-0.5 text-xs font-medium text-iwb-slate">Scheduled</span>
              </div>
            ) : null}
            {isAdminPending ? (
              <div className="flex justify-between text-sm">
                <span className="text-iwb-slate-light">Status</span>
                <span className="rounded-iwb-full bg-iwb-amber/10 px-2.5 py-0.5 text-xs font-medium text-iwb-amber">Pending Approval</span>
              </div>
            ) : null}
          </div>

          <div className="pt-5 text-center border-t border-dashed border-iwb-border-light mt-5">
            <p className="text-xs text-iwb-slate-light">Electronically generated receipt</p>
            <p className="text-xs text-iwb-slate-light mt-0.5">Thank you for banking with IWB</p>
          </div>
        </div>

        {status === "success" || status === "pending" ? (
          <div className="flex gap-3 border-t border-iwb-border-light p-4 bg-iwb-surface">
            <button
              onClick={downloadPNG}
              disabled={capturing !== null}
              className="flex flex-1 items-center justify-center gap-2 rounded-iwb-md border border-iwb-border px-4 py-2.5 text-sm font-medium text-iwb-navy transition-all hover:bg-white disabled:opacity-50"
            >
              {capturing === "png" ? (
                <span className="size-4 animate-spin rounded-full border-2 border-iwb-navy border-t-transparent" />
              ) : (
                <i className="material-icons text-base">image</i>
              )}
              {capturing === "png" ? "..." : "PNG"}
            </button>
            <button
              onClick={downloadPDF}
              disabled={capturing !== null}
              className="flex flex-1 items-center justify-center gap-2 rounded-iwb-md border border-iwb-border px-4 py-2.5 text-sm font-medium text-iwb-navy transition-all hover:bg-white disabled:opacity-50"
            >
              {capturing === "pdf" ? (
                <span className="size-4 animate-spin rounded-full border-2 border-iwb-navy border-t-transparent" />
              ) : (
                <i className="material-icons text-base">picture_as_pdf</i>
              )}
              {capturing === "pdf" ? "..." : "PDF"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex gap-3">
        {status === "failure" ? (
          <button
            onClick={onRetry}
            className="flex-1 rounded-iwb-md bg-iwb-teal px-6 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark text-center"
          >
            Try Again
          </button>
        ) : null}
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex-1 rounded-iwb-md border-2 border-iwb-border px-6 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-surface text-center"
        >
          Back to Dashboard
        </Link>
      </div>

      {status === "failure" && error ? (
        <div className="rounded-iwb-lg bg-iwb-error/5 border border-iwb-error/20 p-4">
          <div className="flex items-start gap-3">
            <i className="material-icons text-iwb-error text-base mt-0.5">info</i>
            <p className="text-sm text-iwb-error">{error}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
