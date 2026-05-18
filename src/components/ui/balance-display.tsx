"use client";

import { useState } from "react";

export function BalanceDisplay({
  amount,
  className = "",
  hidden: controlledHidden,
  onToggle,
  currency = "USD",
}: {
  amount: number;
  className?: string;
  hidden?: boolean;
  onToggle?: () => void;
  currency?: string;
}) {
  const [localHidden, setLocalHidden] = useState(false);
  const isControlled = controlledHidden !== undefined && onToggle !== undefined;
  const hidden = isControlled ? controlledHidden : localHidden;

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  function handleClick() {
    if (isControlled) {
      onToggle();
    } else {
      setLocalHidden(!localHidden);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-left transition-all ${className}`}
      title={hidden ? "Show balance" : "Hide balance"}
    >
      <span className={hidden ? "blur-md select-none" : ""}>
        {formatted}
      </span>
      <svg
        className="size-4 shrink-0 opacity-40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {hidden ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        )}
      </svg>
    </button>
  );
}
