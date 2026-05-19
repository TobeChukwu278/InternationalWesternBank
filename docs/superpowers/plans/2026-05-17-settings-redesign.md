# Settings Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the settings page with 4 sections (Profile, Preferences, Security, Account), Material Icons, functional dark mode + currency preference across the app.

**Architecture:** Server fetches profile + account data, passes to SettingsClient. Preferences saved via server actions that update DB + set cookies. ThemeProvider in root layout reads cookie for dark mode. BalanceDisplay accepts optional currency prop for formatting.

**Tech Stack:** Next.js 16 App Router, Supabase (Auth + DB), Material Icons, Tailwind CSS v4, Intl.NumberFormat.

---

### Task 1: DB Migration + Types Update

**Files:**
- Create: `supabase/migrations/00008_settings_preferences.sql`
- Modify: `src/types/database.ts`

- [ ] **Step 1: Create migration SQL**

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'USD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light';
```

- [ ] **Step 2: Update Profile type**

```ts
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  notifications_enabled: boolean;
  preferred_currency: string;
  theme: string;
  created_at: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/00008_settings_preferences.sql src/types/database.ts
git commit -m "feat: add preferences columns to profiles table and types"
```

---

### Task 2: Create Toggle UI Component

**Files:**
- Create: `src/components/ui/toggle.tsx`

- [ ] **Step 1: Create the Toggle component**

A reusable toggle switch matching the design system (teal active state):

```tsx
"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-iwb-navy">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-iwb-teal" : "bg-iwb-border"
        }`}
      >
        <span
          className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/toggle.tsx
git commit -m "feat: add Toggle component"
```

---

### Task 3: Create Server Actions for Settings

**Files:**
- Create: `src/lib/actions/settings.ts`

