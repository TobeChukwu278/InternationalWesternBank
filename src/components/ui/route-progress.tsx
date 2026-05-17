"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // End loading when pathname changes (navigation completed)
  useEffect(() => {
    setLoading(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [pathname]);

  // Intercept link clicks and form submissions to start loading
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

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[200] h-0.5 transition-opacity duration-200"
      style={{ opacity: loading ? 1 : 0, pointerEvents: "none" }}
    >
      <div className="h-full w-full animate-[progress_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-iwb-teal to-transparent" />
    </div>
  );
}
