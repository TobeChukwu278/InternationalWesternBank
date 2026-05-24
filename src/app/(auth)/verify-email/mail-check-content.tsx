"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function MailCheckContent({ loginLink }: { loginLink: string }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/pending-verification");
      }
    });

    const timer = setTimeout(() => {
      setChecking(false);
    }, 8000);

    return () => {
      clearTimeout(timer);
      listener?.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="mt-6">
      {checking ? (
        <div className="flex items-center justify-center gap-2">
          <span className="size-4 animate-spin rounded-full border-2 border-iwb-teal border-t-transparent" />
          <span className="font-dm-sans text-xs text-iwb-slate">Waiting for confirmation...</span>
        </div>
      ) : (
        <a
          href="/login"
          className="inline-block rounded-xl bg-iwb-navy px-6 py-3 font-dm-sans text-sm font-bold text-white transition-all hover:bg-iwb-navy/90"
        >
          {loginLink}
        </a>
      )}
    </div>
  );
}
