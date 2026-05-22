import Link from "next/link";
import { BalanceDisplay } from "@/components/ui/balance-display";
import { t } from "@/i18n/server";

interface SubAccountInfo {
  id: string;
  type: string;
  balance: number;
  accountNumber: string;
}

interface AccountCardsProps {
  subAccounts: SubAccountInfo[];
}

function maskAccountNumber(accountNumber: string): string {
  return "*" + accountNumber.slice(-4);
}

export async function AccountCards({ subAccounts }: AccountCardsProps) {
  const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
    checking: { label: await t("accounts.checking"), icon: "account_balance", color: "bg-iwb-navy/10 text-iwb-navy" },
    savings: { label: await t("accounts.savings"), icon: "savings", color: "bg-iwb-teal/10 text-iwb-teal" },
  };

  return (
    <div className="rounded-iwb-lg bg-white p-6 shadow-iwb-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-iwb-navy">{await t("nav.accounts")}</h3>
        <Link
          href="/accounts"
          className="text-xs font-medium text-iwb-teal transition-colors hover:text-iwb-teal-dark"
        >
          {await t("dashboard.viewAll")}
        </Link>
      </div>
      <div className="space-y-3">
        {subAccounts.map((sa) => {
          const config = typeConfig[sa.type] ?? { label: sa.type, icon: "account_balance", color: "bg-iwb-surface text-iwb-slate" };
          return (
            <div
              key={sa.id}
              className="flex items-center gap-4 rounded-iwb-lg border border-iwb-border-light p-4 transition-colors hover:bg-iwb-surface"
            >
              <span className={`flex size-10 items-center justify-center rounded-full ${config.color}`}>
                <i className="material-icons">{config.icon}</i>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-iwb-navy">{config.label}</p>
                <p className="text-xs text-iwb-slate">{maskAccountNumber(sa.accountNumber)}</p>
              </div>
              <BalanceDisplay amount={sa.balance} className="text-sm font-semibold" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
