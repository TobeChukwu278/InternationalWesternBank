import { t } from "@/i18n/server";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { GlobeIcon, CheckIcon } from "@/components/ui/icons";

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function HandshakeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 17a3 3 0 0 1-3-3V8" />
      <path d="M13 17a3 3 0 0 0 3-3V8" />
      <path d="M21 12.6V8a2 2 0 0 0-2-2h-2" />
      <path d="M3 12.6V8a2 2 0 0 1 2-2h2" />
      <path d="M7 6h10" />
      <path d="M11 9v4" />
      <path d="M13 9v4" />
      <path d="M9 19h6" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const icons: Record<string, React.FC<{ className?: string }>> = {
  public: GlobeIcon,
  shield: ShieldIcon,
  handshake: HandshakeIcon,
  trending_up: TrendingUpIcon,
};

export default async function AboutPage() {
  const [
    pageTitle, pageSubtitle,
    storyTitle, storyText,
    missionTitle, missionText, visionTitle, visionText,
    valuesTitle, value1, value2, value3, value4,
    value1Desc, value2Desc, value3Desc, value4Desc,
    statYears, statYearsLabel, statCustomers, statCustomersLabel,
    statCountries, statCountriesLabel, statEmployees, statEmployeesLabel,
    whyTitle, whyItem1Title, whyItem1Desc, whyItem2Title, whyItem2Desc, whyItem3Title, whyItem3Desc,
  ] = await Promise.all([
    t("marketing.about.pageTitle"),
    t("marketing.about.pageSubtitle"),
    t("marketing.about.storyTitle"),
    t("marketing.about.storyText"),
    t("marketing.about.missionTitle"),
    t("marketing.about.missionText"),
    t("marketing.about.visionTitle"),
    t("marketing.about.visionText"),
    t("marketing.about.valuesTitle"),
    t("marketing.about.value1"),
    t("marketing.about.value2"),
    t("marketing.about.value3"),
    t("marketing.about.value4"),
    t("marketing.about.value1Desc"),
    t("marketing.about.value2Desc"),
    t("marketing.about.value3Desc"),
    t("marketing.about.value4Desc"),
    t("marketing.about.stats.years"),
    t("marketing.about.stats.yearsLabel"),
    t("marketing.about.stats.customers"),
    t("marketing.about.stats.customersLabel"),
    t("marketing.about.stats.countries"),
    t("marketing.about.stats.countriesLabel"),
    t("marketing.about.stats.employees"),
    t("marketing.about.stats.employeesLabel"),
    t("marketing.about.whyChoose.title"),
    t("marketing.about.whyChoose.item1Title"),
    t("marketing.about.whyChoose.item1Desc"),
    t("marketing.about.whyChoose.item2Title"),
    t("marketing.about.whyChoose.item2Desc"),
    t("marketing.about.whyChoose.item3Title"),
    t("marketing.about.whyChoose.item3Desc"),
  ]);

  const values = [
    { icon: "public", title: value1, desc: value1Desc, color: "bg-iwb-teal/10 text-iwb-teal" },
    { icon: "shield", title: value2, desc: value2Desc, color: "bg-iwb-navy/10 text-iwb-navy" },
    { icon: "handshake", title: value3, desc: value3Desc, color: "bg-iwb-teal/10 text-iwb-teal" },
    { icon: "trending_up", title: value4, desc: value4Desc, color: "bg-iwb-navy/10 text-iwb-navy" },
  ];

  const stats = [
    { value: statYears, label: statYearsLabel, Icon: ClockIcon },
    { value: statCustomers, label: statCustomersLabel, Icon: UsersIcon },
    { value: statCountries, label: statCountriesLabel, Icon: GlobeIcon },
    { value: statEmployees, label: statEmployeesLabel, Icon: TrendingUpIcon },
  ];

  const whyChoose = [
    { Icon: ShieldIcon, title: whyItem1Title, desc: whyItem1Desc },
    { Icon: GlobeIcon, title: whyItem2Title, desc: whyItem2Desc },
    { Icon: CheckIcon, title: whyItem3Title, desc: whyItem3Desc },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-iwb-navy px-6 py-24 lg:px-16 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-iwb-teal/10 via-transparent to-white/5" />
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-iwb-teal" />
        <div className="relative mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <h1 className="font-chivo text-4xl font-bold text-white lg:text-5xl">{pageTitle}</h1>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <p className="mt-4 font-dm-sans text-lg text-white/70">{pageSubtitle}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-white px-6 py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <h2 className="text-center font-chivo text-3xl font-bold text-iwb-navy">{storyTitle}</h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <p className="mt-6 text-center font-dm-sans leading-relaxed text-iwb-slate">{storyText}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-[#F5F0EB] px-6 py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2">
            {[
              { title: missionTitle, text: missionText },
              { title: visionTitle, text: visionText },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 100}>
                <div>
                  <h2 className="font-chivo text-2xl font-bold text-iwb-navy">{item.title}</h2>
                  <p className="mt-4 font-dm-sans leading-relaxed text-iwb-slate">{item.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-iwb-teal px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((s, i) => {
              const Icon = s.Icon;
              return (
                <ScrollReveal key={s.label} delay={i * 100}>
                  <div className="text-center">
                    <span className="mx-auto flex size-12 items-center justify-center">
                      <Icon className="size-8 text-iwb-navy" />
                    </span>
                    <p className="mt-3 font-chivo text-3xl font-bold text-iwb-navy">{s.value}</p>
                    <p className="mt-1 font-dm-sans text-sm font-medium text-iwb-navy/80">{s.label}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-iwb-surface px-6 py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <h2 className="text-center font-chivo text-3xl font-bold text-iwb-navy">{valuesTitle}</h2>
          </ScrollReveal>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {values.map((v, i) => {
              const Icon = icons[v.icon];
              return (
                <ScrollReveal key={v.title} delay={i * 100}>
                  <div className="rounded-xl bg-white p-8 text-center shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                    <span className={`mx-auto flex size-14 items-center justify-center rounded-full ${v.color}`}>
                      {Icon ? <Icon className="size-6" /> : null}
                    </span>
                    <p className="mt-4 font-dm-sans text-sm font-semibold text-iwb-navy">{v.title}</p>
                    <p className="mt-2 font-dm-sans text-xs leading-relaxed text-iwb-slate">{v.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="bg-[#F5F0EB] px-6 py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <h2 className="text-center font-chivo text-3xl font-bold text-iwb-navy">{whyTitle}</h2>
          </ScrollReveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {whyChoose.map((item, i) => {
              const Icon = item.Icon;
              return (
                <ScrollReveal key={item.title} delay={i * 100}>
                  <div className="rounded-xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                    <span className="flex size-12 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-5 font-chivo text-lg font-bold text-iwb-navy">{item.title}</h3>
                    <p className="mt-3 font-dm-sans text-sm leading-relaxed text-iwb-slate">{item.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
