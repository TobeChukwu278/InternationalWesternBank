import { t } from "@/i18n/server";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

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
      <section className="bg-iwb-navy px-6 py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <h1 className="font-chivo text-4xl font-bold text-white">{pageTitle}</h1>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <p className="mt-4 font-dm-sans text-lg text-white/70">{pageSubtitle}</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-iwb-surface px-6 py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ScrollReveal>
                <form className="space-y-5 rounded-xl bg-white p-8 shadow-lg lg:p-10">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="font-dm-sans text-sm font-medium text-iwb-navy">{nameLabel}</label>
                      <input type="text" className="mt-1 block w-full rounded-lg border border-iwb-slate-light/30 bg-white px-4 py-3 font-dm-sans text-sm text-iwb-navy placeholder:text-iwb-slate-light transition-shadow focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/20 focus:outline-none" />
                    </div>
                    <div>
                      <label className="font-dm-sans text-sm font-medium text-iwb-navy">{emailLabel}</label>
                      <input type="email" className="mt-1 block w-full rounded-lg border border-iwb-slate-light/30 bg-white px-4 py-3 font-dm-sans text-sm text-iwb-navy placeholder:text-iwb-slate-light transition-shadow focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/20 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="font-dm-sans text-sm font-medium text-iwb-navy">{subjectLabel}</label>
                    <input type="text" className="mt-1 block w-full rounded-lg border border-iwb-slate-light/30 bg-white px-4 py-3 font-dm-sans text-sm text-iwb-navy placeholder:text-iwb-slate-light transition-shadow focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="font-dm-sans text-sm font-medium text-iwb-navy">{messageLabel}</label>
                    <textarea rows={5} className="mt-1 block w-full rounded-lg border border-iwb-slate-light/30 bg-white px-4 py-3 font-dm-sans text-sm text-iwb-navy placeholder:text-iwb-slate-light transition-shadow focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/20 focus:outline-none" />
                  </div>
                  <button type="submit" className="rounded-lg bg-iwb-teal px-6 py-3 font-dm-sans text-sm font-bold text-iwb-navy transition-all hover:bg-white hover:text-iwb-navy">
                    {sendLabel}
                  </button>
                </form>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={150}>
              <div className="space-y-8 rounded-xl bg-[#F5F0EB] p-8 shadow-lg lg:p-10">
                <div className="flex items-start gap-4">
                  <svg className="size-5 shrink-0 text-iwb-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <h3 className="font-chivo text-sm font-semibold uppercase tracking-wider text-iwb-slate-light">{addressTitle}</h3>
                    <p className="mt-2 font-dm-sans text-sm text-iwb-navy">{addressLine1}</p>
                    <p className="font-dm-sans text-sm text-iwb-navy">{addressLine2}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <svg className="size-5 shrink-0 text-iwb-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div>
                    <h3 className="font-chivo text-sm font-semibold uppercase tracking-wider text-iwb-slate-light">{phoneLabel}</h3>
                    <p className="mt-2 font-dm-sans text-sm text-iwb-navy">+1 (786) 245-4920</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <svg className="size-5 shrink-0 text-iwb-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div>
                    <h3 className="font-chivo text-sm font-semibold uppercase tracking-wider text-iwb-slate-light">{emailAddr}</h3>
                    <p className="mt-2 font-dm-sans text-sm text-iwb-teal">support@internationalwb.com</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