- [ ] **Step 1: Create server actions**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const notificationsEnabled = formData.get("notifications_enabled") === "true";
  const preferredCurrency = formData.get("preferred_currency") as string;
  const theme = formData.get("theme") as string;

  if (!["USD", "EUR", "GBP", "NGN"].includes(preferredCurrency)) {
    return { error: "Invalid currency" };
  }
  if (!["light", "dark"].includes(theme)) {
    return { error: "Invalid theme" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ notifications_enabled: notificationsEnabled, preferred_currency, theme })
    .eq("id", user.id);

  if (error) return { error: error.message };

  const cookieStore = await cookies();
  cookieStore.set("preferred_currency", preferredCurrency, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  cookieStore.set("theme", theme, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  revalidatePath("/settings", "layout");
  revalidatePath("/dashboard", "layout");

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const currentPassword = formData.get("current_password") as string;
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Current password is incorrect" };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) return { error: updateError.message };

  revalidatePath("/settings", "layout");
  return { success: true };
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/settings.ts
git commit -m "feat: add settings server actions for preferences and password"
```

---

### Task 4: Dark Mode CSS + ThemeProvider

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/features/theme-provider.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add dark mode CSS variables to globals.css**

Add at the end of `src/app/globals.css`:

```css
@custom-variant dark (&:where(.dark, .dark *));

.dark {
  --color-iwb-navy: #e8edf2;
  --color-iwb-navy-light: #d0d8e0;
  --color-iwb-teal: #00d4aa;
  --color-iwb-teal-dark: #00b894;
  --color-iwb-surface: #0f1722;
  --color-iwb-surface-dim: #1a2332;
  --color-iwb-surface-bright: #1a2332;
  --color-iwb-slate: #8fa5c0;
  --color-iwb-slate-light: #6b85a0;
  --color-iwb-error: #ff6b6b;
  --color-iwb-success: #00d4aa;
  --color-iwb-border: #2a3a4e;
  --color-iwb-border-light: #1e2d3d;
  --shadow-iwb-card: 0px 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-iwb-overlay: 0px 8px 24px rgba(0, 0, 0, 0.5);
}
```

- [ ] **Step 2: Create ThemeProvider component**

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SettingsContextType {
  currency: string;
  theme: string;
  setTheme: (theme: string) => void;
  setCurrency: (currency: string) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  currency: "USD",
  theme: "light",
  setTheme: () => {},
  setCurrency: () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
      return match ? match[2] : null;
    };
    const savedTheme = getCookie("theme") || "light";
    const savedCurrency = getCookie("preferred_currency") || "USD";
    setTheme(savedTheme);
    setCurrency(savedCurrency);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <SettingsContext.Provider value={{ currency, theme, setTheme, setCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}
```

- [ ] **Step 3: Add inline script to layout.tsx to prevent flash**

In `src/app/layout.tsx`, add a script inside `<html>` but before `<body>`:

```tsx
<script dangerouslySetInnerHTML={{
  __html: `(function(){var t=document.cookie.match(/(^| )theme=([^;]+)/);if(t&&t[2]==='dark')document.documentElement.classList.add('dark')})()`,
}} />
```

And wrap children with `SettingsProvider`:

```tsx
<body className="bg-iwb-surface font-sans text-iwb-navy antialiased">
  <script dangerouslySetInnerHTML={{
    __html: `(function(){var t=document.cookie.match(/(^| )theme=([^;]+)/);if(t&&t[2]==='dark')document.documentElement.classList.add('dark')})()`,
  }} />
  <RouteProgress />
  <ToastProvider>
    <SettingsProvider>
      {children}
    </SettingsProvider>
  </ToastProvider>
</body>
```

- [ ] **Step 4: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/features/theme-provider.tsx src/app/layout.tsx
git commit -m "feat: add dark mode CSS, ThemeProvider, and SettingsProvider context"
```

---

### Task 5: Update BalanceDisplay with Currency Prop

**Files:**
- Modify: `src/components/ui/balance-display.tsx`

- [ ] **Step 1: Add currency prop**

Accept an optional `currency` prop (default `"USD"`). Use `Intl.NumberFormat` instead of hardcoded `$`:

```tsx
"use client";

import { useState } from "react";

export function BalanceDisplay({
  amount,
  className = "",
  hidden: controlledHidden,
  onToggle,
  currency = "USD",
}: {
  amount: number;
  className?: string;
  hidden?: boolean;
  onToggle?: () => void;
  currency?: string;
}) {
  const [localHidden, setLocalHidden] = useState(false);
  const isControlled = controlledHidden !== undefined && onToggle !== undefined;
  const hidden = isControlled ? controlledHidden : localHidden;

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  function handleClick() {
    if (isControlled) {
      onToggle();
    } else {
      setLocalHidden(!localHidden);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-left transition-all ${className}`}
      title={hidden ? "Show balance" : "Hide balance"}
    >
      <span className={hidden ? "blur-md select-none" : ""}>
        {formatted}
      </span>
      <svg
        className="size-4 shrink-0 opacity-40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {hidden ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        )}
      </svg>
    </button>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/balance-display.tsx
git commit -m "feat: add currency prop to BalanceDisplay with Intl.NumberFormat"
```

---

### Task 6: Create SettingsClient + Rewrite Settings Page

**Files:**
- Create: `src/app/(dashboard)/settings/settings-client.tsx`
- Modify: `src/app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: Create SettingsClient component**

A `"use client"` component with all 4 sections:

```tsx
"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { SettingsForm } from "@/components/features/settings-form";
import { useToast } from "@/components/ui/toast";
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
    formData.set(key, value);
    // Preserve other current values
    formData.set("notifications_enabled", key === "notifications_enabled" ? value : String(profile.notifications_enabled));
    formData.set("preferred_currency", key === "preferred_currency" ? value : profile.preferred_currency);
    formData.set("theme", key === "theme" ? value : profile.theme);
    const result = await updatePreferences(formData);
    if (result.success) {
      showToast("Preference updated", "success");
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
```

- [ ] **Step 2: Rewrite settings page.tsx**

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: account } = await supabase
    .from("accounts")
    .select("account_number")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <SettingsClient
      profile={{
        full_name: profile.full_name,
        email: user.email ?? "",
        notifications_enabled: profile.notifications_enabled ?? true,
        preferred_currency: profile.preferred_currency ?? "USD",
        theme: profile.theme ?? "light",
        created_at: profile.created_at,
      }}
      account={{
        account_number: account?.account_number ?? "N/A",
      }}
      userId={user.id}
    />
  );
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 4: Build check**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/app/(dashboard)/settings/page.tsx src/app/(dashboard)/settings/settings-client.tsx
git commit -m "feat: redesign settings page with Profile, Preferences, Security, Account sections"
```
