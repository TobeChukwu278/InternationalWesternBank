"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { SettingsForm } from "@/components/features/settings-form";
import { useToast } from "@/components/ui/toast";
import { useSettings } from "@/components/features/settings-provider";
import { updatePreferences, updatePassword } from "@/lib/actions/settings";

interface SettingsClientProps {
  profile: {
    full_name: string;
    email: string;
    notifications_enabled: boolean;
    preferred_currency: string;
    theme: string;
    created_at: string;
  };
  account: {
    account_number: string;
  };
  userId: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function SettingsClient({ profile, account, userId }: SettingsClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { setTheme, setCurrency } = useSettings();

  const [passwordState, passwordAction, passwordPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await updatePassword(formData);
      if (result.success) {
        showToast("Password updated", "success");
        return null;
      }
      return result;
    },
    null,
  );

  async function handlePreferenceChange(key: string, value: string) {
    const formData = new FormData();
    formData.set("notifications_enabled", key === "notifications_enabled" ? value : String(profile.notifications_enabled));
    formData.set("preferred_currency", key === "preferred_currency" ? value : profile.preferred_currency);
    formData.set("theme", key === "theme" ? value : profile.theme);
    const result = await updatePreferences(formData);
    if (result.success) {
      showToast("Preference updated", "success");
      if (key === "preferred_currency") setCurrency(value);
      if (key === "theme") setTheme(value);
      router.refresh();
    } else {
      showToast(result.error ?? "Failed to update", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">Settings</h1>
        <p className="mt-1 text-sm text-iwb-slate">
          Manage your account settings
        </p>
      </div>

      {/* Profile */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="material-icons text-iwb-teal">person</i>
          <h2 className="text-sm font-semibold text-iwb-navy">Profile</h2>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <span className="flex size-12 items-center justify-center rounded-full bg-iwb-teal/10 text-lg font-bold text-iwb-teal">
            {(profile.full_name || profile.email).charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-medium text-iwb-navy">{profile.full_name || "User"}</p>
            <p className="text-xs text-iwb-slate">{profile.email}</p>
            <p className="text-xs text-iwb-slate-light">Member since {formatDate(profile.created_at)}</p>
          </div>
        </div>
        <SettingsForm currentName={profile.full_name} />
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <i className="material-icons text-iwb-teal">tune</i>
          <h2 className="text-sm font-semibold text-iwb-navy">Preferences</h2>
        </div>
        <div className="space-y-5">
          <Toggle
            checked={profile.notifications_enabled}
            onChange={(checked) => handlePreferenceChange("notifications_enabled", String(checked))}
            label="Email Notifications"
          />
          <div>
            <label className="text-sm text-iwb-navy">Preferred Currency</label>
            <select
              value={profile.preferred_currency}
              onChange={(e) => handlePreferenceChange("preferred_currency", e.target.value)}
              className="mt-1 block w-full rounded-iwb-md border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="NGN">NGN (₦)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-iwb-navy">Theme</label>
            <select
              value={profile.theme}
              onChange={(e) => handlePreferenceChange("theme", e.target.value)}
              className="mt-1 block w-full rounded-iwb-md border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <i className="material-icons text-iwb-teal">lock</i>
          <h2 className="text-sm font-semibold text-iwb-navy">Security</h2>
        </div>
        <form action={passwordAction} className="space-y-4">
          <Input
            label="Current Password"
            name="current_password"
            type="password"
            required
          />
          <Input
            label="New Password"
            name="new_password"
            type="password"
            required
            minLength={6}
          />
          <Input
            label="Confirm New Password"
            name="confirm_password"
            type="password"
            required
            minLength={6}
          />
          {passwordState?.error ? (
            <p className="text-sm text-iwb-error">{passwordState.error}</p>
          ) : null}
          <Button type="submit" loading={passwordPending}>
            Update Password
          </Button>
        </form>
      </Card>

      {/* Account */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <i className="material-icons text-iwb-teal">account_balance</i>
          <h2 className="text-sm font-semibold text-iwb-navy">Account</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-iwb-slate-light">Account Number</p>
              <p className="mt-0.5 font-mono text-sm text-iwb-navy">{account.account_number}</p>
            </div>
            <CopyButton text={account.account_number} />
          </div>
          <div>
            <p className="text-xs font-medium text-iwb-slate-light">User ID</p>
            <p className="mt-0.5 font-mono text-xs text-iwb-slate break-all">{userId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-iwb-slate-light">Member Since</p>
            <p className="mt-0.5 text-sm text-iwb-navy">{formatDate(profile.created_at)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
