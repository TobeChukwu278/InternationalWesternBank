import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM = "IWB Notifications <onboarding@resend.dev>";

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return { success: true };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false, error: String(err) };
  }
}
