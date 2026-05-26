const DEFAULT_SITE_URL = "https://international-western-bank-q75w.vercel.app";

type EmailStatus = "success" | "pending" | "error" | "info";

const statusConfig: Record<EmailStatus, { bg: string; light: string; border: string; label: string; icon: string }> = {
  success: { bg: "#059669", light: "#ECFDF5", border: "#A7F3D0", label: "Success", icon: "✓" },
  pending: { bg: "#D97706", light: "#FFFBEB", border: "#FDE68A", label: "Pending", icon: "⏳" },
  error:   { bg: "#DC2626", light: "#FEF2F2", border: "#FECACA", label: "Action Required", icon: "!" },
  info:    { bg: "#2563EB", light: "#EFF6FF", border: "#BFDBFE", label: "Information", icon: "i" },
};

function getStatus(title: string): EmailStatus {
  const t = title.toLowerCase();
  if (t.includes("approved") || t.includes("confirmed") || t.includes("received") || t.includes("completed")) return "success";
  if (t.includes("pending") || t.includes("submitted")) return "pending";
  if (t.includes("rejected") || t.includes("failed") || t.includes("declined")) return "error";
  return "info";
}

function statusBar(status: EmailStatus): string {
  const c = statusConfig[status];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="background-color:${c.bg};height:4px;font-size:1px;line-height:1;">&nbsp;</td></tr>
  </table>`;
}

function statusBadge(status: EmailStatus): string {
  const c = statusConfig[status];
  return `<span style="display:inline-block;background-color:${c.light};color:${c.bg};font-family:Chivo,'Times New Roman',serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;padding:5px 14px;border-radius:4px;border:1px solid ${c.border};">${c.label}</span>`;
}

function headerLogo(baseUrl: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:32px 36px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;padding-right:12px;">
              <img src="${baseUrl}/logo.png" alt="IWB" width="40" height="40" style="display:block;border:0;outline:none;width:40px;height:40px;" />
            </td>
            <td style="vertical-align:middle;">
              <span style="font-family:Chivo,'Times New Roman',serif;font-size:20px;font-weight:700;color:#0A2540;letter-spacing:-0.3px;">
                <span style="color:#00D4AA;">IWB</span> International Western Bank
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function contentCard(status: EmailStatus, icon: string, title: string, message: string, bodyExtra: string, cta: string): string {
  const c = statusConfig[status];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:0 0 12px 12px;">
    <tr>
      <td style="padding:32px 36px 0;text-align:center;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="width:64px;height:64px;border-radius:50%;background-color:${c.light};text-align:center;vertical-align:middle;">
              <span style="font-size:28px;line-height:64px;color:${c.bg};font-weight:700;font-family:Chivo,'Times New Roman',serif;">${icon}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 36px 0;text-align:center;">${statusBadge(status)}</td>
    </tr>
    <tr>
      <td style="padding:12px 36px 0;text-align:center;">
        <h1 style="margin:0;font-family:Chivo,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0A2540;letter-spacing:-0.3px;">${title}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 36px 0;text-align:center;">
        <p style="margin:0;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.6;color:#4A5568;">${message}</p>
      </td>
    </tr>
    ${bodyExtra}
    <tr>
      <td style="padding:24px 36px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="border-top:1px solid #EDF2F7;padding-top:20px;text-align:center;">
              <p style="margin:0 0 16px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:13px;color:#A0AEC0;line-height:1.5;">
                This is an automated notification from IWB.
              </p>
              ${cta}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr>
      <td style="border-radius:8px;background-color:#0A2540;padding:12px 28px;text-align:center;">
        <a href="${href}" style="font-family:Chivo,'Times New Roman',serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;display:inline-block;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function referenceBlock(reference: string): string {
  return `<tr>
    <td style="padding:12px 36px 0;text-align:center;">
      <p style="margin:0;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:13px;color:#A0AEC0;">
        Reference: <span style="font-family:monospace;color:#0A2540;font-weight:600;letter-spacing:0.5px;">${reference}</span>
      </p>
    </td>
  </tr>`;
}

function amountHighlight(amount: string): string {
  return `<tr>
    <td style="padding:16px 36px 0;text-align:center;">
      <span style="font-family:Chivo,'Times New Roman',serif;font-size:32px;font-weight:700;color:#0A2540;letter-spacing:-0.5px;">${amount}</span>
    </td>
  </tr>`;
}

function footer(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:24px 0 0;text-align:center;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:12px;color:#A0AEC0;line-height:1.6;">
        <p style="margin:0 0 2px;font-weight:600;color:#718096;">International Western Bank</p>
        <p style="margin:0 0 2px;">249 E Ocean Blvd, Long Beach, CA 90802, United States</p>
        <p style="margin:0;">&copy; ${new Date().getFullYear()} IWB. All rights reserved.</p>
      </td>
    </tr>
  </table>`;
}

function baseHtml(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F9FC;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.6;color:#4A5568;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F9FC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          ${bodyContent}
          <tr><td style="padding:0;">${footer()}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function extractAmount(message: string): string | null {
  const match = message.match(/\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/);
  return match ? match[0] : null;
}

export function notificationTemplate({ title, message, type, reference, siteUrl }: {
  title: string;
  message: string;
  type: "transfer" | "deposit" | "system";
  reference?: string;
  siteUrl?: string;
}): { subject: string; html: string } {
  const baseUrl = siteUrl || DEFAULT_SITE_URL;
  const status = getStatus(title);

  let bodyExtra = "";
  const amount = extractAmount(message);
  if (amount && (title.includes("Received") || title.includes("Confirmed") || title.includes("Approved") || title.includes("Debited"))) {
    bodyExtra += amountHighlight(amount);
  }
  if (reference) {
    bodyExtra += referenceBlock(reference);
  }

  const ctaLink = `${baseUrl}/login`;
  const cta = ctaButton(ctaLink, "Sign In to Your Account");

  const bodyContent = `
    ${statusBar(status)}
    ${headerLogo(baseUrl)}
    ${contentCard(status, statusConfig[status].icon, title, message, bodyExtra, cta)}
  `;

  return { subject: `[IWB] ${title}`, html: baseHtml(title, bodyContent) };
}
