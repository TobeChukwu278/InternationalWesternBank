import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { t } from "@/i18n/server";
import { HeroIllustration } from "@/components/features/hero-illustration";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ParallaxSection } from "@/components/ui/parallax-section";
import { GlobeIcon, BuildingIcon, LightningIcon, CreditCardIcon, HeadsetIcon, LockIcon, StarIcon, ArrowRightIcon } from "@/components/ui/icons";

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

  const valueProps = [
    {
      icon: <GlobeIcon className="size-7 text-iwb-teal" />,
      stat: statsCustomers,
      statLabel: statsCustomersLabel,
      title: "Global Reach",
      description: "With customers in over 150 countries, International Western Bank connects people and businesses across every continent. Our multi-currency platform supports real-time transactions in 40+ currencies with competitive exchange rates and no hidden fees.",
      image: "https://images.unsplash.com/photo-1526778548025-fa2f459b5fe6?w=600&q=80",
    },
    {
      icon: <StarIcon className="size-7 text-iwb-teal" />,
      stat: statsCountries,
      statLabel: statsCountriesLabel,
      title: "Countries Served",
      description: "Whether you're sending money to family abroad or managing international payroll for your business, our network spans 150+ countries with local banking partnerships that ensure fast, reliable delivery. Most transfers arrive within 24 hours.",
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
    },
    {
      icon: <LockIcon className="size-7 text-iwb-teal" />,
      stat: statsTransferred,
      statLabel: statsTransferredLabel,
      title: "Transferred Securely",
      description: "Security is our foundation. Every transaction is protected by bank-grade encryption, multi-factor authentication, and 24/7 fraud monitoring. Our compliance team ensures all transfers meet international regulations, giving you peace of mind with every transaction.",
      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=80",
    },
  ];

  const services = [
    { icon: <GlobeIcon className="size-6" />, title: service1Title, desc: service1Desc, img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=60" },
    { icon: <BuildingIcon className="size-6" />, title: service2Title, desc: service2Desc, img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=60" },
    { icon: <LightningIcon className="size-6" />, title: service3Title, desc: service3Desc, img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=60" },
    { icon: <CreditCardIcon className="size-6" />, title: service4Title, desc: service4Desc, img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=60" },
    { icon: <HeadsetIcon className="size-6" />, title: service5Title, desc: service5Desc, img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=60" },
    { icon: <LockIcon className="size-6" />, title: service6Title, desc: service6Desc, img: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&q=60" },
  ];

  const testimonials = [
    { name: "Sarah Chen", location: "Singapore", quote: "I run an e-commerce business sourcing from three continents. IWB's multi-currency accounts save me thousands in conversion fees every month. The transfers are instant and the exchange rates are consistently the best I've found.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" },
    { name: "James Okonkwo", location: "Lagos, Nigeria", quote: "Sending money home used to take days and cost a fortune. With IWB, my family gets funds the same day. The mobile app is incredibly easy to use, and customer support actually picks up the phone when I call.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
    { name: "Maria Gonzalez", location: "Barcelona, Spain", quote: "As a freelance consultant working with US and Asian clients, I needed a bank that understood international business. IWB's dedicated business platform makes invoicing, receiving payments, and tax reporting completely seamless.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" },
  ];

  const newsPosts = [
    { date: newsDate1, title: newsTitle1, excerpt: newsExcerpt1, img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=60" },
    { date: newsDate2, title: newsTitle2, excerpt: newsExcerpt2, img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=60" },
    { date: newsDate3, title: newsTitle3, excerpt: newsExcerpt3, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=60" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-iwb-navy">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <div className="flex flex-1 flex-col justify-center px-6 py-24 lg:px-16">
            <ScrollReveal>
              <h1 className="font-chivo text-4xl font-bold leading-tight text-white lg:text-5xl">
                {heroTitle}
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <p className="mt-4 max-w-md font-dm-sans text-lg text-white/70">
                {heroSubtitle}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg bg-iwb-teal px-8 py-3 font-dm-sans text-sm font-bold text-iwb-navy transition-all hover:bg-white"
                >
                  {heroOpenAccount}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-8 py-3 font-dm-sans text-sm font-bold text-white transition-all hover:border-white hover:bg-white/10"
                >
                  {heroSignIn}
                </Link>
              </div>
            </ScrollReveal>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-iwb-navy/70 to-transparent" />
            <div className="relative z-10 scale-75 lg:scale-100">
              <HeroIllustration />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-iwb-teal" />
      </section>

      {/* Services Grid */}
      <section className="bg-iwb-teal px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <h2 className="font-chivo text-3xl font-bold text-iwb-navy">{servicesTitle}</h2>
            <p className="mt-2 font-dm-sans text-iwb-navy/80">{servicesDesc}</p>
          </ScrollReveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 100}>
                <div className="group relative overflow-hidden rounded-xl bg-white/10 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/20">
                  <div className="absolute inset-0 opacity-10">
                    <img src={s.img} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="relative z-10">
                    <span className="flex size-12 items-center justify-center rounded-full bg-iwb-navy/15 text-iwb-navy">
                      {s.icon}
                    </span>
                    <h3 className="mt-4 font-chivo text-lg font-bold text-iwb-navy">{s.title}</h3>
                    <p className="mt-2 font-dm-sans text-sm text-iwb-navy/80">{s.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why IWB — Value Props */}
      <section className="bg-[#F5F0EB] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {valueProps.map((prop, i) => (
            <ScrollReveal key={prop.title} delay={i * 200}>
              <div className={`flex flex-col items-center gap-8 py-16 lg:flex-row ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                <div className="flex-1">
                  <img src={prop.image} alt="" className="h-80 w-full rounded-2xl object-cover" loading="lazy" />
                </div>
                <div className="flex-1 space-y-4">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-iwb-teal/20">
                    {prop.icon}
                  </span>
                  <p className="font-chivo text-5xl font-bold text-iwb-navy">
                    {prop.stat}
                    <span className="ml-2 font-dm-sans text-lg font-normal text-iwb-slate">{prop.statLabel}</span>
                  </p>
                  <h3 className="font-chivo text-2xl font-bold text-iwb-navy">{prop.title}</h3>
                  <p className="font-dm-sans text-base leading-relaxed text-iwb-slate">{prop.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-iwb-navy px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <h2 className="font-chivo text-3xl font-bold text-white">What Our Customers Say</h2>
          </ScrollReveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 150}>
                <div className="rounded-xl border border-iwb-teal/20 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <img src={t.image} alt={t.name} className="size-12 rounded-full object-cover" loading="lazy" />
                    <div>
                      <p className="font-dm-sans font-bold text-white">{t.name}</p>
                      <p className="font-dm-sans text-sm text-white/50">{t.location}</p>
                    </div>
                  </div>
                  <p className="mt-4 font-dm-sans leading-relaxed text-white/80">&ldquo;{t.quote}&rdquo;</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Internet Banking CTA — Parallax */}
      <ParallaxSection
        bgImage="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80"
        className="py-24"
      >
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <h2 className="font-chivo text-3xl font-bold text-white">{ctaTitle}</h2>
          <p className="mt-4 max-w-2xl font-dm-sans text-lg text-white/80">{ctaDesc}</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 font-dm-sans text-sm font-bold text-iwb-navy transition-all hover:bg-iwb-teal"
            >
              {ctaRegister}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white/40 px-8 py-3 font-dm-sans text-sm font-bold text-white transition-all hover:border-white hover:bg-white/10"
            >
              {ctaLogin}
            </Link>
          </div>
        </div>
      </ParallaxSection>

      {/* Stats + News */}
      <section className="bg-[#F5F0EB] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div>
              <p className="font-chivo text-4xl font-bold text-iwb-navy">{statsCustomers}</p>
              <p className="font-dm-sans text-sm text-iwb-slate">{statsCustomersLabel}</p>
            </div>
            <span className="hidden h-8 w-px bg-iwb-slate/30 md:block" />
            <div>
              <p className="font-chivo text-4xl font-bold text-iwb-navy">{statsCountries}</p>
              <p className="font-dm-sans text-sm text-iwb-slate">{statsCountriesLabel}</p>
            </div>
            <span className="hidden h-8 w-px bg-iwb-slate/30 md:block" />
            <div>
              <p className="font-chivo text-4xl font-bold text-iwb-navy">{statsTransferred}</p>
              <p className="font-dm-sans text-sm text-iwb-slate">{statsTransferredLabel}</p>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-center font-chivo text-3xl font-bold text-iwb-navy">{newsTitle}</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {newsPosts.map((post, i) => (
                <ScrollReveal key={post.title} delay={i * 100}>
                  <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="h-44 overflow-hidden">
                      <img src={post.img} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-5">
                      <p className="font-dm-sans text-xs text-iwb-slate-light">{post.date}</p>
                      <h3 className="mt-2 font-chivo text-base font-bold text-iwb-navy">{post.title}</h3>
                      <p className="mt-2 font-dm-sans text-sm text-iwb-slate">{post.excerpt}</p>
                      <span className="mt-3 inline-flex items-center gap-1 font-dm-sans text-sm font-bold text-iwb-teal">
                        {newsReadMore} <ArrowRightIcon className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
