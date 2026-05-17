import { SkeletonTable } from "@/components/ui/skeleton";

export default function AdminTransactionsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-36 animate-pulse rounded-iwb-md bg-iwb-surface-dim" />
      <SkeletonTable rows={8} />
    </div>
  );
}
