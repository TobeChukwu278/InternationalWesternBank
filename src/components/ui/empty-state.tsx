interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16">
      {icon ?? (
        <div className="flex size-14 items-center justify-center rounded-full bg-iwb-surface">
          <svg className="size-7 text-iwb-slate-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <div className="text-center">
        <p className="text-sm font-medium text-iwb-navy">{title}</p>
        {description ? <p className="mt-1 text-xs text-iwb-slate">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
