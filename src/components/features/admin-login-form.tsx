"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { adminLogin } from "@/lib/actions/admin-login";
import { useLocale } from "@/i18n/client";

export function AdminLoginForm() {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await adminLogin(formData);
      return result;
    },
    null,
  );

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-iwb-lg bg-white p-8 shadow-iwb-card">
        <div className="mb-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center">
            <img src="/logo.png" alt="IWB" className="size-12" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-iwb-navy">{t("admin.login.title")}</h1>
          <p className="mt-1 text-sm text-iwb-slate">{t("admin.login.subtitle")}</p>
        </div>

        <form action={formAction} className="space-y-4">
          <Input
            label={t("admin.login.passwordLabel")}
            name="password"
            type="password"
            autoFocus
            required
            placeholder={t("admin.login.passwordPlaceholder")}
          />

          {state?.error ? (
            <p className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-error/5 px-3 py-2 text-sm text-iwb-error">
              <svg className="size-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
              </svg>
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-iwb-md bg-iwb-teal px-6 py-3 text-sm font-semibold text-iwb-navy transition-all duration-200 hover:bg-iwb-teal-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? t("admin.login.verifying") : t("admin.login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
