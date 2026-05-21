"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Transaction } from "@/types/database";

const typeLabel: Record<string, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  transfer: "Transfer",
  internal_transfer: "Internal Transfer",
};

const statusStyles: Record<string, string> = {
  completed: "bg-iwb-teal/10 text-iwb-teal",
  pending: "bg-iwb-navy/5 text-iwb-slate",
  failed: "bg-iwb-error/10 text-iwb-error",
};

interface TransactionReceiptProps {
  transaction: Transaction;
  isIncoming: boolean;
  accountNumber: string;
  onClose: () => void;
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export function TransactionReceipt({
  transaction,
  isIncoming,
  accountNumber,
  onClose,
}: TransactionReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState<string | null>(null);
  const { date, time } = formatDateTime(transaction.created_at);

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
      link.download = `receipt-${transaction.reference}.png`;
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
      pdf.save(`receipt-${transaction.reference}.pdf`);
    } finally {
      setCapturing(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-iwb-navy/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto animate-[fadeIn_200ms_ease-out,slideUp_200ms_ease-out]">
        {/* Receipt */}
        <div
          ref={receiptRef}
          className="bg-white rounded-t-iwb-xl p-8"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-iwb-border-light pb-6">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center">
              <img src="/logo.png" alt="IWB" className="size-12" />
            </div>
            <h2 className="text-lg font-bold text-iwb-navy">International Western Bank</h2>
            <p className="text-xs text-iwb-slate-light mt-0.5">Secure Banking Solution</p>
          </div>

          {/* Title */}
          <div className="text-center py-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-iwb-slate-light">
              Payment Receipt
            </p>
          </div>

          {/* Reference & Date */}
          <div className="space-y-2 pb-5 border-b border-dashed border-iwb-border-light">
            <div className="flex justify-between text-sm">
              <span className="text-iwb-slate-light">Receipt No.</span>
              <span className="font-mono text-xs font-medium text-iwb-navy">{transaction.reference}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-iwb-slate-light">Date</span>
              <span className="text-xs text-iwb-navy">{date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-iwb-slate-light">Time</span>
              <span className="text-xs text-iwb-navy">{time}</span>
            </div>
          </div>

          {/* Amount */}
          <div className="py-6 text-center border-b border-dashed border-iwb-border-light">
            <p className="text-[10px] uppercase tracking-wider text-iwb-slate-light mb-1">Amount</p>
            <p className={`text-4xl font-bold ${isIncoming ? "text-iwb-teal" : "text-iwb-navy"}`}>
              {isIncoming ? "+" : "-"}${Number(transaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <span className={`mt-2 inline-block rounded-iwb-full px-3 py-0.5 text-xs font-medium ${statusStyles[transaction.status]}`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
          </div>

          {/* Details */}
          <div className="py-5 space-y-3 border-b border-dashed border-iwb-border-light">
            <div className="flex justify-between text-sm">
              <span className="text-iwb-slate-light">Transaction Type</span>
              <span className="text-xs font-medium text-iwb-navy capitalize">
                {typeLabel[transaction.type] ?? transaction.type.replace("_", " ")}
              </span>
            </div>
            {transaction.category ? (
              <div className="flex justify-between text-sm">
                <span className="text-iwb-slate-light">Category</span>
                <span className="text-xs font-medium text-iwb-navy capitalize">
                  {transaction.category.replace("_", " ")}
                </span>
              </div>
            ) : null}
            {transaction.merchant_name ? (
              <div className="flex justify-between text-sm">
                <span className="text-iwb-slate-light">Merchant</span>
                <span className="text-xs font-medium text-iwb-navy">{transaction.merchant_name}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-sm">
              <span className="text-iwb-slate-light">{isIncoming ? "From" : "To"}</span>
              <span className="text-xs font-medium text-iwb-navy">
                {isIncoming
                  ? transaction.merchant_name || "External Transfer"
                  : transaction.merchant_name || "External Transfer"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-iwb-slate-light">{isIncoming ? "To" : "From"}</span>
              <span className="text-xs font-medium text-iwb-navy font-mono">
                ***{accountNumber.slice(-4)}
              </span>
            </div>
          </div>

          {/* Description */}
          {transaction.description ? (
            <div className="py-4 border-b border-dashed border-iwb-border-light">
              <p className="text-[10px] uppercase tracking-wider text-iwb-slate-light mb-1.5">Note</p>
              <p className="text-xs text-iwb-navy">{transaction.description}</p>
            </div>
          ) : null}

          {/* Footer */}
          <div className="pt-6 text-center">
            <p className="text-xs text-iwb-slate-light">
              This is an electronically generated receipt.
            </p>
            <p className="text-xs text-iwb-slate-light mt-0.5">
              Thank you for banking with International Western Bank.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-iwb-surface rounded-b-iwb-xl p-4 flex gap-3">
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
            {capturing === "png" ? "Capturing..." : "PNG"}
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
            {capturing === "pdf" ? "Generating..." : "PDF"}
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-iwb-md bg-iwb-teal px-4 py-2.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
