import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { t } from "@/i18n/server";
import { HeroIllustration } from "@/components/features/hero-illustration";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const [heroTitle, heroSubtitle, heroOpenAccount, heroSignIn, servicesTitle, servicesDesc, ctaTitle, ctaDesc, ctaRegister, ctaLogin, statsCustomers, statsCustomersLabel, statsCountries, statsCountriesLabel, statsTransferred, statsTransferredLabel, statsDesc, newsTitle, newsReadMore, newsDate1, newsTitle1, newsExcerpt1, newsDate2, newsTitle2, newsExcerpt2, newsDate3, newsTitle3, newsExcerpt3, service1Title, service1Desc, service2Title, service2Desc, service3Title, service3Desc, service4Title, service4Desc, service5Title, service5Desc, service6Title, service6Desc] = await Promise.all([
    t("marketing.hero.title"),
    t("marketing.hero.subtitle"),
    t("marketing.hero.openAccount"),
    t("marketing.hero.signIn"),
    t("marketing.services.title"),
    t("marketing.services.description"),
    t("marketing.cta.title"),
    t("marketing.cta.description"),
    t("marketing.cta.register"),
    t("marketing.cta.login"),
    t("marketing.stats.customers"),
    t("marketing.stats.customersLabel"),
    t("marketing.stats.countries"),
    t("marketing.stats.countriesLabel"),
    t("marketing.stats.transferred"),
    t("marketing.stats.transferredLabel"),
    t("marketing.stats.description"),
    t("marketing.news.title"),
    t("marketing.news.readMore"),
    t("marketing.news.date1"),
    t("marketing.news.title1"),
    t("marketing.news.excerpt1"),
    t("marketing.news.date2"),
    t("marketing.news.title2"),
    t("marketing.news.excerpt2"),
    t("marketing.news.date3"),
    t("marketing.news.title3"),
    t("marketing.news.excerpt3"),
    t("marketing.service1.title"),
    t("marketing.service1.description"),
    t("marketing.service2.title"),
    t("marketing.service2.description"),
    t("marketing.service3.title"),
    t("marketing.service3.description"),
    t("marketing.service4.title"),
    t("marketing.service4.description"),
    t("marketing.service5.title"),
    t("marketing.service5.description"),
    t("marketing.service6.title"),
    t("marketing.service6.description"),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-iwb-navy">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#0a2540,_#001020)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-16 lg:flex-row lg:px-8 lg:py-24">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl font-bold leading-tight text-white lg:text-5xl">
              {heroTitle}
            </h1>
            <p className="mt-4 text-lg text-white/70">
              {heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/signup"
                className="rounded-iwb-md bg-iwb-teal px-6 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark"
              >
                {heroOpenAccount}
              </Link>
              <Link
                href="/login"
                className="rounded-iwb-md border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                {heroSignIn}
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-iwb-surface px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-iwb-navy">{servicesTitle}</h2>
            <p className="mt-2 text-iwb-slate">{servicesDesc}</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "language", title: service1Title, desc: service1Desc },
              { icon: "account_balance", title: service2Title, desc: service2Desc },
              { icon: "bolt", title: service3Title, desc: service3Desc },
              { icon: "business", title: service4Title, desc: service4Desc },
              { icon: "headset_mic", title: service5Title, desc: service5Desc },
              { icon: "lock", title: service6Title, desc: service6Desc },
            ].map((s) => (
              <div
                key={s.title}
                className="rounded-iwb-xl bg-white p-6 shadow-iwb-card transition-all hover:shadow-iwb-overlay"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
                  <i className="material-icons">{s.icon}</i>
                </span>
                <h3 className="mt-4 text-lg font-semibold text-iwb-navy">{s.title}</h3>
                <p className="mt-2 text-sm text-iwb-slate">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internet Banking CTA */}
      <section className="bg-iwb-teal px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-iwb-navy">{ctaTitle}</h2>
          <p className="mt-4 text-iwb-navy/80">{ctaDesc}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-iwb-md bg-iwb-navy px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-iwb-navy-light"
            >
              {ctaRegister}
            </Link>
            <Link
              href="/login"
              className="rounded-iwb-md border-2 border-iwb-navy px-6 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-navy hover:text-white"
            >
              {ctaLogin}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <p className="text-4xl font-bold text-iwb-navy">{statsCustomers}</p>
              <p className="mt-1 text-sm text-iwb-slate">{statsCustomersLabel}</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-iwb-navy">{statsCountries}</p>
              <p className="mt-1 text-sm text-iwb-slate">{statsCountriesLabel}</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-iwb-navy">{statsTransferred}</p>
              <p className="mt-1 text-sm text-iwb-slate">{statsTransferredLabel}</p>
            </div>
          </div>
          <p className="mt-8 text-center text-iwb-slate">{statsDesc}</p>
        </div>
      </section>

      {/* Latest News */}
      <section className="bg-iwb-surface px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-iwb-navy">{newsTitle}</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { date: newsDate1, title: newsTitle1, excerpt: newsExcerpt1 },
              { date: newsDate2, title: newsTitle2, excerpt: newsExcerpt2 },
              { date: newsDate3, title: newsTitle3, excerpt: newsExcerpt3 },
            ].map((post) => (
              <div key={post.title} className="rounded-iwb-xl bg-white p-6 shadow-iwb-card">
                <div className="mb-3 flex h-40 items-center justify-center rounded-iwb-lg bg-iwb-surface">
                  <i className="material-icons text-4xl text-iwb-slate-light">image</i>
                </div>
                <p className="text-xs text-iwb-slate-light">{post.date}</p>
                <h3 className="mt-2 text-base font-semibold text-iwb-navy">{post.title}</h3>
                <p className="mt-2 text-sm text-iwb-slate">{post.excerpt}</p>
                <span className="mt-3 inline-block text-sm font-medium text-iwb-teal">
                  {newsReadMore} &rarr;
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
