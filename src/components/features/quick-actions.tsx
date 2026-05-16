import Link from "next/link";

const quickActions = [
  {
    label: "Send",
    href: "/send",
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  },
  {
    label: "Deposit",
    href: "#",
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    label: "Pay",
    href: "#",
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    label: "Statements",
    href: "#",
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {quickActions.map((action) => {
        const isLink = action.href !== "#";
        const classes =
          "flex flex-col items-center gap-2 rounded-iwb-lg bg-white p-4 shadow-iwb-card transition-all duration-200 hover:shadow-iwb-overlay hover:-translate-y-0.5";

        return isLink ? (
          <Link key={action.label} href={action.href} className={classes}>
            <span className="flex size-12 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
              {action.icon}
            </span>
            <span className="text-xs font-semibold text-iwb-navy">
              {action.label}
            </span>
          </Link>
        ) : (
          <button key={action.label} className={classes}>
            <span className="flex size-12 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
              {action.icon}
            </span>
            <span className="text-xs font-semibold text-iwb-navy">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
