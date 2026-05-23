# Hero Illustration Redesign — Dot-Map Globe

## Goal
Replace the current animated SVG hero illustration (rough continent outlines, floating currency symbols, dashed connection lines) with a polished dot-map globe animation that reads as a professional fintech globe — not "vibecoded" SVG art.

## Current Problems
- Continent paths are rough hand-drawn bezier curves — unrecognizable geography
- Dashed connection lines + pulsing dots is a tired "connected world" trope
- Floating currency symbols ($, €, £, ¥) feel cheap and crypto-like
- Flat composition with no depth or "globe-ness"
- No spatial reference — it looks like shapes floating in a circle, not a globe

## New Design: Animated Dot-Map Globe

### Visual
- **Base**: A perfect circle (~300px diameter) with a radial ocean gradient (deep navy ring at edge → slightly lighter indigo toward center) — reads as Earth from space
- **Continents**: Dot clusters (teal, 1–3px circles with subtle filter glow) placed to form recognizable land masses: North America, South America, Europe, Africa, Asia, Australia. Dots are denser at landmass centers, sparser at edges
- **Depth cues**: 1–2 faint concentric latitude ellipses crossing the sphere (opacity ≤ 0.08) — just enough to say "sphere" without clutter
- **Arc lines**: 4–5 thin teal bezier curves (stroke-opacity 0.2–0.3) connecting financial hubs: NYC↔London, NYC↔Tokyo, London↔Singapore, London↔Sydney, NYC↔São Paulo
- **No currency symbols**, no background grid dots, no dashed strokes

### Animation (CSS keyframes, no JS libraries)
- **Pulsing hubs**: Key financial city dots pulse gently (scale 1→1.4→1, opacity 0.8→1→0.8) on staggered animation-delay (0s, 0.5s, 1s, 1.5s, 2s)
- **Flowing money particles**: Tiny glowing dots (~2px) travel along each arc line — created by duplicating the path with stroke-dashoffset animation to simulate money in transit
- **Ambient breathing**: The entire globe container has a subtle scale pulse (1→1.02→1 over 6s, ease-in-out)

### Technical Approach
- Single `hero-illustration.tsx` component (replaces existing file)
- Responsive: SVG `viewBox="0 0 300 300"`, rendered at `w-full max-w-lg` (~500px)
- Colors: Uses IWB design tokens — `#00D4AA` (Teal) for dots/lines, `#0A2540` (Deep Navy) for background
- All CSS animations inline via `<style>` inside `<defs>`
- No external dependencies, no JS animation libraries

### Layout in Hero Section
- Globe sits on the right side of a two-column hero (left: headline + CTA buttons)
- Dark navy background with subtle radial gradient overlay
- Responsive: stacks vertically on mobile (globe below text)

## Acceptance Criteria
- Reads clearly as a globe at first glance
- Animations are smooth and subtle — no distracting movement
- Dot-map continents are recognizable without being literal
- No currency symbols, no hand-drawn continent outlines
- Works in dark mode (bg is already dark)
- Build passes, TypeScript clean
