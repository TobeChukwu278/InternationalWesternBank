"use client";

const categoryIcons: Record<string, string> = {
  shopping: "shopping_bag",
  dining: "restaurant",
  travel: "flight",
  utilities: "bolt",
  investment: "account_balance",
  deposit: "account_balance_wallet",
  transfer: "send",
  withdrawal: "money_off",
  other: "receipt_long",
};

interface CategoryIconProps {
  category: string;
  className?: string;
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const icon = categoryIcons[category] ?? "receipt_long";

  return (
    <span className={`flex w-10 h-10 items-center justify-center rounded-lg bg-iwb-teal/10 ${className ?? ""}`}>
      <i className="material-icons text-iwb-teal">{icon}</i>
    </span>
  );
}
