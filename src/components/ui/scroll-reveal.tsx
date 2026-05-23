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
      (entries) => {
        const [entry] = entries
        if (!entry?.isIntersecting) return
        el.style.transition = `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
        el.style.opacity = "1"
        el.style.transform = "translate(0, 0)"
        observer.unobserve(el)
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
