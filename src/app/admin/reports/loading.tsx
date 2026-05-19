import { SkeletonCard } from "@/components/ui/skeleton";

export default function AdminReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-28 animate-pulse rounded-iwb-md bg-iwb-surface-dim" />
      <div className="grid gap-4 sm:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-iwb-lg bg-white shadow-iwb-card" />
        <div className="h-80 animate-pulse rounded-iwb-lg bg-white shadow-iwb-card" />
      </div>
    </div>
  );
}
