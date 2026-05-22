import { EmptyState } from "@/components/ui/empty-state";
import { t } from "@/i18n/server";

interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
}

interface SpendingInsightsProps {
  spendingByCategory: SpendingCategory[];
}

const categoryColors: Record<string, string> = {
  shopping: "#0A2540",
  dining: "#00D4AA",
  travel: "#768DAD",
  utilities: "#BA1A1A",
  investment: "#00D4AA",
  other: "#E0E3E6",
};

const categoryLabelKeys: Record<string, string> = {
  shopping: "accounts.categoryShopping",
  dining: "accounts.categoryDining",
  travel: "accounts.categoryTravel",
  utilities: "accounts.categoryUtilities",
  investment: "accounts.categoryInvestment",
  other: "accounts.categoryOther",
};

export async function SpendingInsights({ spendingByCategory }: SpendingInsightsProps) {
  const spendingInsights = await t("dashboard.spendingInsights");
  const noSpending = await t("dashboard.noSpending");
  const noSpendingDesc = await t("dashboard.noSpendingDesc");

  const categoryLabels: Record<string, string> = {};
  for (const [key, labelKey] of Object.entries(categoryLabelKeys)) {
    categoryLabels[key] = await t(labelKey);
  }

  if (spendingByCategory.length === 0) {
    return (
      <div className="rounded-iwb-lg bg-white p-6 shadow-iwb-card">
        <h3 className="mb-4 text-sm font-semibold text-iwb-navy">{spendingInsights}</h3>
        <EmptyState
          title={noSpending}
          description={noSpendingDesc}
        />
      </div>
    );
  }

  const sorted = [...spendingByCategory].sort((a, b) => b.percentage - a.percentage);
  const gradientParts = sorted
    .filter((c) => c.percentage > 0)
    .map((c, i, arr) => {
      const start = arr.slice(0, i).reduce((s, x) => s + x.percentage, 0);
      const end = start + c.percentage;
      const color = categoryColors[c.category] ?? categoryColors.other;
      return `${color} ${start}% ${end}%`;
    });
  const conicGradient = gradientParts.length > 0
    ? `conic-gradient(${gradientParts.join(", ")})`
    : undefined;

  return (
    <div className="rounded-iwb-lg bg-white p-6 shadow-iwb-card">
      <h3 className="mb-4 text-sm font-semibold text-iwb-navy">{spendingInsights}</h3>
      <div className="flex items-center gap-6">
        <div
          className="size-28 shrink-0 rounded-full"
          style={{ background: conicGradient }}
        />
        <div className="space-y-2">
          {sorted.map((c) => (
            <div key={c.category} className="flex items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: categoryColors[c.category] ?? categoryColors.other }}
              />
              <span className="text-xs text-iwb-slate">
                {categoryLabels[c.category] ?? c.category}
              </span>
              <span className="text-xs font-medium text-iwb-navy">
                {c.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
