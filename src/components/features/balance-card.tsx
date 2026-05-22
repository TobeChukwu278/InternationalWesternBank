import { t } from "@/i18n/server";
import { CopyButton } from "@/components/ui/copy-button";
import { BalanceDisplay } from "@/components/ui/balance-display";

interface BalanceCardProps {
  totalBalance: number;
  accountNumber: string;
  trendPercent: number | null;
}

export async function BalanceCard({ totalBalance, accountNumber, trendPercent }: BalanceCardProps) {
  return (
    <div className="rounded-iwb-xl bg-iwb-navy p-6 text-white shadow-iwb-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-iwb-slate-light">{await t("dashboard.totalNetWorth")}</p>
        <span className="flex size-10 items-center justify-center rounded-full bg-white/10">
          <i className="material-icons text-iwb-teal">account_balance_wallet</i>
        </span>
      </div>
      <p className="mt-2 text-4xl font-bold tracking-tight">
        <BalanceDisplay amount={totalBalance} className="text-4xl" />
      </p>
      {trendPercent !== null ? (
        <p className="mt-1 flex items-center gap-1 text-sm text-iwb-teal">
          <i className="material-icons text-base">trending_up</i>
          {await t("dashboard.trendThisMonth", { percent: trendPercent.toFixed(1) })}
        </p>
      ) : null}
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <p className="text-xs text-iwb-slate-light">{await t("accounts.accountNumber")}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="font-mono text-sm tracking-wider">{accountNumber}</span>
            <CopyButton text={accountNumber} />
          </div>
        </div>
      </div>
    </div>
  );
}
