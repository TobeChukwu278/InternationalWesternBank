import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

let resend: Resend | null = null;
if (apiKey) {
  try {
    resend = new Resend(apiKey);
  } catch (err) {
    console.error("Failed to initialize Resend client:", err);
  }
}

const FROM = process.env.RESEND_FROM ?? "IWB Notifications <noreply@iwb-bank.com>";

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    const msg = "RESEND_API_KEY not configured";
    console.error("Email not sent:", msg);
    return { success: false, error: msg };
  }

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return { success: true };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false, error: String(err) };
  }
}
