import { createServiceClient } from "@/lib/supabase/service";
import { Card } from "@/components/ui/card";

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

const ITEMS_PER_PAGE = 20;

export default async function AdminTransactionsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp.page) || 1);
  const typeFilter = sp.type || undefined;
  const statusFilter = sp.status || undefined;
  const searchQuery = sp.search || undefined;

  const supabase = createServiceClient();
  let query = supabase
    .from("transaction_details")
    .select("*", { count: "exact" });

  if (typeFilter) query = query.eq("type", typeFilter);
  if (statusFilter) query = query.eq("status", statusFilter);
  if (searchQuery) {
    query = query.or(
      `reference.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,sender_name.ilike.%${searchQuery}%,receiver_name.ilike.%${searchQuery}%,sender_email.ilike.%${searchQuery}%,receiver_email.ilike.%${searchQuery}%`,
    );
  }

  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const { data: txs, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + ITEMS_PER_PAGE - 1);

  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);
  const currentType = sp.type ?? "";
  const currentStatus = sp.status ?? "";

  function buildUrl(updates: Record<string, string>) {
    const params = new URLSearchParams();
    Object.entries({ ...sp, ...updates }).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, v);
    });
    return `/admin/transactions?${params.toString()}`;
  }

  function Pill({
    label,
    value,
    current,
    param,
  }: {
    label: string;
    value: string;
    current: string;
    param: string;
  }) {
    const isActive = current === value || (!current && value === "");
    return (
      <a
        href={buildUrl({ [param]: value, page: "" })}
        className={`whitespace-nowrap rounded-iwb-full px-3 py-1.5 text-xs font-medium transition-colors ${
          isActive
            ? "bg-iwb-navy text-white"
            : "bg-iwb-surface text-iwb-slate hover:bg-iwb-surface-dim"
        }`}
      >
        {label}
      </a>
    );
  }

  const statusStyles: Record<string, string> = {
    completed: "bg-iwb-teal/10 text-iwb-teal",
    pending: "bg-iwb-navy/5 text-iwb-slate",
    failed: "bg-iwb-error/10 text-iwb-error",
  };

  const typeStyles: Record<string, string> = {
    deposit: "text-iwb-teal",
    withdrawal: "text-iwb-error",
    transfer: "text-iwb-navy",
    internal_transfer: "text-iwb-slate-light",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-iwb-navy">Transactions</h1>
          <p className="mt-1 text-sm text-iwb-slate">
            {count ?? 0} transaction{(count ?? 0) !== 1 ? "s" : ""} on the platform
          </p>
        </div>
      </div>

      <Card>
        <div className="border-b border-iwb-border-light px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Pill label="All Types" value="" current={currentType} param="type" />
            <Pill label="Deposits" value="deposit" current={currentType} param="type" />
            <Pill label="Transfers" value="transfer" current={currentType} param="type" />
            <Pill label="Withdrawals" value="withdrawal" current={currentType} param="type" />
            <Pill label="Internal" value="internal_transfer" current={currentType} param="type" />

            <span className="mx-2 h-5 w-px bg-iwb-border-light" />

            <Pill label="All Status" value="" current={currentStatus} param="status" />
            <Pill label="Completed" value="completed" current={currentStatus} param="status" />
            <Pill label="Pending" value="pending" current={currentStatus} param="status" />
            <Pill label="Failed" value="failed" current={currentStatus} param="status" />
          </div>

          <form method="GET" action="/admin/transactions" className="relative mt-4">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-iwb-slate-light"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              name="search"
              type="search"
              defaultValue={searchQuery ?? ""}
              placeholder="Search by reference, description, sender or recipient..."
              className="w-full rounded-iwb-md border border-iwb-border bg-white py-2.5 pl-10 pr-4 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            />
            {(typeFilter || statusFilter) ? (
              <input type="hidden" name="type" value={typeFilter ?? ""} />
            ) : null}
            {statusFilter ? (
              <input type="hidden" name="status" value={statusFilter} />
            ) : null}
          </form>
        </div>

        {txs && txs.length > 0 ? (
          <div>
            <div className="hidden border-b border-iwb-border-light px-6 py-3 text-xs font-medium uppercase tracking-wider text-iwb-slate-light md:grid md:grid-cols-12 md:gap-3">
              <span className="col-span-2">Date</span>
              <span className="col-span-2">Type</span>
              <span className="col-span-2">Sender</span>
              <span className="col-span-2">Recipient</span>
              <span className="col-span-2">Amount</span>
              <span className="col-span-1">Status</span>
              <span className="col-span-1">Ref</span>
            </div>
            <div className="divide-y divide-iwb-border-light">
              {txs.map((tx) => (
                <div
                  key={tx.id}
                  className="px-6 py-3.5 transition-colors hover:bg-iwb-surface/50 md:grid md:grid-cols-12 md:gap-3"
                >
                  <div className="col-span-2 text-xs text-iwb-slate">
                    {new Date(tx.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="col-span-2">
                    <span className={`text-sm font-medium capitalize ${typeStyles[tx.type] ?? "text-iwb-slate"}`}>
                      {tx.type.replace("_", " ")}
                    </span>
                  </div>
                  <div className="col-span-2 truncate text-sm text-iwb-navy">
                    {tx.sender_name ?? <span className="text-iwb-slate-light italic text-xs">—</span>}
                  </div>
                  <div className="col-span-2 truncate text-sm text-iwb-navy">
                    {tx.receiver_name ?? <span className="text-iwb-slate-light italic text-xs">—</span>}
                  </div>
                  <div className="col-span-2 text-sm font-semibold text-iwb-navy">
                    ${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="col-span-1">
                    <span className={`rounded-iwb-full px-2 py-0.5 text-[10px] font-medium ${statusStyles[tx.status] ?? ""}`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </div>
                  <div className="col-span-1 font-mono text-[10px] text-iwb-slate-light" title={tx.reference}>
                    {tx.reference.slice(0, 8)}...
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-iwb-border-light px-6 py-4">
                <p className="text-xs text-iwb-slate">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  {currentPage > 1 ? (
                    <a
                      href={buildUrl({ page: String(currentPage - 1) })}
                      className="rounded-iwb-md px-3 py-1.5 text-sm font-medium text-iwb-navy transition-colors hover:bg-iwb-surface"
                    >
                      Previous
                    </a>
                  ) : null}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        (p >= currentPage - 1 && p <= currentPage + 1),
                    )
                    .map((p, idx, arr) => (
                      <span key={p} className="flex">
                        {idx > 0 && arr[idx - 1] !== p - 1 ? (
                          <span className="px-2 text-xs text-iwb-slate-light">...</span>
                        ) : null}
                        <a
                          href={buildUrl({ page: String(p) })}
                          className={`rounded-iwb-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            p === currentPage
                              ? "bg-iwb-teal text-white"
                              : "text-iwb-navy hover:bg-iwb-surface"
                          }`}
                        >
                          {p}
                        </a>
                      </span>
                    ))}
                  {currentPage < totalPages ? (
                    <a
                      href={buildUrl({ page: String(currentPage + 1) })}
                      className="rounded-iwb-md px-3 py-1.5 text-sm font-medium text-iwb-navy transition-colors hover:bg-iwb-surface"
                    >
                      Next
                    </a>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-16">
            <div className="flex size-14 items-center justify-center rounded-full bg-iwb-surface">
              <svg className="size-7 text-iwb-slate-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-iwb-navy">No transactions found</p>
            <p className="text-xs text-iwb-slate">Try adjusting your filters or search terms</p>
          </div>
        )}
      </Card>
    </div>
  );
}
