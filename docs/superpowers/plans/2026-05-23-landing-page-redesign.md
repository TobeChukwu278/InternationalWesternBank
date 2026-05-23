# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the text-heavy generic landing page with an image-driven, bold color-block design featuring Chivo/DM Sans fonts, scroll-reveal animations, parallax backgrounds, and custom SVG icons.

**Architecture:** Single page (`src/app/(marketing)/page.tsx`) with 8 sections using shared utility components (ScrollReveal, ParallaxSection, Icons). Navbar + Footer get style updates. No new route group.

**Tech Stack:** Next.js 16, Tailwind CSS v4, Intersection Observer API, CSS transforms, next/font (Chivo + DM Sans), Unsplash images.

---

### Task 1: Utility components — ScrollReveal, ParallaxSection, Icons

**Files:**
- Create: `src/components/ui/scroll-reveal.tsx`
- Create: `src/components/ui/parallax-section.tsx`
- Create: `src/components/ui/icons.tsx`

- [ ] **Step 1: Create ScrollReveal component**

```tsx
"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface ScrollRevealProps {
  children: ReactNode
  direction?: "up" | "left" | "right"
  delay?: number
  duration?: number
  threshold?: number
  className?: string
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 600,
  threshold = 0.15,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition = `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
          el.style.opacity = "1"
          el.style.transform = "translate(0, 0)"
          observer.unobserve(el)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [direction, delay, duration, threshold])

  const initialTransform = {
    up: "translateY(30px)",
    left: "translateX(-30px)",
    right: "translateX(30px)",
  }[direction]

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: 0, transform: initialTransform }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create ParallaxSection component**

```tsx
"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface ParallaxSectionProps {
  children: ReactNode
  bgImage: string
  speed?: number
  className?: string
}

export function ParallaxSection({
  children,
  bgImage,
  speed = 0.4,
  className = "",
}: ParallaxSectionProps) {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bgRef.current
    if (!el) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const offset = rect.top * speed
      el.style.transform = `translateY(${offset}px)`
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [speed])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
```

- [ ] **Step 3: Create Icons component**

Create `src/components/ui/icons.tsx` with custom SVG icons replacing Material Icons. Include: `GlobeIcon`, `BuildingIcon`, `LightningIcon`, `CreditCardIcon`, `HeadsetIcon`, `LockIcon`, `ArrowRightIcon`, `StarIcon`, `CheckIcon`.

Each icon is a simple SVG component (24x24 viewBox) that accepts `className` prop. Design them to match Chivo's geometric, condensed character — clean lines, rounded caps, consistent stroke width of 1.5-2px.

- [ ] **Step 4: Build verification**

Run: `pnpm build 2>&1 | tail -10`
Expected: Compiled successfully.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/scroll-reveal.tsx src/components/ui/parallax-section.tsx src/components/ui/icons.tsx
git commit -m "feat(ui): add scroll-reveal, parallax, and custom icon components"
```

---

### Task 2: Load fonts + update marketing layout

**Files:**
- Modify: `src/app/(marketing)/layout.tsx`

- [ ] **Step 1: Add Chivo + DM Sans via next/font**

Read `src/app/(marketing)/layout.tsx` first. Add font loading and apply as CSS variables:

```tsx
import { Chivo, DM_Sans } from "next/font/google"

const chivo = Chivo({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-chivo",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
})
```

Add the classes to the root div:

```tsx
<div className={`${chivo.variable} ${dmSans.variable} flex min-h-screen flex-col`}>
```

- [ ] **Step 2: Build verification**

Run: `pnpm build 2>&1 | tail -10`
Expected: Compiled successfully.

- [ ] **Step 3: Commit**

```bash
git add src/app/(marketing)/layout.tsx
git commit -m "feat(typography): add Chivo and DM Sans fonts via next/font"
```

---

### Task 3: Update Navbar

**Files:**
- Modify: `src/components/features/navbar.tsx`

- [ ] **Step 1: Read current navbar and update**

Read `src/components/features/navbar.tsx`. Make it `"use client"` (needs scroll listener). Add:

1. **Scroll listener**: useState for `scrolled` boolean. useEffect with scroll listener toggling `scrolled` when `window.scrollY > 50`. Cleanup on unmount.
2. **Dynamic bg**: `scrolled ? "bg-iwb-navy shadow-lg" : "bg-transparent"` with transition.
3. **Fonts**: Nav links in DM Sans. Logo text using `var(--font-chivo)` class.
4. **Get Started button**: Filled teal with hover effect.
5. **Sign In**: Outlined white button on transparent, solid navy text on scrolled.
6. Remove Material Icons usage if any.

IMPORTANT: Keep the existing nav link structure and language switcher integration. Only update styles and add scroll behavior.

- [ ] **Step 2: Build verification**

Run: `pnpm build 2>&1 | tail -10`
Expected: Compiled successfully.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/navbar.tsx
git commit -m "feat(navbar): add scroll-aware background, updated styles"
```

