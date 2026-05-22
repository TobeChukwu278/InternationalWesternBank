"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/lib/actions/profile";
import { useToast } from "@/components/ui/toast";
import { useLocale } from "@/i18n/client";

export function SettingsForm({ currentName }: { currentName: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLocale();

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await updateProfile(formData);
      if (result.success) {
        showToast(t("settings.nameUpdated"), "success");
        router.refresh();
        return null;
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <Input
        label={t("settings.fullName")}
        name="full_name"
        type="text"
        defaultValue={currentName}
        required
      />

      {state?.error ? (
        <p className="text-sm text-iwb-error">{state.error}</p>
      ) : null}

      <Button type="submit" loading={pending}>
        {t("settings.saveChanges")}
      </Button>
    </form>
  );
}
