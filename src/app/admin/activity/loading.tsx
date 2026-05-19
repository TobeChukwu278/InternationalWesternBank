import { SkeletonTable } from "@/components/ui/skeleton";

export default function AdminActivityLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-32 animate-pulse rounded-iwb-md bg-iwb-surface-dim" />
      <SkeletonTable rows={6} />
    </div>
  );
}
