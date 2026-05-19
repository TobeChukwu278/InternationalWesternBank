import { EmptyState } from "@/components/ui/empty-state";

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

const categoryLabels: Record<string, string> = {
  shopping: "Shopping",
  dining: "Dining",
  travel: "Travel",
  utilities: "Utilities",
  investment: "Investment",
  other: "Others",
};

export function SpendingInsights({ spendingByCategory }: SpendingInsightsProps) {
  if (spendingByCategory.length === 0) {
    return (
      <div className="rounded-iwb-lg bg-white p-6 shadow-iwb-card">
        <h3 className="mb-4 text-sm font-semibold text-iwb-navy">Spending Insights</h3>
        <EmptyState
          title="No spending this month"
          description="Your spending breakdown will appear here"
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
      <h3 className="mb-4 text-sm font-semibold text-iwb-navy">Spending Insights</h3>
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
