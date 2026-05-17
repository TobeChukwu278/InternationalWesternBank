import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-44 animate-pulse rounded-iwb-md bg-iwb-surface-dim" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded-iwb-md bg-iwb-surface-dim" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <SkeletonChart />
        <SkeletonChart />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="rounded-iwb-lg bg-white p-5 shadow-iwb-card">
      <div className="mb-6 h-4 w-32 animate-pulse rounded-iwb-md bg-iwb-surface-dim" />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="mb-3 flex items-center gap-3">
          <div className="h-3 w-20 animate-pulse rounded-iwb-md bg-iwb-surface-dim" />
          <div className="h-5 flex-1 animate-pulse rounded-iwb-md bg-iwb-surface-dim" />
          <div className="h-3 w-12 animate-pulse rounded-iwb-md bg-iwb-surface-dim" />
        </div>
      ))}
    </div>
  );
}
