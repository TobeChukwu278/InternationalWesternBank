# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-page marketing site (Home, Services, About, Contact) replacing the current login redirect.

**Architecture:** Route group `app/(marketing)/` holds all marketing pages. Shared layout provides Navbar + Footer. Hero has an animated SVG illustration. All text uses existing `t()` i18n infrastructure. Auth check on `/` redirects logged-in users to `/dashboard`.

**Tech Stack:** Next.js 16, Tailwind CSS v4, TypeScript, React Server Components, `pnpm`

---

### Task 1: Marketing layout + Navbar + Footer

**Files:**
- Create: `src/components/features/navbar.tsx`
- Create: `src/components/features/footer.tsx`
- Create: `src/app/(marketing)/layout.tsx`

- [ ] **Step 1: Create Navbar component**

`src/components/features/navbar.tsx` (server component, uses `import { t } from "@/i18n/server"`):

```tsx
import Link from "next/link";
import { t } from "@/i18n/server";

export async function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-iwb-navy/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="IWB" className="size-8" />
          <span className="font-semibold text-white">International WB</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/services" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
            {await t("marketing.nav.services")}
          </Link>
          <Link href="/about" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
            {await t("marketing.nav.about")}
          </Link>
          <Link href="/contact" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
            {await t("marketing.nav.contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            {await t("marketing.nav.signIn")}
          </Link>
          <Link
            href="/signup"
            className="rounded-iwb-md bg-iwb-teal px-4 py-2 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark"
          >
            {await t("marketing.nav.getStarted")}
          </Link>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create Footer component**

`src/components/features/footer.tsx`:

```tsx
import Link from "next/link";
import { LanguageSwitcher } from "@/components/features/language-switcher";
import { t } from "@/i18n/server";

