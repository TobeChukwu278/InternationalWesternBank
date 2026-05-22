import { createServiceClient } from "@/lib/supabase/service";
import { TransferActions } from "./transfer-actions";
import { t } from "@/i18n/server";

export default async function AdminTransfersPage() {
  const svc = createServiceClient();

  const { data: pendingTransfers } = await svc
    .from("transactions")
    .select("*, sub_accounts!from_sub_account_id(accounts!inner(profiles!inner(full_name, email)))")
    .eq("type", "transfer")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const pendingItems = (pendingTransfers ?? []).map((tx: any) => ({
    id: tx.id,
    amount: Number(tx.amount),
    reference: tx.reference,
    description: tx.description ?? "",
    createdAt: tx.created_at,
    scheduledDate: tx.scheduled_date,
    senderName: tx.sub_accounts?.accounts?.profiles?.full_name ?? "Unknown",
    senderEmail: tx.sub_accounts?.accounts?.profiles?.email ?? "Unknown",
  }));

  const { data: completedTransfers } = await svc
    .from("transactions")
    .select("*")
    .eq("type", "transfer")
    .in("status", ["completed", "failed"])
    .order("created_at", { ascending: false })
    .limit(20);

  const [
    transfersTitle,
    transfersSubtitle,
    pendingReviewLabel,
    noPendingLabel,
    allProcessedLabel,
    referenceLabel,
    dateLabel,
    scheduledLabel,
    memoLabel,
    historyLabel,
    noHistoryLabel,
  ] = await Promise.all([
    t("admin.transfers.title"),
    t("admin.transfers.subtitle"),
    t("admin.transfers.pendingReview"),
    t("admin.transfers.noPending"),
    t("admin.transfers.allProcessed"),
    t("admin.transfers.reference"),
    t("admin.transfers.date"),
    t("admin.transfers.scheduled"),
    t("admin.transfers.memo"),
    t("admin.transfers.history"),
    t("admin.transfers.noHistory"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">{transfersTitle}</h1>
        <p className="mt-1 text-sm text-iwb-slate">{transfersSubtitle}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-iwb-navy mb-4">
          {pendingReviewLabel}
          {pendingItems.length > 0 ? (
            <span className="ml-2 rounded-iwb-full bg-iwb-error/10 px-2.5 py-0.5 text-xs font-medium text-iwb-error">
              {pendingItems.length}
            </span>
          ) : null}
        </h2>

        {pendingItems.length === 0 ? (
          <div className="rounded-iwb-xl bg-white p-12 text-center shadow-iwb-card">
            <i className="material-icons text-4xl text-iwb-slate-light mb-3">check_circle</i>
            <p className="text-base font-medium text-iwb-navy">{noPendingLabel}</p>
            <p className="mt-1 text-sm text-iwb-slate">{allProcessedLabel}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="rounded-iwb-lg bg-white shadow-iwb-card border border-iwb-border-light overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-iwb-navy/5">
                        <i className="material-icons text-iwb-slate">swap_horiz</i>
                      </span>
                      <div>
                        <p className="text-sm font-medium text-iwb-navy">{item.senderName}</p>
                        <p className="text-xs text-iwb-slate-light">{item.senderEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-iwb-error">
                        -${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-iwb-slate-light">{referenceLabel}</span>
                      <span className="ml-1 font-mono text-iwb-navy">{item.reference}</span>
                    </div>
                    <div>
                      <span className="text-iwb-slate-light">{dateLabel}</span>
                      <span className="ml-1 text-iwb-navy">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {item.scheduledDate ? (
                      <div>
                        <span className="text-iwb-slate-light">{scheduledLabel}</span>
                        <span className="ml-1 text-iwb-navy">
                          {new Date(item.scheduledDate).toLocaleDateString("en-US", {
                            month: "short", day: "numeric",
                          })}
                        </span>
                      </div>
                    ) : null}
                    <div className="col-span-2">
                      <span className="text-iwb-slate-light">{memoLabel}</span>
                      <span className="ml-1 text-iwb-navy">{item.description || "—"}</span>
                    </div>
                  </div>
                </div>

                <TransferActions transactionId={item.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-iwb-navy mb-4">{historyLabel}</h2>
        {(completedTransfers ?? []).length === 0 ? (
          <p className="text-sm text-iwb-slate">{noHistoryLabel}</p>
        ) : (
          <div className="rounded-iwb-xl bg-white shadow-iwb-card overflow-hidden">
            <div className="divide-y divide-iwb-border-light">
              {(completedTransfers ?? []).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-8 items-center justify-center rounded-full text-xs ${
                        tx.status === "completed"
                          ? "bg-iwb-teal/10 text-iwb-teal"
                          : "bg-iwb-error/10 text-iwb-error"
                      }`}
                    >
                      <i className="material-icons text-sm">
                        {tx.status === "completed" ? "check" : "close"}
                      </i>
                    </span>
                    <div>
                      <p className="text-sm font-medium text-iwb-navy capitalize">{tx.status}</p>
                      <p className="text-xs text-iwb-slate-light font-mono">{tx.reference}</p>
                      {tx.admin_note ? (
                        <p className="text-xs text-iwb-error mt-0.5">{tx.admin_note}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-iwb-navy">
                      ${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-iwb-slate-light">
                      {new Date(tx.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
