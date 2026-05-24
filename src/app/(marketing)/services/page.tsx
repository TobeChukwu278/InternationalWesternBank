import { t } from "@/i18n/server";
import { BuildingIcon, CreditCardIcon, GlobeIcon, HeadsetIcon, LightningIcon, LockIcon } from "@/components/ui/icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function TransferIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

const serviceIcons: Record<string, React.FC<{ className?: string }>> = {
  person: PersonIcon,
  business: BuildingIcon,
  swap_horiz: TransferIcon,
  credit_card: CreditCardIcon,
  headset_mic: HeadsetIcon,
  security: LockIcon,
};

export default async function ServicesPage() {
  const [
    pageTitle,
    pageSubtitle,
    personalTitle,
    personalDesc,
    businessTitle,
    businessDesc,
    transfersTitle,
    transfersDesc,
    cardsTitle,
    cardsDesc,
    supportTitle,
    supportDesc,
    securityTitle,
    securityDesc,
    statsAccounts,
    statsAccountsLabel,
    statsCountries,
    statsCountriesLabel,
    statsTransfers,
    statsTransfersLabel,
    statsSupport,
    statsSupportLabel,
    howItWorksTitle,
    howItWorksStep1,
    howItWorksStep1Desc,
    howItWorksStep2,
    howItWorksStep2Desc,
    howItWorksStep3,
    howItWorksStep3Desc,
    ctaTitle,
    ctaDesc,
    ctaRegister,
    ctaLogin,
  ] = await Promise.all([
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
    t("marketing.services.stats.accounts"),
    t("marketing.services.stats.accountsLabel"),
    t("marketing.services.stats.countries"),
    t("marketing.services.stats.countriesLabel"),
    t("marketing.services.stats.transfers"),
    t("marketing.services.stats.transfersLabel"),
    t("marketing.services.stats.support"),
    t("marketing.services.stats.supportLabel"),
    t("marketing.services.howItWorks.title"),
    t("marketing.services.howItWorks.step1"),
    t("marketing.services.howItWorks.step1Desc"),
    t("marketing.services.howItWorks.step2"),
    t("marketing.services.howItWorks.step2Desc"),
    t("marketing.services.howItWorks.step3"),
    t("marketing.services.howItWorks.step3Desc"),
    t("marketing.services.ctaTitle"),
    t("marketing.services.ctaDesc"),
    t("marketing.cta.register"),
    t("marketing.cta.login"),
  ]);

  const services = [
    { icon: "person", title: personalTitle, desc: personalDesc },
    { icon: "business", title: businessTitle, desc: businessDesc },
    { icon: "swap_horiz", title: transfersTitle, desc: transfersDesc },
    { icon: "credit_card", title: cardsTitle, desc: cardsDesc },
    { icon: "headset_mic", title: supportTitle, desc: supportDesc },
    { icon: "security", title: securityTitle, desc: securityDesc },
  ];

  const stats = [
    { icon: DocumentIcon, value: statsAccounts, label: statsAccountsLabel },
    { icon: GlobeIcon, value: statsCountries, label: statsCountriesLabel },
    { icon: TransferIcon, value: statsTransfers, label: statsTransfersLabel },
    { icon: LightningIcon, value: statsSupport, label: statsSupportLabel },
  ];

  const howItWorksSteps = [
    { num: "01", icon: DocumentIcon, title: howItWorksStep1, desc: howItWorksStep1Desc },
    { num: "02", icon: LightningIcon, title: howItWorksStep2, desc: howItWorksStep2Desc },
    { num: "03", icon: GlobeIcon, title: howItWorksStep3, desc: howItWorksStep3Desc },
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-iwb-navy px-6 py-24 lg:px-16 lg:py-28">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-iwb-navy/50 via-iwb-navy to-iwb-navy" />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <h1 className="font-chivo text-4xl font-bold leading-tight text-white lg:text-5xl">{pageTitle}</h1>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <p className="mt-4 font-dm-sans text-lg leading-relaxed text-white/70">{pageSubtitle}</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-iwb-navy px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <ScrollReveal key={s.label} delay={i * 100}>
                  <div className="flex flex-col items-center text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-white/10 text-iwb-teal">
                      <Icon className="size-6" />
                    </span>
                    <span className="mt-4 font-chivo text-3xl font-bold text-white lg:text-4xl">{s.value}</span>
                    <span className="mt-1 font-dm-sans text-sm text-white/60">{s.label}</span>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-iwb-surface px-6 py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const Icon = serviceIcons[s.icon];
              return (
                <ScrollReveal key={s.title} delay={i * 100}>
                  <div className="rounded-xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                    <span className="flex size-14 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
                      {Icon ? <Icon className="size-6" /> : null}
                    </span>
                    <h3 className="mt-5 font-chivo text-xl font-bold text-iwb-navy">{s.title}</h3>
                    <p className="mt-3 font-dm-sans text-sm leading-relaxed text-iwb-slate">{s.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#F5F0EB] px-6 py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <h2 className="font-chivo text-3xl font-bold text-iwb-navy lg:text-4xl">{howItWorksTitle}</h2>
          </ScrollReveal>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {howItWorksSteps.map((s, i) => {
              const Icon = s.icon;
              return (
                <ScrollReveal key={s.num} delay={i * 150}>
                  <div className="relative flex flex-col items-center text-center">
                    <div className="relative">
                      <span className="absolute -right-2 -top-2 z-10 flex size-8 items-center justify-center rounded-full bg-iwb-teal font-chivo text-sm font-bold text-white">
                        {s.num}
                      </span>
                      <span className="flex size-20 items-center justify-center rounded-full bg-iwb-navy text-white">
                        <Icon className="size-8" />
                      </span>
                    </div>
                    <h3 className="mt-6 font-chivo text-xl font-bold text-iwb-navy">{s.title}</h3>
                    <p className="mt-3 font-dm-sans text-sm leading-relaxed text-iwb-slate">{s.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-iwb-teal px-6 py-24 lg:px-16 lg:py-28">
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80')] bg-cover bg-center opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-iwb-teal/90 to-iwb-teal/70" />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <h2 className="font-chivo text-3xl font-bold text-white lg:text-4xl">{ctaTitle}</h2>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <p className="mt-4 font-dm-sans text-base leading-relaxed text-white/80">{ctaDesc}</p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/signup"
                className="inline-flex rounded-lg bg-white px-6 py-3 font-chivo text-sm font-bold text-iwb-teal transition-all hover:bg-white/90"
              >
                {ctaRegister}
              </a>
              <a
                href="/login"
                className="inline-flex rounded-lg border-2 border-white px-6 py-3 font-chivo text-sm font-bold text-white transition-all hover:bg-white/10"
              >
                {ctaLogin}
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
