# Landing Page — Multi-Page Marketing Site

## Goal
Replace the current landing page redirect with a multi-page marketing site inspired by hudsintplc.com, using IWB's existing design system (Deep Navy, Teal, Inter) with a modern fintech feel.

## Pages

| Route | Page | Content |
|-------|------|---------|
| `/` | Home | Navbar, hero with animated SVG, products grid, internet banking CTA, stats section, blog preview, footer |
| `/services` | Services | Account types, cards, banking features |
| `/about` | About Us | Company info, mission, team/values |
| `/contact` | Contact | Contact form, address, support info |

All marketing pages live under `app/(marketing)/` route group.

## Architecture
- **Route group**: `src/app/(marketing)/` — separate from auth and dashboard routes
- **Layout**: Shared `layout.tsx` in `(marketing)` with Navbar and Footer
- **Navbar**: Logo, nav links (Services, About, Contact), "Sign In" → `/login`, "Get Started" → `/signup`
- **Footer**: Logo, tagline, nav columns, address, copyright, language switcher
- **Auth-aware**: `src/app/(marketing)/page.tsx` checks if user is logged in → redirects to `/dashboard`. Unauthenticated visitors see the marketing site.

## Home Page Sections (top to bottom)

### 1. Navbar
- IWB logo (`/logo.png`) + "International Western Bank" text, link to `/`
- Nav links: Services (/services), About (/about), Contact (/contact)
- Right side: "Sign In" text link → `/login`, "Get Started" filled button → `/signup`

### 2. Hero Section
- Full-width Deep Navy (`#0A2540`) background with subtle radial gradient
- Left: Headline ("Global Banking Without Borders" or similar), subtitle about international transfers, two CTA buttons
- Right: Animated inline SVG illustration showing a stylized world map with pulsing connection lines between continents representing money transfers, glow effects, and currency symbols
- The SVG is a React component defined inline, using CSS animations (pulse, dash-offset) for the connection lines

### 3. Our Services
- 3-column card grid, white cards with shadow
- Cards: "International Transfers" (globe icon), "Multi-Currency Accounts" (account_balance icon), "Fast Deposits" (bolt icon), "Business Banking" (briefcase icon), "24/7 Support" (headset icon), "Secure Platform" (lock icon)
- Each card: icon, title, short description

### 4. Internet Banking CTA
- Teal accent background section
- "Bank from Anywhere" headline
- Description about internet banking features
- Two buttons: "Register Now" → `/signup`, "Log In" → `/login`

### 5. Why IWB — Stats
- 3 stats: "10,000+ Customers", "150+ Countries", "$50M+ Transferred"
- Numeric counters (can animate on scroll with simple CSS animation)
- Brief trust-building text

### 6. Latest News
- 3 placeholder blog post cards with image placeholder, date, title, excerpt, "Read More" link
- Static content for now (can be wired to a blog system later)

### 7. Footer
- Logo + tagline
- 3 nav columns: Company (Home, Services, About), Support (Contact, Privacy Policy), Banking (Login, Register)
- Address, email, phone
- Copyright notice
- Language switcher (reuse existing `LanguageSwitcher` component)

## Hero SVG Illustration — Animated

A new component `src/components/features/hero-illustration.tsx`:

- Inline SVG, no external assets
- Stylized world map outline (simplified continent paths)
- Animated dashed lines between continents (CSS `stroke-dashoffset` animation)
- Glowing dots at origin/destination points (CSS `animation: pulse`)
- Small currency symbols ($, €, £) floating along the paths
- Colors: Teal (`#00D4AA`) for active paths, White/light for inactive elements
- Dark Navy background compatibility
- Responsive (scales with container)

## Pages

### Services (`/services`)
- Hero with subtitle "Banking Services Designed for You"
- Grid of service cards with more detail than the home page preview
- Sections: Personal Accounts, Business Accounts, International Transfers, Cards

### About (`/about`)
- Hero with company mission
- About text sections
- Values/team section (static placeholder content)

### Contact (`/contact`)
- Contact form (name, email, subject, message) — posts to a notification or email
- Address, phone, email sidebar
- Note: contact form submission can be a placeholder Toast notification for now

## Route Group & Redirect Logic
- `app/(marketing)/page.tsx` handles `/` (route groups don't change the URL). Old `app/page.tsx` is **deleted** — the marketing group replaces it.
- **Auth check**: `app/(marketing)/page.tsx` checks `supabase.auth.getUser()`, if logged in → `redirect("/dashboard")`, otherwise renders landing page.
- All other marketing pages (`/services`, `/about`, `/contact`) are fully public — no redirect.

## Translation Keys
All marketing pages use existing `t()` infrastructure. Add keys under a `marketing` namespace in `en.json`/`es.json`/`fr.json`:
- `marketing.nav.*`, `marketing.hero.*`, `marketing.services.*`, `marketing.cta.*`, `marketing.stats.*`, `marketing.news.*`, `marketing.footer.*`, `marketing.about.*`, `marketing.contact.*`

## Files Created

| File | Purpose |
|------|---------|
| `src/app/(marketing)/layout.tsx` | Shared Navbar + Footer layout |
| `src/app/(marketing)/page.tsx` | Home page (auth-aware) |
| `src/app/(marketing)/services/page.tsx` | Services page |
| `src/app/(marketing)/about/page.tsx` | About page |
| `src/app/(marketing)/contact/page.tsx` | Contact page |
| `src/components/features/navbar.tsx` | Marketing navbar |
| `src/components/features/footer.tsx` | Marketing footer |
| `src/components/features/hero-illustration.tsx` | Animated SVG illustration |

## Files Modified

| File | Change |
|------|--------|
| `src/app/page.tsx` | **Deleted** — replaced by `(marketing)/page.tsx` |
| `src/i18n/locales/en.json` | Add `marketing.*` keys |
| `src/i18n/locales/es.json` | Sync `marketing.*` keys |
| `src/i18n/locales/fr.json` | Sync `marketing.*` keys |

## Not in Scope
- Blog backend integration (static placeholder content)
- Contact form backend (client-side toast only)
- SEO metadata (can add later)
- Analytics tracking on marketing pages
