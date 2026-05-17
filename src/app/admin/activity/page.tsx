import { createServiceClient } from "@/lib/supabase/service";
import { Card } from "@/components/ui/card";

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

const ITEMS_PER_PAGE = 20;

export default async function AdminActivityPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp.page) || 1);

  const supabase = createServiceClient();
  let query = supabase
    .from("transaction_details")
    .select("*", { count: "exact" })
    .ilike("reference", "ADM%");

  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const { data: actions, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + ITEMS_PER_PAGE - 1);

  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);

  function buildUrl(page: number) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    return `/admin/activity?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-iwb-navy">Activity Log</h1>
          <p className="mt-1 text-sm text-iwb-slate">
            {count ?? 0} admin action{(count ?? 0) !== 1 ? "s" : ""} recorded
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute bottom-0 left-[23px] top-0 w-px bg-iwb-border-light" />

        <div className="space-y-0">
          {actions && actions.length > 0 ? (
            actions.map((action, i) => {
              const isCredit = action.type === "deposit";
              return (
                <div
                  key={action.id}
                  className="relative flex gap-5 px-6 py-5 transition-colors hover:bg-iwb-surface/50"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span
                    className={`relative z-10 mt-0.5 flex size-[46px] shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                      isCredit
                        ? "bg-iwb-teal/10 text-iwb-teal"
                        : "bg-iwb-error/10 text-iwb-error"
                    }`}
                  >
                    {isCredit ? "+" : "−"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-sm font-semibold text-iwb-navy">
                        {isCredit ? "Credit" : "Debit"}
                      </p>
                      <span className="text-sm font-bold" style={{ color: isCredit ? "#00d4aa" : "#ba1a1a" }}>
                        ${Number(action.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-iwb-slate">
                      {action.receiver_name ?? action.sender_name ?? "Unknown user"}
                    </p>
                    {action.description ? (
                      <p className="mt-0.5 text-xs text-iwb-slate-light">
                        {action.description}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[10px] text-iwb-slate-light">
                      {new Date(action.created_at).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="font-mono text-[10px] text-iwb-slate-light" title={action.reference}>
                      {action.reference}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-16">
              <div className="flex size-14 items-center justify-center rounded-full bg-iwb-surface">
                <svg className="size-7 text-iwb-slate-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-iwb-navy">No admin activity yet</p>
              <p className="text-xs text-iwb-slate">
                Admin credit/debit actions will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={buildUrl(p)}
              className={`rounded-iwb-md px-3 py-1.5 text-sm font-medium transition-colors ${
                p === currentPage
                  ? "bg-iwb-teal text-white"
                  : "text-iwb-navy hover:bg-iwb-surface"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
