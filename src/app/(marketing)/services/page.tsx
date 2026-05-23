import { t } from "@/i18n/server";

export default async function ServicesPage() {
  const [pageTitle, pageSubtitle, personalTitle, personalDesc, businessTitle, businessDesc, transfersTitle, transfersDesc, cardsTitle, cardsDesc, supportTitle, supportDesc, securityTitle, securityDesc] = await Promise.all([
    t("marketing.services.pageTitle"),
    t("marketing.services.pageSubtitle"),
    t("marketing.services.personalTitle"),
    t("marketing.services.personalDesc"),
    t("marketing.services.businessTitle"),
    t("marketing.services.businessDesc"),
    t("marketing.services.transfersTitle"),
    t("marketing.services.transfersDesc"),
    t("marketing.services.cardsTitle"),
    t("marketing.services.cardsDesc"),
    t("marketing.services.supportTitle"),
    t("marketing.services.supportDesc"),
    t("marketing.services.securityTitle"),
    t("marketing.services.securityDesc"),
  ]);

  const services = [
    { icon: "person", title: personalTitle, desc: personalDesc },
    { icon: "business", title: businessTitle, desc: businessDesc },
    { icon: "swap_horiz", title: transfersTitle, desc: transfersDesc },
    { icon: "credit_card", title: cardsTitle, desc: cardsDesc },
    { icon: "headset_mic", title: supportTitle, desc: supportDesc },
    { icon: "security", title: securityTitle, desc: securityDesc },
  ];

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
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s.title} className="rounded-iwb-xl bg-white p-8 shadow-iwb-card">
                <span className="flex size-14 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
                  <i className="material-icons text-2xl">{s.icon}</i>
                </span>
                <h3 className="mt-5 text-xl font-semibold text-iwb-navy">{s.title}</h3>
                <p className="mt-3 text-sm text-iwb-slate leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
