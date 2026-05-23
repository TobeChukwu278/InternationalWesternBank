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
