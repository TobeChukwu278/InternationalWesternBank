function baseHtml(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
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
          <tr>
            <td style="padding:0 0 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:Chivo,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0A2540;letter-spacing:-0.3px;">
                    <span style="color:#00D4AA;">IWB</span> International Western Bank
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:40px 36px;box-shadow:0 1px 3px rgba(10,37,64,0.06);">
              ${bodyContent}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0 0;text-align:center;font-size:13px;color:#A0AEC0;">
              <p style="margin:0 0 4px;">International Western Bank</p>
              <p style="margin:0 0 4px;">249 E Ocean Blvd, Long Beach, CA 90802, United States</p>
              <p style="margin:0;">&copy; ${new Date().getFullYear()} IWB. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

const DEFAULT_SITE_URL = "https://international-western-bank-q75w.vercel.app";

interface NotificationEmailProps {
  title: string;
  message: string;
  type: "transfer" | "deposit" | "system";
  reference?: string;
  siteUrl?: string;
}

const typeIcons: Record<string, string> = {
  transfer: "\u{1F504}",
  deposit: "\u{1F4B0}",
  system: "\u2139\uFE0F",
};

const typeHeaders: Record<string, string> = {
  transfer: "Transfer Notification",
  deposit: "Deposit Notification",
  system: "System Notification",
};

export function notificationTemplate({ title, message, type, reference, siteUrl }: NotificationEmailProps): {
  subject: string;
  html: string;
} {
  const baseUrl = siteUrl || DEFAULT_SITE_URL;
  const icon = typeIcons[type] || "\u{1F514}";
  const typeLabel = typeHeaders[type] || "Notification";

  const bodyContent = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:0 0 20px;text-align:center;">
          <span style="font-size:40px;line-height:1;">${icon}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 8px;text-align:center;">
          <span style="display:inline-block;font-family:Chivo,'Times New Roman',serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#00D4AA;background-color:#00D4AA10;padding:4px 12px;border-radius:4px;">${typeLabel}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 12px;text-align:center;">
          <h1 style="margin:0;font-family:Chivo,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0A2540;letter-spacing:-0.3px;">${title}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 ${reference ? "12px" : "4px"};text-align:center;">
          <p style="margin:0;font-size:15px;color:#4A5568;">${message}</p>
        </td>
      </tr>
      ${reference ? `
      <tr>
        <td style="padding:0;text-align:center;">
          <p style="margin:0;font-size:13px;color:#A0AEC0;">Reference: <span style="font-family:monospace;color:#0A2540;">${reference}</span></p>
        </td>
      </tr>` : ""}
      <tr>
        <td style="padding:24px 0 0;border-top:1px solid #EDF2F7;">
          <p style="margin:0;font-size:13px;color:#A0AEC0;text-align:center;">
            This is an automated notification from IWB. Please do not reply to this email.
            <br>
            <a href="${baseUrl}/login" style="color:#00D4AA;text-decoration:underline;">Sign in to your account</a> for more details.
          </p>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: `[IWB] ${title}`,
    html: baseHtml(title, bodyContent),
  };
}
