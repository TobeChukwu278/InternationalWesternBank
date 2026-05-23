# Hero Illustration Redesign — WebGL Globe (Magic UI)

## Goal
Replace the custom animated SVG hero illustration with a production-quality WebGL globe using Magic UI's Globe component (Cobe-based). Eliminates "vibecoded" hand-drawn SVG in favor of a polished 3D globe with auto-rotation, drag interaction, and financial hub markers.

## Current Problems
- Hand-drawn SVG continent paths were unrecognizable — not a real globe
- CSS keyframe animations on SVG `r` attribute had cross-browser issues
- Dot-map approach still looked DIY, not production-grade
- Manual SVG is hard to maintain vs. a library component

## Solution: Magic UI WebGL Globe

### Stack
- **Library**: `@magicui/globe` pattern (Cobe v2 + Motion)
- **Dependencies**: `cobe` (WebGL globe rendering), `motion` (spring physics for drag inertia), `clsx` + `tailwind-merge` (class management)
- **File**: `src/components/ui/globe.tsx` — reusable Globe component
- **Wrapper**: `src/components/features/hero-illustration.tsx` — wraps Globe with IWB theme config

### Visual Configuration
- **Base color**: Deep navy `[0.04, 0.15, 0.25]` matching `#0A2540`
- **Marker/glow color**: IWB teal `[0, 0.83, 0.67]` matching `#00D4AA`
- **Markers**: 6 financial hubs — NYC, London, Tokyo, Singapore, Sydney, São Paulo
- **Auto-rotation**: Continuous spin at 0.005 rad/frame
- **Drag**: Mouse/touch drag with spring physics (mass: 1, damping: 30, stiffness: 100)
- **Dark**: 0.1 (slight darkening for depth)
- **Diffuse**: 0.6 (balanced lighting)
- **Map brightness**: 1.5 (bright land masses against dark ocean)
- **Map samples**: 16000 (high detail)

### Technical Notes
- Uses `cobe` v2 API — `onRender` callback removed, replaced with `requestAnimationFrame` loop calling `globe.update()` each frame
- Globe component is `"use client"` — HeroIllustration similarly marked
- `cn()` utility created at `src/lib/utils.ts` for class merging
- Tailwind CSS v4 compatible — uses arbitrary value `max-w-[500px]` for sizing

### Layout in Hero Section
- Globe sits on the right side of a two-column hero (left: headline + CTA buttons)
- Dark navy background with radial gradient overlay (unchanged)
- Responsive: stacks vertically on mobile (globe below text)

## Acceptance Criteria
- Realistic 3D globe renders via WebGL
- Auto-rotates smoothly
- Draggable with spring inertia
- 6 financial hub markers visible as teal dots
- Colors match IWB brand (deep navy + teal)
- Build passes, TypeScript clean
- Smaller, more maintainable code than SVG equivalent