---

### Task 4: Update Footer

**Files:**
- Modify: `src/components/features/footer.tsx`

- [ ] **Step 1: Read and update footer**

Read `src/components/features/footer.tsx`. Update styles:
1. Background: `bg-iwb-navy` (already probably correct)
2. Fonts: Logo uses `var(--font-chivo)`, body text in DM Sans
3. Layout: 4-column grid (Logo+tagline, Company, Support, Contact)
4. Language switcher preserved
5. Remove Material Icons — use text or simple SVG indicators instead

Keep all existing nav links and content structure. Just update visual styling.

- [ ] **Step 2: Build verification**

Run: `pnpm build 2>&1 | tail -10`
Expected: Compiled successfully.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/footer.tsx
git commit -m "feat(footer): update styles to match brand identity"
```

---

### Task 5: Rewrite home page with all 8 sections

**Files:**
- Modify: `src/app/(marketing)/page.tsx`

- [ ] **Step 1: Read current page and understand existing i18n key structure**

The current `src/app/(marketing)/page.tsx` uses `t()` for translation keys like `marketing.hero.title`, `marketing.services.title`, etc. The new page MUST:
1. Keep all existing i18n keys — they're already in en/es/fr.json
2. Use `t()` with `Promise.all()` pattern (server component)
3. Add any new i18n keys for new content (testimonials, etc.) — add these to all three dictionaries

- [ ] **Step 2: Write the complete new page.tsx**

The page structure (imports, t() calls, sections):

**Imports needed:**
- `redirect` from next/navigation
- `createClient` from @/lib/supabase/server
- `t` from @/i18n/server
- `Link` from next/link
- `Globe` from @/components/ui/globe (already exists)
- `ScrollReveal` from @/components/ui/scroll-reveal
- `ParallaxSection` from @/components/ui/parallax-section
- Custom icons from @/components/ui/icons

**Section 1: Navbar** — already a separate component, just render it (it handles its own scroll state).

**Section 2: Hero** — Full viewport height, two-column split:
```tsx
<section className="relative min-h-screen bg-iwb-navy overflow-hidden">
  <div className="flex min-h-screen flex-col lg:flex-row">
    {/* Left: Text */}
    <div className="flex flex-1 flex-col justify-center px-6 py-24 lg:px-16">
      <ScrollReveal>
        <h1 className="font-chivo text-4xl font-bold leading-tight text-white lg:text-5xl">
          {heroTitle}
        </h1>
      </ScrollReveal>
      <ScrollReveal delay={150}>
        <p className="mt-4 max-w-md text-lg text-white/70 font-dm-sans">
          {heroSubtitle}
        </p>
      </ScrollReveal>
      <ScrollReveal delay={300}>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link href="/signup" className="inline-flex items-center justify-center rounded-lg bg-iwb-teal px-8 py-3 font-dm-sans text-sm font-bold text-iwb-navy transition-all hover:bg-white">
            {heroOpenAccount}
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-8 py-3 font-dm-sans text-sm font-bold text-white transition-all hover:border-white hover:bg-white/10">
            {heroSignIn}
          </Link>
        </div>
      </ScrollReveal>
    </div>
    {/* Right: Image with globe overlay */}
    <div className="relative flex flex-1 items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-l from-iwb-navy/60 to-transparent" />
      <div className="relative z-10 scale-75 lg:scale-100">
        <Globe config={IWB_GLOBE_CONFIG} className="max-w-[500px]" />
      </div>
    </div>
  </div>
  {/* Teal accent strip */}
  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-iwb-teal" />
