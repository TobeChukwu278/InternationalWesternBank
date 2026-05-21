"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      if (!anchor.href || anchor.target || anchor.hasAttribute("download")) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey) return;
      try {
        const url = new URL(anchor.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      } catch {
        return;
      }
      setLoading(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setLoading(false), 8000);
    }

    function handleSubmit() {
      setLoading(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setLoading(false), 8000);
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-iwb-navy/30 backdrop-blur-sm">
      <div className="relative flex size-20 items-center justify-center">
        <svg className="absolute inset-0 size-20 animate-[spin_2s_linear_infinite]" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="3" className="text-iwb-teal/15" />
          <circle
            cx="40" cy="40" r="36"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="226"
            strokeDashoffset="56"
            className="text-iwb-teal origin-center"
            style={{ animation: "dash 1.5s ease-in-out infinite" }}
          />
        </svg>
        <svg className="absolute size-12 animate-[spin_3s_linear_infinite_reverse]" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" className="text-iwb-teal/10" />
          <circle
            cx="24" cy="24" r="20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="125"
            strokeDashoffset="31"
            className="text-iwb-navy origin-center"
            style={{ animation: "dash-reverse 2s ease-in-out infinite" }}
          />
        </svg>
        <img src="/logo.png" alt="IWB" className="relative size-8" style={{ animation: "pulse-logo 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}
