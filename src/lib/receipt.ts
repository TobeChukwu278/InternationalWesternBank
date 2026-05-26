import jsPDF from "jspdf";

interface ReceiptData {
  reference: string;
  amount: string;
  date: string;
  senderName: string;
  senderAccount: string;
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
}

export function generateTransferReceipt(data: ReceiptData): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const navy = "#0A2540";
  const teal = "#00D4AA";
  const gray = "#4A5568";
  const lightGray = "#A0AEC0";

  function textCenter(text: string, size: number, color: string, yPos: number, family?: string) {
    doc.setFont(family || "helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const w = doc.getTextWidth(text);
    doc.text(text, (pageW - w) / 2, yPos);
    return yPos + size * 0.35;
  }

  function line(yPos: number, color: string) {
    doc.setDrawColor(color);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageW - margin, yPos);
    return yPos + 2;
  }

  function labelValue(label: string, value: string, yPos: number, valueColor?: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(lightGray);
    doc.text(label, margin, yPos);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(valueColor || navy);
    doc.text(value, margin + 50, yPos);
    return yPos + 7;
  }

  y = textCenter("IWB", 28, teal, y + 10);
  y = textCenter("International Western Bank", 14, navy, y + 2);
  y = textCenter("OFFICIAL PAYMENT RECEIPT", 11, gray, y + 6);
  y = line(y + 3, teal);

  y = labelValue("Reference:", data.reference, y + 6, teal);
  y = labelValue("Date:", data.date, y);
  y = labelValue("Status:", "Completed", y, "#059669");

  y = line(y + 4, "#E2E8F0");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(navy);
  doc.text("AMOUNT", margin, y + 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(navy);
  const amtW = doc.getTextWidth(data.amount);
  doc.text(data.amount, pageW - margin - amtW, y + 4);

  y = line(y + 8, "#E2E8F0");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(navy);
  doc.text("SENDER", margin, y + 4);
  y = labelValue("Name:", data.senderName, y + 8);
  y = labelValue("Account:", data.senderAccount, y);

  y = line(y + 4, "#E2E8F0");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(navy);
  doc.text("RECIPIENT", margin, y + 4);
  y = labelValue("Name:", data.recipientName, y + 8);
  y = labelValue("Account:", data.recipientAccount, y);
  y = labelValue("Bank:", data.recipientBank, y);

  y = line(y + 4, teal);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(lightGray);
  doc.text("This is an electronically generated receipt.", margin, y + 6);
  doc.text("Thank you for banking with International Western Bank.", margin, y + 11);
  doc.text("249 E Ocean Blvd, Long Beach, CA 90802, United States", margin, y + 16);

  return Buffer.from(doc.output("arraybuffer"));
}
