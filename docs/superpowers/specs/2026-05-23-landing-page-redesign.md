# Landing Page Redesign — Bold Color Block

## Goal
Replace the current text-heavy, generic landing page with an information-rich, image-driven, visually bold design using color-block layouts, real photography, distinctive typography, and scroll-triggered motion. The result must feel handcrafted, not AI-generated.

## Design Direction: Bold Color Block
- **Inspired by**: Monzo, Revolut, Stripe — bold color fields, image-dominant layouts, confident typography
- **Colors**: IWB Deep Navy `#0A2540` and Teal `#00D4AA` used as massive background blocks — not thin accents. Warm neutral `#F5F0EB` for content sections.
- **Fonts**: Chivo (headlines — bold, condensed, impactful) + DM Sans (body — clean, friendly, readable)
- **No Material Icons** — custom inline SVG icons matching Chivo's geometric personality
- **Images**: Real Unsplash photography in every section — hero, service cards, testimonials, CTA

## Architecture
- Route group: `src/app/(marketing)/` — unchanged
- Layout: Shared `layout.tsx` in `(marketing)` with Navbar + Footer
- New components: `scroll-reveal.tsx` (wrapper for Intersection Observer animations), `parallax-section.tsx` (background parallax on scroll)
- Scroll motion: Uses native `IntersectionObserver` + CSS transitions — no framer-motion dependency. Lightweight, performant.
- All marketing pages keep their existing routes (`/`, `/services`, `/about`, `/contact`)

## Page Sections (top to bottom)

### 1. Navbar
- IWB logo + bank name
- Nav links: Services, About Us, Contact
- Right: "Sign In" outlined button + "Get Started" filled teal button
- Transparent background at top, solid navy on scroll (with transition)
- Uses existing Navbar component — update styles + add scroll listener

### 2. Hero Section
- Full viewport height, dark navy `#0A2540` background
- Two-column split (50/50):
  - **Left**: Large bold Chivo headline (38–48px), 1–2 sentence supporting paragraph in DM Sans, two CTAs stacked vertically (Get Started filled + Sign In outlined)
  - **Right**: Full-height image filling the column — striking photo (cityscape/global/finance) from Unsplash. The WebGL globe floats over this section as an overlay element near the center.
- Teal accent strip at the bottom of the viewport (`height: 6px, background: #00D4AA`)
- Parallax background on the right image: moves slower than scroll

### 3. Services Grid
- Full-width teal `#00D4AA` background section
- Section title: "Our Services" in Chivo, white text
- 3×2 grid of service cards:
  - Each card: small background photo (darkened) + SVG icon overlay + service title + 1-line description
  - Cards have a slight hover lift effect
  - 6 services: Personal Accounts, Business Banking, International Transfers, Cards & Payments, 24/7 Support, Advanced Security
- Each service has specific, detailed content (not placeholder filler)
- Scroll-reveal animation: cards fade up in staggered sequence

### 4. Why IWB — 3 Value Props
- Warm neutral `#F5F0EB` background
- Three horizontal rows, alternating layout (image left → text right, then image right → text left, etc.)
- Each row contains:
  - **Icon** (SVG, teal)
  - **Stat/number** (large Chivo, e.g. "10,000+" / "150+" / "$50M+")
  - **Bold headline** (Chivo)
  - **Detailed paragraph** (DM Sans) explaining how it works in specific terms
  - **Image**: relevant photograph filling the opposite column
- Scroll-reveal animation: each row fades up on entry

### 5. Testimonials
- Dark navy `#0A2540` background
- Section title in white Chivo
- 3 testimonial cards in a row:
  - Portrait photo (circle crop)
  - Name + location
  - 1–2 sentence quote referencing specific services
- Cards have subtle border glow in teal
- Scroll-reveal animation: staggered card entry

### 6. Internet Banking CTA
- Full-width teal section
- Background: full-bleed image (person using phone/laptop at desk or travel) with teal gradient overlay (opacity ~60%)
- Overlay content: bold headline, 1-sentence description, two CTAs (Register Now / Log In)
- Parallax effect on background image

### 7. Stats + News Bar
- Warm neutral `#F5F0EB` background
- Top half: 3 large stats (10,000+ Customers, 150+ Countries, $50M+ Transferred) with labels and SVG separator dots
- Bottom half: 3 news cards in a row:
  - Small square photo
  - Date label
  - Title
  - 1-line excerpt
  - "Read More" teal link
- Scroll-reveal on news cards

### 8. Footer
- Dark navy `#0A2540` background
- 4-column grid: Logo+tagline, Company links, Support links, Contact info
- Language switcher at bottom
- Copyright line
- Uses existing Footer component — update styles

## Motion & Animation

### ScrollReveal component (`src/components/ui/scroll-reveal.tsx`)
- Wrapper component using Intersection Observer API (no libraries)
- Props: `direction` (up, left, right), `delay` (0–1000ms), `duration` (ms), `threshold` (0–1)
- CSS: `opacity: 0` + `transform: translateY(30px)` initial → `opacity: 1` + `transform: none` when visible
- Transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1)` — an "ease-out-expo" style curve for a polished feel

### ParallaxSection component (`src/components/ui/parallax-section.tsx`)
- Wrapper for sections with background parallax
- Uses `transform: translateY()` on the background element based on scroll position
- Pure CSS `will-change: transform` for performance
- Fallback: no parallax on `prefers-reduced-motion`

### Scroll motion rules
- Hero: no entry animation (it's the first thing — instant)
- Service cards: stagger fade-up, 100ms delay between each card
- Why IWB rows: fade-up per row, 200ms delay
- Testimonials: stagger fade-up, 150ms delay
- News cards: stagger fade-up, 100ms delay
- Parallax: only on hero right image and CTA background image

## Technical Decisions
- **Intersection Observer** over framer-motion — zero JS bundle overhead, same UX quality
- **Parallax via CSS `transform`** — GPU composited, no layout thrashing
- **Images hosted on Unsplash** — direct `images.unsplash.com` URLs, no image loading library needed. Add `loading="lazy"` for below-fold images
- **Fonts**: Google Fonts via `next/font` — Chivo (weight 700, 900) + DM Sans (weight 400, 500, 700)
- **No Material Icons** — inline SVG icons drawn to match Chivo's geometric, condensed character

## Content Changes
- `marketing.*` translation keys are already in en/es/fr.json — content stays, layout changes
- Service descriptions updated to be more specific and detailed
- Testimonial content added (new i18n keys if needed)
- News article descriptions kept

## Files to Create
- `src/components/ui/scroll-reveal.tsx` — Intersection Observer reveal wrapper
- `src/components/ui/parallax-section.tsx` — background parallax wrapper
- `src/components/ui/icons.tsx` — custom SVG icons replacing Material Icons

## Files to Modify
- `src/app/(marketing)/page.tsx` — complete rewrite of sections
- `src/components/features/navbar.tsx` — update styles, add scroll listener
- `src/components/features/footer.tsx` — update styles
- `src/app/(marketing)/layout.tsx` — add font loading for Chivo + DM Sans

## Acceptance Criteria
- Page loads with all sections visible
- Scroll-reveal animations trigger smoothly on scroll
- Parallax background moves on hero and CTA sections
- All images load correctly
- Responsive: stacks to single column on mobile (images below text)
- Icons render as SVGs (no missing Material Icons)
- Chivo + DM Sans fonts applied correctly
- Build passes, TypeScript clean
- i18n works for all translated content