</section>
```

**Section 3: Services Grid** — 3×2 grid on teal bg:
```tsx
<section className="bg-iwb-teal px-6 py-24 lg:px-16">
  <div className="mx-auto max-w-7xl">
    <ScrollReveal>
      <h2 className="font-chivo text-3xl font-bold text-iwb-navy">{servicesTitle}</h2>
    </ScrollReveal>
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s, i) => (
        <ScrollReveal key={s.title} delay={i * 100}>
          <div className="group relative overflow-hidden rounded-xl bg-white/10 p-6 backdrop-blur-sm transition-all hover:bg-white/20 hover:-translate-y-1">
            {/* Background image */}
            <div className="absolute inset-0 opacity-20">
              <img src={s.image} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
            {/* Content */}
            <div className="relative z-10">
              <span className="flex size-12 items-center justify-center rounded-full bg-iwb-navy/20 text-iwb-navy">
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
```

The `services` array should use existing i18n values from `marketing.service1.*` through `marketing.service6.*`.

**Section 4: Why IWB** — 3 alternating rows:
```tsx
<section className="bg-[#F5F0EB] px-6 py-24 lg:px-16">
  <div className="mx-auto max-w-7xl">
    {valueProps.map((prop, i) => (
      <ScrollReveal key={prop.title} delay={i * 200}>
        <div className={`flex flex-col gap-8 py-16 ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center`}>
          <div className="flex-1">
            <img src={prop.image} alt="" className="rounded-2xl h-80 w-full object-cover" loading="lazy" />
          </div>
          <div className="flex-1 space-y-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-iwb-teal/20">
              {prop.icon}
            </span>
            <p className="font-chivo text-5xl font-bold text-iwb-navy">{prop.stat}</p>
            <h3 className="font-chivo text-2xl font-bold text-iwb-navy">{prop.title}</h3>
            <p className="font-dm-sans text-base leading-relaxed text-iwb-slate">{prop.description}</p>
          </div>
        </div>
      </ScrollReveal>
    ))}
  </div>
</section>
```

For valueProps content (hardcoded strings — these are marketing copy, not i18n):
- Row 1: "10,000+" / "Global Reach" / detailed paragraph about international presence + image of city skyline
- Row 2: "150+" / "Countries Served" / detailed paragraph about multi-currency support + image of world map/travel
- Row 3: "$50M+" / "Transferred Securely" / detailed paragraph about security infrastructure + image of secure/digital

Use existing `marketing.stats.*` and `marketing.about.*` i18n keys where available.

**Section 5: Testimonials** — 3 cards on navy bg:
Show 3 testimonial cards with portrait images, names, and quotes. Each quote should mention a specific service (transfers, business accounts, etc.) — write them as hardcoded content (not i18n, they're English-first marketing copy).

Background: `bg-iwb-navy`
Layout: 3 cards in a grid, each with rounded portrait photo, name+location, quote.

**Section 6: Internet Banking CTA** — full-bleed teal with parallax:
Use the `ParallaxSection` component with a banking/tech image background + teal gradient overlay.

**Section 7: Stats + News** — warm neutral bg:
- Top: 3 horizontal stats with SVG dot separators
- Bottom: 3 news cards with photos. Use existing `marketing.news.*` keys.

**Section 8: Footer** — already a separate component.

- [ ] **Step 3: Add any new i18n keys if testimonial content uses translations**

If you add testimonials with i18n support, add `marketing.testimonials.*` keys to all three dictionaries. But for simplicity, testimonials can be English-only hardcoded strings — they're marketing copy that's unlikely to need translation.

- [ ] **Step 4: Build verification**

Run: `pnpm build 2>&1 | tail -15`
Expected: Compiled successfully with zero TS errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(home): complete landing page redesign with all sections"
```

---

### Task 6: Final verification and cleanup

**Files:** None

- [ ] **Step 1: Run full build**

Run: `pnpm build`
Expected: Compiled successfully, all pages generated.

- [ ] **Step 2: Check for any remaining Material Icons references in marketing pages**

Grep for `material-icons` in `src/app/(marketing)/` and `src/components/features/navbar.tsx`, `src/components/features/footer.tsx`. Remove any remaining references.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: cleanup remaining Material Icons references"
```
