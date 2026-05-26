import nodemailer from "nodemailer";

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

let transporter: nodemailer.Transporter | null = null;

if (user && pass) {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

const FROM = process.env.SMTP_FROM || user || "noreply@iwb-bank.com";

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  if (!transporter) {
    const msg = "SMTP_USER or SMTP_PASS not configured";
    console.error("Email not sent:", msg);
    return { success: false, error: msg };
  }

  try {
    await transporter.sendMail({ from: `"IWB Notifications" <${FROM}>`, to, subject, html });
    return { success: true };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false, error: String(err) };
  }
}
