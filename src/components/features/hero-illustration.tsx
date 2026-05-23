"use client"

import { Globe } from "@/components/ui/globe"
import type { COBEOptions } from "cobe"

const IWB_GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.4,
  dark: 0.1,
  diffuse: 0.6,
  mapSamples: 16000,
  mapBrightness: 1.5,
  baseColor: [0.04, 0.15, 0.25],
  markerColor: [0, 0.83, 0.67],
  glowColor: [0, 0.83, 0.67],
  markers: [
    { location: [40.7128, -74.006], size: 0.08 },
    { location: [51.5074, -0.1278], size: 0.08 },
    { location: [35.6762, 139.6503], size: 0.06 },
    { location: [1.3521, 103.8198], size: 0.06 },
    { location: [-33.8688, 151.2093], size: 0.06 },
    { location: [-23.5505, -46.6333], size: 0.06 },
  ],
}

export function HeroIllustration() {
  return (
    <div className="relative flex items-center justify-center">
      <Globe config={IWB_GLOBE_CONFIG} className="max-w-[500px]" />
    </div>
  )
}
