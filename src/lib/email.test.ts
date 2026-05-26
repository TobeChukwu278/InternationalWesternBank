import { describe, it, expect, vi, beforeEach } from "vitest";
import { notificationTemplate } from "./email-templates";

describe("notificationTemplate", () => {
  it("generates valid subject for transfer notifications", () => {
    const result = notificationTemplate({
      title: "Transfer Received",
      message: "You received $500 from John",
      type: "transfer",
      reference: "TXN-123",
    });
    expect(result.subject).toBe("[IWB] Transfer Received");
  });

  it("generates valid subject for deposit notifications", () => {
    const result = notificationTemplate({
      title: "Deposit Confirmed",
      message: "Your deposit of $1,000 has been confirmed",
      type: "deposit",
    });
    expect(result.subject).toBe("[IWB] Deposit Confirmed");
  });

  it("generates valid subject for system notifications", () => {
    const result = notificationTemplate({
      title: "Account Approved",
      message: "Your account has been approved",
      type: "system",
    });
    expect(result.subject).toBe("[IWB] Account Approved");
  });

  it("includes the reference in the HTML body when provided", () => {
    const result = notificationTemplate({
      title: "Transfer Sent",
      message: "Transfer processed",
      type: "transfer",
      reference: "REF-001",
    });
    expect(result.html).toContain("REF-001");
    expect(result.html).toContain("Reference:");
  });

  it("omits reference section when reference is not provided", () => {
    const result = notificationTemplate({
      title: "Account Created",
      message: "Your account has been created",
      type: "system",
    });
    expect(result.html).not.toContain("Reference:");
  });

  it("includes IWB branding in the HTML", () => {
    const result = notificationTemplate({
      title: "Test",
      message: "Test message",
      type: "system",
    });
    expect(result.html).toContain("International Western Bank");
    expect(result.html).toContain("#00D4AA");
    expect(result.html).toContain("#0A2540");
  });

  it("includes the notification type badge", () => {
    const transfer = notificationTemplate({ title: "T", message: "M", type: "transfer" });
    expect(transfer.html).toContain("Transfer Notification");

    const deposit = notificationTemplate({ title: "T", message: "M", type: "deposit" });
    expect(deposit.html).toContain("Deposit Notification");

    const system = notificationTemplate({ title: "T", message: "M", type: "system" });
    expect(system.html).toContain("System Notification");
  });

  it("generates valid HTML with DOCTYPE and structure", () => {
    const result = notificationTemplate({
      title: "Test",
      message: "Test",
      type: "system",
    });
    expect(result.html).toMatch(/^<!DOCTYPE html>/);
    expect(result.html).toContain("<html>");
    expect(result.html).toContain("</html>");
    expect(result.html).toContain("<body");
    expect(result.html).toContain("</body>");
  });

  it("includes the message in the body", () => {
    const result = notificationTemplate({
      title: "Alert",
      message: "Your account needs attention",
      type: "system",
    });
    expect(result.html).toContain("Your account needs attention");
  });

  it("includes the correct emoji icon per type", () => {
    const transfer = notificationTemplate({ title: "T", message: "M", type: "transfer" });
    expect(transfer.html).toContain("🔄");

    const deposit = notificationTemplate({ title: "T", message: "M", type: "deposit" });
    expect(deposit.html).toContain("💰");

    const system = notificationTemplate({ title: "T", message: "M", type: "system" });
    expect(system.html).toContain("ℹ️");
  });

  it("uses provided siteUrl in the login link", () => {
    const result = notificationTemplate({
      title: "Test",
      message: "Test",
      type: "system",
      siteUrl: "https://example.com",
    });
    expect(result.html).toContain("https://example.com/login");
    expect(result.html).not.toContain("international-western-bank-q75w.vercel.app");
  });

  it("falls back to default site URL when siteUrl not provided", () => {
    const result = notificationTemplate({
      title: "Test",
      message: "Test",
      type: "system",
    });
    expect(result.html).toContain("https://international-western-bank-q75w.vercel.app/login");
  });
});

describe("approval notification email", () => {
  const approvalData = {
    title: "Account Approved",
    message: "Your account has been verified and approved. You can now access all IWB banking services.",
    type: "system" as const,
  };

  it("has the correct subject line", () => {
    const result = notificationTemplate(approvalData);
    expect(result.subject).toBe("[IWB] Account Approved");
  });

  it("contains the approval message in the HTML body", () => {
    const result = notificationTemplate(approvalData);
    expect(result.html).toContain("Your account has been verified and approved");
    expect(result.html).toContain("You can now access all IWB banking services");
  });

  it("shows the System Notification badge", () => {
    const result = notificationTemplate(approvalData);
    expect(result.html).toContain("System Notification");
  });

  it("includes the Sign in to your account link", () => {
    const result = notificationTemplate({ ...approvalData, siteUrl: "https://example.com" });
    expect(result.html).toContain("https://example.com/login");
    expect(result.html).toContain("Sign in to your account");
  });

  it("has no reference section (approval has no reference)", () => {
    const result = notificationTemplate(approvalData);
    expect(result.html).not.toContain("Reference:");
  });
});

describe("sendEmail error handling", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("handles missing SENDGRID_API_KEY gracefully", async () => {
    const OLD_KEY = process.env.SENDGRID_API_KEY;
    delete process.env.SENDGRID_API_KEY;

    vi.resetModules();
    const { sendEmail } = await import("./email");

    const result = await sendEmail("test@example.com", "Test", "<p>Hi</p>");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    process.env.SENDGRID_API_KEY = OLD_KEY;
  });
});
