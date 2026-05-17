"use client";

import { useEffect, useCallback } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-iwb-navy/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-[fadeIn_200ms_ease-out,slideUp_200ms_ease-out] rounded-iwb-xl bg-white shadow-iwb-overlay">
        <div className="flex items-center justify-between border-b border-iwb-border-light px-6 py-4">
          <h2 className="text-base font-semibold text-iwb-navy">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-iwb-slate-light transition-colors hover:bg-iwb-surface hover:text-iwb-navy"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
