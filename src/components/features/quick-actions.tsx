import Link from "next/link";
import { t } from "@/i18n/server";

export async function QuickActions() {
  const quickActions = [
    {
      label: await t("common.send"),
      href: "/send",
      icon: "send",
    },
    {
      label: await t("common.request"),
      href: "/send?type=request",
      icon: "request_quote",
    },
    {
      label: await t("nav.deposit"),
      href: "/deposit",
      icon: "camera_alt",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {quickActions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex flex-col items-center gap-2 rounded-iwb-lg bg-white p-4 shadow-iwb-card transition-all duration-200 hover:shadow-iwb-overlay hover:-translate-y-0.5"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
            <i className="material-icons text-xl">{action.icon}</i>
          </span>
          <span className="text-xs font-semibold text-iwb-navy">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
