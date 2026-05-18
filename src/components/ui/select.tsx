import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-iwb-navy"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`block w-full rounded-iwb-md border bg-white px-4 py-3 text-sm text-iwb-navy transition-colors duration-200 focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none ${
            error
              ? "border-iwb-error focus:border-iwb-error focus:ring-iwb-error/10"
              : "border-iwb-border hover:border-iwb-teal/50"
          } ${className ?? ""}`}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <p className="flex items-center gap-1 text-xs text-iwb-error">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
