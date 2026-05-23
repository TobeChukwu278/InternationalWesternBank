import { t } from "@/i18n/server";
import { BuildingIcon, CreditCardIcon, HeadsetIcon, LockIcon } from "@/components/ui/icons";

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function TransferIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

const serviceIcons: Record<string, React.FC<{ className?: string }>> = {
  person: PersonIcon,
  business: BuildingIcon,
  swap_horiz: TransferIcon,
  credit_card: CreditCardIcon,
  headset_mic: HeadsetIcon,
  security: LockIcon,
};

export default async function ServicesPage() {
  const [pageTitle, pageSubtitle, personalTitle, personalDesc, businessTitle, businessDesc, transfersTitle, transfersDesc, cardsTitle, cardsDesc, supportTitle, supportDesc, securityTitle, securityDesc] = await Promise.all([
    t("marketing.services.pageTitle"),
    t("marketing.services.pageSubtitle"),
    t("marketing.services.personalTitle"),
    t("marketing.services.personalDesc"),
    t("marketing.services.businessTitle"),
    t("marketing.services.businessDesc"),
    t("marketing.services.transfersTitle"),
    t("marketing.services.transfersDesc"),
    t("marketing.services.cardsTitle"),
    t("marketing.services.cardsDesc"),
    t("marketing.services.supportTitle"),
    t("marketing.services.supportDesc"),
    t("marketing.services.securityTitle"),
    t("marketing.services.securityDesc"),
  ]);

  const services = [
    { icon: "person", title: personalTitle, desc: personalDesc },
    { icon: "business", title: businessTitle, desc: businessDesc },
    { icon: "swap_horiz", title: transfersTitle, desc: transfersDesc },
    { icon: "credit_card", title: cardsTitle, desc: cardsDesc },
    { icon: "headset_mic", title: supportTitle, desc: supportDesc },
    { icon: "security", title: securityTitle, desc: securityDesc },
  ];

  return (
    <div>
      <section className="bg-iwb-navy px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-white">{pageTitle}</h1>
          <p className="mt-4 text-lg text-white/70">{pageSubtitle}</p>
        </div>
      </section>

      <section className="bg-iwb-surface px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => {
              const Icon = serviceIcons[s.icon];
              return (
                <div key={s.title} className="rounded-iwb-xl bg-white p-8 shadow-iwb-card">
                  <span className="flex size-14 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
                    {Icon ? <Icon className="size-6" /> : null}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-iwb-navy">{s.title}</h3>
                  <p className="mt-3 text-sm text-iwb-slate leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
