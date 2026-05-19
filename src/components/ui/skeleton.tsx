export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-iwb-md bg-iwb-surface-dim ${className}`}
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-iwb-lg bg-white p-5 shadow-iwb-card ${className}`}>
      <Skeleton className="mb-3 h-3 w-20" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-iwb-border-light rounded-iwb-lg bg-white shadow-iwb-card">
      <div className="px-6 py-4">
        <Skeleton className="h-3 w-48" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-iwb-lg bg-white p-5 shadow-iwb-card">
      <Skeleton className="mb-6 h-4 w-32" />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="mb-3 flex items-center gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
