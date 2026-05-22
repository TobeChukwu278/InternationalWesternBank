"use client";

import { useLocale } from "@/i18n/client";

interface PersonalInfoData {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  date_of_birth: string;
  address_line1: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

interface PersonalInfoProps {
  data: PersonalInfoData;
  onChange: (data: Partial<PersonalInfoData>) => void;
  onNext: () => void;
}

export function PersonalInfo({ data, onChange, onNext }: PersonalInfoProps) {
  const { t } = useLocale();
  const required = [
    { key: "full_name", label: t("personalInfo.fullName") },
    { key: "email", label: t("personalInfo.email") },
    { key: "password", label: t("personalInfo.password") },
    { key: "phone", label: t("personalInfo.phone") },
    { key: "date_of_birth", label: t("personalInfo.dateOfBirth") },
    { key: "address_line1", label: t("personalInfo.address") },
    { key: "address_city", label: t("personalInfo.city") },
    { key: "address_state", label: t("personalInfo.state") },
    { key: "address_zip", label: t("personalInfo.zipCode") },
  ];

  const isValid = required.every((r) => (data as any)[r.key]?.trim());

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t("personalInfo.fullName")}</label>
          <input
            type="text"
            value={data.full_name}
            onChange={(e) => onChange({ full_name: e.target.value })}
            placeholder={t("personalInfo.fullNamePlaceholder")}
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t("personalInfo.email")}</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder={t("personalInfo.emailPlaceholder")}
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t("personalInfo.phone")}</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder={t("personalInfo.phonePlaceholder")}
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t("personalInfo.dateOfBirth")}</label>
          <input
            type="date"
            value={data.date_of_birth}
            onChange={(e) => onChange({ date_of_birth: e.target.value })}
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t("personalInfo.password")}</label>
          <input
            type="password"
            value={data.password}
            onChange={(e) => onChange({ password: e.target.value })}
            placeholder={t("personalInfo.passwordPlaceholder")}
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t("personalInfo.address")}</label>
          <input
            type="text"
            value={data.address_line1}
            onChange={(e) => onChange({ address_line1: e.target.value })}
            placeholder={t("personalInfo.addressPlaceholder")}
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
            <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t("personalInfo.city")}</label>
            <input
              type="text"
              value={data.address_city}
              onChange={(e) => onChange({ address_city: e.target.value })}
              placeholder={t("personalInfo.cityPlaceholder")}
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
              <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t("personalInfo.state")}</label>
              <input
                type="text"
                value={data.address_state}
                onChange={(e) => onChange({ address_state: e.target.value })}
                placeholder={t("personalInfo.statePlaceholder")}
              className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
              required
            />
          </div>
          <div className="w-32">
              <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t("personalInfo.zipCode")}</label>
              <input
                type="text"
                value={data.address_zip}
                onChange={(e) => onChange({ address_zip: e.target.value })}
                placeholder={t("personalInfo.zipPlaceholder")}
              className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
              required
            />
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full rounded-iwb-md bg-iwb-teal px-6 py-3.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("common.continue")}
      </button>
    </div>
  );
}
