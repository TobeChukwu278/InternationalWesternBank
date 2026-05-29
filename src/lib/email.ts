import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

let resend: Resend | null = null;

if (apiKey) {
  resend = new Resend(apiKey);
}

const FROM = process.env.RESEND_FROM || (process.env.RESEND_API_KEY ? "IWB Notifications <notifications@iwb-bank.com>" : "");

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: EmailAttachment[],
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    const msg = "RESEND_API_KEY not configured";
    console.error("Email not sent:", msg);
    return { success: false, error: msg };
  }

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content.toString("base64"),
        content_type: a.contentType,
      })),
    });
    return { success: true };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false, error: String(err) };
  }
}
