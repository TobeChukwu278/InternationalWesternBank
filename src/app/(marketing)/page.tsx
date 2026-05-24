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

  const [heroTitle, heroSubtitle, heroOpenAccount, heroSignIn, servicesTitle, servicesDesc, ctaTitle, ctaDesc, ctaRegister, ctaLogin, statsCustomers, statsCustomersLabel, statsCountries, statsCountriesLabel, statsTransferred, statsTransferredLabel, newsTitle, newsReadMore, newsDate1, newsTitle1, newsExcerpt1, newsDate2, newsTitle2, newsExcerpt2, newsDate3, newsTitle3, newsExcerpt3, service1Title, service1Desc, service2Title, service2Desc, service3Title, service3Desc, service4Title, service4Desc, service5Title, service5Desc, service6Title, service6Desc] = await Promise.all([
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

function PhoneTransferSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" rx="16" fill="#0A2540" />
      <rect x="50" y="20" width="170" height="360" rx="24" fill="#1A3A5C" stroke="#2A5A8C" strokeWidth="2" />
      <rect x="125" y="12" width="20" height="6" rx="3" fill="#1A3A5C" />
      <rect x="70" y="38" width="130" height="12" rx="4" fill="#2A5A8C" />
      <rect x="70" y="58" width="100" height="8" rx="4" fill="#2A5A8C" fillOpacity="0.5" />
      <rect x="70" y="85" width="130" height="50" rx="8" fill="#00D4AA" fillOpacity="0.15" />
      <text x="135" y="108" textAnchor="middle" fill="#00D4AA" fontSize="10" fontFamily="DM Sans, sans-serif" fontWeight="600">Transfer</text>
      <text x="135" y="122" textAnchor="middle" fill="#00D4AA" fontSize="16" fontFamily="Chivo, sans-serif" fontWeight="700">$1,250.00</text>
      <rect x="70" y="150" width="130" height="1" fill="#2A5A8C" fillOpacity="0.3" />
      <rect x="70" y="165" width="60" height="6" rx="3" fill="#2A5A8C" fillOpacity="0.5" />
      <rect x="70" y="178" width="100" height="6" rx="3" fill="#2A5A8C" fillOpacity="0.3" />
      <rect x="70" y="200" width="130" height="40" rx="8" fill="#00D4AA" />
      <text x="135" y="224" textAnchor="middle" fill="#0A2540" fontSize="11" fontFamily="DM Sans, sans-serif" fontWeight="700">Send Transfer</text>
      <rect x="270" y="20" width="300" height="200" rx="16" fill="#1A3A5C" />
      <rect x="290" y="40" width="120" height="8" rx="4" fill="#00D4AA" fillOpacity="0.8" />
      <text x="550" y="48" textAnchor="end" fill="#00D4AA" fontSize="11" fontFamily="DM Sans, sans-serif" fontWeight="600">LIVE</text>
      <rect x="290" y="60" width="200" height="6" rx="3" fill="#2A5A8C" fillOpacity="0.5" />
      <rect x="290" y="90" width="260" height="30" rx="6" fill="#0A2540" />
      <text x="300" y="109" fill="#00D4AA" fontSize="10" fontFamily="DM Sans, sans-serif">₦ → $ conversion</text>
      <rect x="290" y="130" width="260" height="30" rx="6" fill="#0A2540" />
      <text x="300" y="149" fill="#00D4AA" fontSize="10" fontFamily="DM Sans, sans-serif">₦250,000.00 → $1,250.00</text>
      <rect x="290" y="170" width="260" height="30" rx="6" fill="#0A2540" />
      <text x="300" y="189" fill="#00D4AA" fontSize="10" fontFamily="DM Sans, sans-serif">Fee: $0.00 · Arrives today</text>
      <rect x="290" y="215" width="80" height="6" rx="3" fill="#2A5A8C" fillOpacity="0.5" />
      <rect x="290" y="230" width="260" height="8" rx="4" fill="#2A5A8C" fillOpacity="0.3" />
      <rect x="270" y="260" width="300" height="100" rx="16" fill="#1A3A5C" />
      <circle cx="310" cy="300" r="20" fill="#00D4AA" fillOpacity="0.2" />
      <path d="M302 300l5 5 10-10" stroke="#00D4AA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="345" y="280" width="100" height="6" rx="3" fill="#2A5A8C" />
      <rect x="345" y="294" width="180" height="5" rx="2.5" fill="#2A5A8C" fillOpacity="0.5" />
      <rect x="345" y="308" width="140" height="5" rx="2.5" fill="#2A5A8C" fillOpacity="0.3" />
    </svg>
  );
}

  const valueProps = [
    {
      icon: <GlobeIcon className="size-7 text-iwb-teal" />,
      stat: statsCustomers,
      statLabel: statsCustomersLabel,
      title: "Global Reach",
      description: "With customers in over 150 countries, International Western Bank connects people and businesses across every continent. Our multi-currency platform supports real-time transactions in 40+ currencies with competitive exchange rates and no hidden fees.",
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80",
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
      image: "",
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
      <section className="bg-iwb-teal px-6 py-28 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <h2 className="font-chivo text-3xl font-bold text-iwb-navy">{servicesTitle}</h2>
            <p className="mt-4 max-w-2xl font-dm-sans text-base leading-relaxed text-iwb-navy/80">{servicesDesc}</p>
          </ScrollReveal>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 100}>
                <div className="group relative overflow-hidden rounded-xl bg-white/10 p-8 backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/20">
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
                  {prop.image ? (
                    <img src={prop.image} alt="" className="h-80 w-full rounded-2xl object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-80 w-full items-center justify-center rounded-2xl bg-iwb-navy/5">
                      <PhoneTransferSvg className="h-full w-full rounded-2xl" />
                    </div>
                  )}
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
        className="py-32 before:absolute before:inset-0 before:bg-gradient-to-r before:from-iwb-teal/80 before:to-iwb-navy/80 before:pointer-events-none before:z-[1]"
      >
        <div className="relative z-20 flex flex-col items-center px-8 text-center sm:px-12 lg:px-16">
          <h2 className="font-chivo text-4xl font-bold text-white lg:text-5xl">{ctaTitle}</h2>
          <p className="mt-6 max-w-2xl font-dm-sans text-lg leading-relaxed text-white/80 lg:text-xl">{ctaDesc}</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-white px-10 py-4 font-dm-sans text-base font-bold text-iwb-navy transition-all hover:bg-iwb-teal"
            >
              {ctaRegister}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white/40 px-10 py-4 font-dm-sans text-base font-bold text-white transition-all hover:border-white hover:bg-white/10"
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
