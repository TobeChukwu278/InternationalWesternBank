import { t } from "@/i18n/server";

export default async function ContactPage() {
  const [pageTitle, pageSubtitle, nameLabel, emailLabel, subjectLabel, messageLabel, sendLabel, addressTitle, addressLine1, addressLine2, phoneLabel, emailAddr] = await Promise.all([
    t("marketing.contact.pageTitle"),
    t("marketing.contact.pageSubtitle"),
    t("marketing.contact.nameLabel"),
    t("marketing.contact.emailLabel"),
    t("marketing.contact.subjectLabel"),
    t("marketing.contact.messageLabel"),
    t("marketing.contact.send"),
    t("marketing.contact.address"),
    t("marketing.contact.addressLine1"),
    t("marketing.contact.addressLine2"),
    t("marketing.contact.phone"),
    t("marketing.contact.email"),
  ]);

  return (
    <div>
      <section className="bg-iwb-navy px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-white">{pageTitle}</h1>
          <p className="mt-4 text-lg text-white/70">{pageSubtitle}</p>
        </div>
      </section>

      <section className="bg-iwb-surface px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <form className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-iwb-navy">{nameLabel}</label>
                    <input type="text" className="mt-1 block w-full rounded-iwb-md border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-iwb-navy">{emailLabel}</label>
                    <input type="email" className="mt-1 block w-full rounded-iwb-md border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-iwb-navy">{subjectLabel}</label>
                  <input type="text" className="mt-1 block w-full rounded-iwb-md border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-iwb-navy">{messageLabel}</label>
                  <textarea rows={5} className="mt-1 block w-full rounded-iwb-md border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none" />
                </div>
                <button type="submit" className="rounded-iwb-md bg-iwb-teal px-6 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark">
                  {sendLabel}
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-iwb-slate-light">{addressTitle}</h3>
                <p className="mt-2 text-sm text-iwb-navy">{addressLine1}</p>
                <p className="text-sm text-iwb-navy">{addressLine2}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-iwb-slate-light">{phoneLabel}</h3>
                <p className="mt-2 text-sm text-iwb-navy">+1 (786) 245-4920</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-iwb-slate-light">{emailAddr}</h3>
                <p className="mt-2 text-sm text-iwb-teal">support@internationalwb.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
