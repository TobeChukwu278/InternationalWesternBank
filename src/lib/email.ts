import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const FROM = process.env.SENDGRID_FROM ?? "IWB Notifications <noreply@iwb-bank.com>";

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  if (!apiKey) {
    const msg = "SENDGRID_API_KEY not configured";
    console.error("Email not sent:", msg);
    return { success: false, error: msg };
  }

  try {
    await sgMail.send({ to, from: FROM, subject, html });
    return { success: true };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false, error: String(err) };
  }
}
