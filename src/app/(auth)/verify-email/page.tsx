import { t } from "@/i18n/server";
import { MailCheckContent } from "./mail-check-content";

export default async function VerifyEmailPage() {
  const [title, subtitle, checkInbox, spamHint, loginLink] = await Promise.all([
    t("auth.verifyEmail.title"),
    t("auth.verifyEmail.subtitle"),
    t("auth.verifyEmail.checkInbox"),
    t("auth.verifyEmail.spamHint"),
    t("auth.verifyEmail.loginLink"),
  ]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-iwb-surface px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
          <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </span>
        <h1 className="mt-6 font-chivo text-2xl font-bold text-iwb-navy">{title}</h1>
        <p className="mt-3 font-dm-sans text-sm leading-relaxed text-iwb-slate">{subtitle}</p>
        <div className="mt-8 rounded-xl bg-iwb-teal/5 p-6 text-left">
          <p className="font-dm-sans text-sm font-medium text-iwb-navy">{checkInbox}</p>
          <p className="mt-2 font-dm-sans text-xs text-iwb-slate">{spamHint}</p>
        </div>
        <MailCheckContent loginLink={loginLink} />
      </div>
    </div>
  );
}
