import { t } from "@/i18n/server";

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
            {values.map((v) => (
              <div key={v.title} className="rounded-iwb-xl bg-white p-6 text-center shadow-iwb-card">
                <span className={`mx-auto flex size-14 items-center justify-center rounded-full ${v.color}`}>
                  <i className="material-icons text-2xl">{v.icon}</i>
                </span>
                <p className="mt-4 text-sm font-semibold text-iwb-navy">{v.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
