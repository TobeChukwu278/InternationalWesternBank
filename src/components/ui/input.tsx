import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-iwb-navy"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`block w-full rounded-iwb-md border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none transition-colors duration-200 ${
            error
              ? "border-iwb-error focus:border-iwb-error focus:ring-iwb-error/10"
              : "border-iwb-border"
          } ${className ?? ""}`}
          {...props}
        />
        {error ? (
          <p className="flex items-center gap-1 text-xs text-iwb-error">
            <svg className="size-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0V6Zm-1 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
