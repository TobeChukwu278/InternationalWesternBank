import { t } from "@/i18n/server";

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

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

const icons: Record<string, React.FC<{ className?: string }>> = {
  public: GlobeIcon,
  shield: ShieldIcon,
  handshake: HandshakeIcon,
  trending_up: TrendingUpIcon,
};

export default async function AboutPage() {
  const [pageTitle, pageSubtitle, missionTitle, missionText, visionTitle, visionText, valuesTitle, value1, value2, value3, value4] = await Promise.all([
    t("marketing.about.pageTitle"),
    t("marketing.about.pageSubtitle"),
    t("marketing.about.missionTitle"),
    t("marketing.about.missionText"),
    t("marketing.about.visionTitle"),
    t("marketing.about.visionText"),
    t("marketing.about.valuesTitle"),
    t("marketing.about.value1"),
    t("marketing.about.value2"),
    t("marketing.about.value3"),
    t("marketing.about.value4"),
  ]);

  const values = [
    { icon: "public", title: value1, color: "bg-iwb-teal/10 text-iwb-teal" },
    { icon: "shield", title: value2, color: "bg-iwb-navy/10 text-iwb-navy" },
    { icon: "handshake", title: value3, color: "bg-iwb-teal/10 text-iwb-teal" },
    { icon: "trending_up", title: value4, color: "bg-iwb-navy/10 text-iwb-navy" },
  ];

  return (
    <div>
      <section className="bg-iwb-navy px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-white">{pageTitle}</h1>
          <p className="mt-4 text-lg text-white/70">{pageSubtitle}</p>
        </div>
      </section>

      <section className="bg-white px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-iwb-navy">{missionTitle}</h2>
              <p className="mt-4 text-iwb-slate leading-relaxed">{missionText}</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-iwb-navy">{visionTitle}</h2>
              <p className="mt-4 text-iwb-slate leading-relaxed">{visionText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-iwb-surface px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-iwb-navy">{valuesTitle}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {values.map((v) => {
              const Icon = icons[v.icon];
              return (
                <div key={v.title} className="rounded-iwb-xl bg-white p-6 text-center shadow-iwb-card">
                  <span className={`mx-auto flex size-14 items-center justify-center rounded-full ${v.color}`}>
                    {Icon ? <Icon className="size-6" /> : null}
                  </span>
                  <p className="mt-4 text-sm font-semibold text-iwb-navy">{v.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
