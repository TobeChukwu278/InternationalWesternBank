import { Suspense } from "react";
import { PendingContent } from "./pending-content";

export default function PendingVerificationPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <PendingContent />
    </Suspense>
  );
}
