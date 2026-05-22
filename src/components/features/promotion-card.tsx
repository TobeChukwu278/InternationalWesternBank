import { t } from "@/i18n/server";

export async function PromotionCard() {
  return (
    <div className="flex items-center justify-between rounded-iwb-lg bg-iwb-teal/5 p-6">
      <div>
        <h3 className="text-lg font-semibold text-iwb-navy">{await t("dashboard.promotionTitle")}</h3>
        <p className="mt-1 text-sm text-iwb-slate">
          {await t("dashboard.promotionDescription")}
        </p>
      </div>
      <button className="shrink-0 rounded-iwb-md bg-iwb-navy px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
        {await t("dashboard.upgradeNow")}
      </button>
    </div>
  );
}