export async function Footer() {
  return (
    <footer className="bg-iwb-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="IWB" className="size-8" />
              <span className="font-semibold">International WB</span>
            </div>
            <p className="mt-3 text-sm text-white/60">
              {await t("marketing.footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              {await t("marketing.footer.company")}
            </h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-white/70 transition-colors hover:text-white">{await t("marketing.nav.home")}</Link></li>
              <li><Link href="/services" className="text-sm text-white/70 transition-colors hover:text-white">{await t("marketing.nav.services")}</Link></li>
              <li><Link href="/about" className="text-sm text-white/70 transition-colors hover:text-white">{await t("marketing.nav.about")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              {await t("marketing.footer.support")}
            </h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-sm text-white/70 transition-colors hover:text-white">{await t("marketing.nav.contact")}</Link></li>
              <li><span className="text-sm text-white/70">{await t("marketing.footer.privacy")}</span></li>
              <li><Link href="/login" className="text-sm text-white/70 transition-colors hover:text-white">{await t("marketing.nav.signIn")}</Link></li>
              <li><Link href="/signup" className="text-sm text-white/70 transition-colors hover:text-white">{await t("marketing.nav.getStarted")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              {await t("marketing.footer.contact")}
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>249 E Ocean Blvd, Long Beach, CA 90802</li>
              <li>+1 (786) 245-4920</li>
              <li>support@internationalwb.com</li>
            </ul>
            <div className="mt-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} International Western Bank. {await t("marketing.footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create marketing layout**

`src/app/(marketing)/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Navbar } from "@/components/features/navbar";
import { Footer } from "@/components/features/footer";

export const metadata: Metadata = {
  title: {
    template: "%s | International Western Bank",
    default: "International Western Bank",
  },
  description: "Secure global banking at your fingertips — send money, manage accounts, track transactions.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/features/navbar.tsx src/components/features/footer.tsx src/app/\(marketing\)/layout.tsx
git commit -m "feat: add marketing navbar, footer, and layout"
```

---

### Task 2: Animated SVG hero illustration

**Files:**
- Create: `src/components/features/hero-illustration.tsx`

- [ ] **Step 1: Create the HeroIllustration component**

A server-compatible inline SVG with CSS animations. Since it uses no hooks or state, it can be a server component.

`src/components/features/hero-illustration.tsx`:

```tsx
export function HeroIllustration() {
  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox="0 0 500 400"
        className="w-full max-w-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pathGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00D4AA" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <style>
            {`
              @keyframes dashMove {
                to { stroke-dashoffset: -100; }
              }
              @keyframes pulse-dot {
                0%, 100% { opacity: 0.3; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); }
              }
              @keyframes float-up {
                0%, 100% { transform: translateY(0); opacity: 0.6; }
                50% { transform: translateY(-8px); opacity: 1; }
              }
              .path-anim {
                stroke-dasharray: 6 4;
                animation: dashMove 2s linear infinite;
              }
              .pulse {
                animation: pulse-dot 2s ease-in-out infinite;
                transform-origin: center;
              }
              .float {
                animation: float-up 3s ease-in-out infinite;
              }
            `}
          </style>
        </defs>

        {/* Simplified world map outline */}
        <g stroke="white" strokeOpacity="0.15" strokeWidth="1.5" fill="none">
          {/* North America */}
          <path d="M80 100 Q90 85 110 85 Q130 85 140 95 Q150 105 145 120 Q140 135 130 140 Q120 145 110 140 Q100 135 95 125 Q85 115 80 100Z" />
          {/* South America */}
          <path d="M120 180 Q130 175 135 185 Q140 200 135 220 Q130 235 120 240 Q110 235 105 220 Q100 205 105 195 Q110 185 120 180Z" />
          {/* Europe */}
          <path d="M210 90 Q220 85 235 85 Q250 85 255 95 Q260 105 255 115 Q250 120 240 120 Q230 120 220 115 Q210 105 210 90Z" />
          {/* Africa */}
          <path d="M225 140 Q235 135 245 140 Q255 150 255 165 Q255 180 245 190 Q235 195 225 190 Q215 180 215 165 Q215 150 225 140Z" />
          {/* Asia */}
          <path d="M280 85 Q300 75 330 75 Q360 75 380 85 Q400 95 405 110 Q410 125 400 130 Q390 135 370 130 Q350 125 330 125 Q310 125 290 120 Q275 110 280 85Z" />
          {/* Australia */}
          <path d="M350 200 Q365 195 380 200 Q390 210 385 220 Q375 230 360 225 Q345 215 350 200Z" />
        </g>

        {/* Grid dots for "connected world" feel */}
        <g fill="white" fillOpacity="0.05">
          {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 12 }).map((_, col) => (
              <circle key={`d-${row}-${col}`} cx={40 + col * 38} cy={30 + row * 45} r="1.5" />
            ))
          )}
        </g>

        {/* Connection paths (Teal dashed lines) */}
        <g stroke="#00D4AA" strokeWidth="2" filter="url(#glow)">
          {/* NA → EU */}
          <path className="path-anim" d="M130 110 Q180 80 230 100" />
          {/* NA → SA */}
          <path className="path-anim" d="M120 140 Q125 160 125 180" />
          {/* EU → AF */}
          <path className="path-anim" d="M240 120 Q240 130 235 140" />
          {/* EU → AS */}
          <path className="path-anim" d="M260 100 Q280 90 300 90" />
          {/* NA → AS */}
          <path className="path-anim" d="M140 105 Q220 60 310 90" />
          {/* AS → AU */}
          <path className="path-anim" d="M340 130 Q360 170 370 200" />
        </g>

        {/* Pulsing origin/destination dots */}
        <g fill="#00D4AA" filter="url(#glow)">
          <circle className="pulse" cx="130" cy="110" r="5" style={{ animationDelay: "0s" }} />
          <circle className="pulse" cx="230" cy="100" r="4" style={{ animationDelay: "0.5s" }} />
          <circle className="pulse" cx="125" cy="180" r="4" style={{ animationDelay: "1s" }} />
          <circle className="pulse" cx="235" cy="140" r="4" style={{ animationDelay: "0.3s" }} />
          <circle className="pulse" cx="300" cy="90" r="5" style={{ animationDelay: "0.7s" }} />
          <circle className="pulse" cx="370" cy="200" r="4" style={{ animationDelay: "1.2s" }} />
        </g>

        {/* Floating currency symbols */}
        <g fill="#00D4AA" fillOpacity="0.6" className="float" style={{ animationDelay: "0s" }}>
          <text x="160" y="85" fontSize="14" fontWeight="bold" fontFamily="sans-serif">$</text>
        </g>
        <g fill="#00D4AA" fillOpacity="0.6" className="float" style={{ animationDelay: "1s" }}>
          <text x="270" y="110" fontSize="12" fontWeight="bold" fontFamily="sans-serif">€</text>
        </g>
        <g fill="#00D4AA" fillOpacity="0.6" className="float" style={{ animationDelay: "0.5s" }}>
          <text x="340" y="100" fontSize="12" fontWeight="bold" fontFamily="sans-serif">£</text>
        </g>
        <g fill="#00D4AA" fillOpacity="0.6" className="float" style={{ animationDelay: "1.5s" }}>
          <text x="180" y="165" fontSize="11" fontWeight="bold" fontFamily="sans-serif">¥</text>
        </g>

        {/* Central globe glow */}
        <circle cx="250" cy="180" r="80" fill="url(#pathGlow)" opacity="0.3" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/hero-illustration.tsx
git commit -m "feat: add animated SVG hero illustration"
```

---

### Task 3: Home page

**Files:**
- Create: `src/app/(marketing)/page.tsx`
- Delete: `src/app/page.tsx`

- [ ] **Step 1: Create Home page**

`src/app/(marketing)/page.tsx`:

The home page has these sections:
1. Check auth → redirect logged-in users to /dashboard
2. Hero section (split layout: text left, SVG right)
3. Services section (6 cards, 3-column grid)
4. Internet Banking CTA (teal background)
5. Stats section (3 numbers)
6. Latest News (3 placeholder cards)
7. Footer is already in the layout

Full server component using `import { t } from "@/i18n/server"` and `import { HeroIllustration } from "@/components/features/hero-illustration"`.

```tsx
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
```

- [ ] **Step 2: Delete old page.tsx**

```bash
rm src/app/page.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(marketing\)/page.tsx
git add -u src/app/page.tsx
git commit -m "feat: add marketing home page with hero, services, cta, stats, news"
```

---

### Task 4: Services page

**Files:**
- Create: `src/app/(marketing)/services/page.tsx`

- [ ] **Step 1: Create Services page**

`src/app/(marketing)/services/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(marketing\)/services/page.tsx
git commit -m "feat: add services page"
```

---

### Task 5: About page

**Files:**
- Create: `src/app/(marketing)/about/page.tsx`

- [ ] **Step 1: Create About page**

`src/app/(marketing)/about/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(marketing\)/about/page.tsx
git commit -m "feat: add about page"
```

---

### Task 6: Contact page

**Files:**
- Create: `src/app/(marketing)/contact/page.tsx`

- [ ] **Step 1: Create Contact page**

`src/app/(marketing)/contact/page.tsx` (server component with a client-form embedded):

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(marketing\)/contact/page.tsx
git commit -m "feat: add contact page"
```

---

### Task 7: Translation keys

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/es.json`
- Modify: `src/i18n/locales/fr.json`

- [ ] **Step 1: Add marketing keys to en.json**

Add a `marketing` section with all keys for nav, hero, services, cta, stats, news, footer, about, contact.

```json
"marketing": {
    "nav": {
      "home": "Home",
      "services": "Services",
      "about": "About Us",
      "contact": "Contact",
      "signIn": "Sign In",
      "getStarted": "Get Started"
    },
    "hero": {
      "title": "Global Banking Without Borders",
      "subtitle": "Send money, manage accounts, and track transactions across 150+ countries — all from one secure platform.",
      "openAccount": "Open an Account",
      "signIn": "Sign In"
    },
    "services": {
      "title": "Our Services",
      "description": "Comprehensive banking solutions for individuals and businesses worldwide.",
      "pageTitle": "Banking Services Designed for You",
      "pageSubtitle": "From personal accounts to business banking, we have everything you need to manage your finances globally.",
      "personalTitle": "Personal Accounts",
      "personalDesc": "Open a personal account in minutes with competitive rates and global access.",
      "businessTitle": "Business Banking",
      "businessDesc": "Tailored solutions for businesses of all sizes, from startups to enterprises.",
      "transfersTitle": "International Transfers",
      "transfersDesc": "Send money to 150+ countries with competitive exchange rates and low fees.",
      "cardsTitle": "Credit & Debit Cards",
      "cardsDesc": "Premium cards with worldwide acceptance, rewards, and travel benefits.",
      "supportTitle": "24/7 Customer Support",
      "supportDesc": "Our dedicated support team is available around the clock to help you.",
      "securityTitle": "Advanced Security",
      "securityDesc": "Bank-grade encryption and multi-factor authentication to protect your money."
    },
    "service1": {
      "title": "International Transfers",
      "description": "Send money to 150+ countries with competitive exchange rates and real-time tracking."
    },
    "service2": {
      "title": "Multi-Currency Accounts",
      "description": "Hold, manage, and exchange multiple currencies in a single account."
    },
    "service3": {
      "title": "Fast Deposits",
      "description": "Deposit funds instantly and start transacting immediately."
    },
    "service4": {
      "title": "Business Banking",
      "description": "Custom solutions for businesses from startups to enterprises."
    },
    "service5": {
      "title": "24/7 Support",
      "description": "Round-the-clock customer service in multiple languages."
    },
    "service6": {
      "title": "Secure Platform",
      "description": "Bank-grade encryption protecting every transaction."
    },
    "cta": {
      "title": "Bank from Anywhere",
      "description": "Manage your money, pay bills, and send transfers — all from our secure internet banking platform.",
      "register": "Register Now",
      "login": "Log In"
    },
    "stats": {
      "customers": "10,000+",
      "customersLabel": "Happy Customers",
      "countries": "150+",
      "countriesLabel": "Countries Served",
      "transferred": "$50M+",
      "transferredLabel": "Transferred",
      "description": "Trusted by thousands of customers worldwide for secure and reliable banking services."
    },
    "news": {
      "title": "Latest News",
      "readMore": "Read More",
      "date1": "January 15, 2026",
      "title1": "Expanding Our Global Reach",
      "excerpt1": "We are excited to announce our expansion into 10 new markets across Asia and Africa...",
      "date2": "December 20, 2025",
      "title2": "New Mobile App Features",
      "excerpt2": "Our latest mobile app update brings biometric authentication, instant transfers, and more...",
      "date3": "November 5, 2025",
      "title3": "Enhanced Security Measures",
      "excerpt3": "We have implemented advanced encryption protocols to ensure your transactions remain secure..."
    },
    "footer": {
      "tagline": "Secure global banking at your fingertips.",
      "company": "Company",
      "support": "Support",
      "contact": "Contact",
      "privacy": "Privacy Policy",
      "copyright": "All rights reserved."
    },
    "about": {
      "pageTitle": "About International Western Bank",
      "pageSubtitle": "Empowering global commerce through secure, accessible banking since 2020.",
      "missionTitle": "Our Mission",
      "missionText": "To provide seamless, secure, and accessible banking services that empower individuals and businesses to transact across borders without friction. We believe that everyone deserves access to global financial services.",
      "visionTitle": "Our Vision",
      "visionText": "A world where financial borders no longer exist. Where sending money across continents is as easy as sending a message. Where every business, regardless of size, can compete globally.",
      "valuesTitle": "Our Values",
      "value1": "Global Reach",
      "value2": "Trust & Security",
      "value3": "Customer First",
      "value4": "Innovation"
    },
    "contact": {
      "pageTitle": "Contact Us",
      "pageSubtitle": "We are here to help. Reach out to our team for any inquiries or support.",
      "nameLabel": "Full Name",
      "emailLabel": "Email Address",
      "subjectLabel": "Subject",
      "messageLabel": "Message",
      "send": "Send Message",
      "address": "Our Address",
      "addressLine1": "249 E Ocean Blvd",
      "addressLine2": "Long Beach, CA 90802, United States",
      "phone": "Phone",
      "email": "Email"
    }
  }
```

- [ ] **Step 2: Add marketing keys to es.json**

Same structure, Spanish translations:
- nav: "Inicio", "Servicios", "Nosotros", "Contacto", "Iniciar Sesión", "Comenzar"
- hero.title: "Banca Global Sin Fronteras"
- services.pageTitle: "Servicios Bancarios Diseñados para Ti"
- cta.title: "Banque desde Cualquier Lugar"
- stats: translate numbers and labels
- footer: translate all
- about: translate all
- contact: translate all

- [ ] **Step 3: Add marketing keys to fr.json**

Same structure, French translations.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/locales/
git commit -m "feat(i18n): add marketing page translation keys"
```

---

### Task 8: Build and verify

- [ ] **Step 1: Run build**

```bash
pnpm build
```

Expected: Compiled successfully, all marketing pages render, no TypeScript errors.

- [ ] **Step 2: Push**

```bash
git push
```
