import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-iwb-teal text-iwb-navy hover:bg-iwb-teal-dark focus:ring-2 focus:ring-iwb-teal/50",
  secondary:
    "border-2 border-iwb-navy text-iwb-navy hover:bg-iwb-navy/5 focus:ring-2 focus:ring-iwb-navy/30",
  ghost:
    "text-iwb-slate hover:text-iwb-navy hover:bg-iwb-navy/5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center rounded-iwb-md px-6 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${className ?? ""}`}
        {...props}
      >
        {loading ? (
          <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
