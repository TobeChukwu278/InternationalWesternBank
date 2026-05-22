"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BalanceDisplay } from "@/components/ui/balance-display";
import { CopyButton } from "@/components/ui/copy-button";
import { useLocale } from "@/i18n/client";

interface SubAccount {
  id: string;
  type: string;
  balance: number;
  currency: string;
  is_default: boolean;
  created_at: string;
}

export function AccountsClient({
  accountNumber,
  totalBalance,
  subAccounts,
}: {
  accountNumber: string;
  totalBalance: number;
  subAccounts: SubAccount[];
}) {
  const { t } = useLocale();
  const [hidden, setHidden] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">{t("accounts.title")}</h1>
        <p className="mt-1 text-sm text-iwb-slate">{t("accounts.manageAccounts")}</p>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-iwb-navy to-iwb-navy-light p-6 text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-white/60">{t("accounts.accountNumber")}</p>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-white/70">
              {t("accounts.active")}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <p className="font-mono text-lg font-semibold tracking-wider">{accountNumber}</p>
            <CopyButton text={accountNumber} />
          </div>
          <p className="mt-4 text-xs text-white/60">{t("accounts.balance")}</p>
          <BalanceDisplay amount={totalBalance} className="text-3xl font-bold" hidden={hidden} onToggle={() => setHidden(!hidden)} />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {subAccounts.map((sa) => (
          <Card key={sa.id} className="p-5 transition-all hover:shadow-iwb-overlay">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex size-9 items-center justify-center rounded-lg text-xs font-bold ${
                      sa.type === "checking"
                        ? "bg-iwb-teal/10 text-iwb-teal"
                        : "bg-iwb-navy/5 text-iwb-slate"
                    }`}
                  >
                    {sa.type === "checking" ? "C" : "S"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold capitalize text-iwb-navy">{sa.type === "checking" ? t("accounts.checking") : t("accounts.savings")}</p>
                    <p className="text-xs text-iwb-slate">{sa.currency}</p>
                  </div>
                </div>
              </div>
              {sa.is_default ? (
                <span className="rounded-iwb-full bg-iwb-teal/10 px-2 py-0.5 text-[10px] font-medium text-iwb-teal">
                  {t("accounts.default")}
                </span>
              ) : null}
            </div>
            <BalanceDisplay
              amount={Number(sa.balance)}
              className="mt-4 text-2xl font-bold text-iwb-navy"
              hidden={hidden}
              onToggle={() => setHidden(!hidden)}
            />
            <p className="mt-0.5 text-xs text-iwb-slate-light">
              {t("accounts.opened", { date: new Date(sa.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) })}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
