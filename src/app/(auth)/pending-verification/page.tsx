import { Suspense } from "react";
import { t } from "@/i18n/server";
import { PendingContent } from "./pending-content";

export default async function PendingVerificationPage() {
  const loadingText = await t("common.loading");
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">{loadingText}</div>}>
      <PendingContent />
    </Suspense>
  );
}
