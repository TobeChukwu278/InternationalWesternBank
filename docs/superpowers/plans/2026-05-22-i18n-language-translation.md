# i18n Language Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full-application i18n with English, Spanish, and French, defaulting to browser language and switchable from Settings.

**Architecture:** Cookie/settings-based locale (no URL prefix). LocaleProvider client context wraps root layout. Server-side `t()` reads cookie. Preference persisted to `profiles.language` column and `iwb_locale` cookie. Translation dictionaries are JSON files loaded lazily via dynamic import and cached.

**Tech Stack:** Next.js 16 App Router, Supabase (profiles.language), React Context, JSON dictionaries, cookies via `next/headers`.

---

### Task 1: Migration + i18n config

**Files:**
- Create: `supabase/migrations/00013_add_language.sql`
- Create: `src/i18n/config.ts`

- [ ] **Step 1: Create migration**

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
```

- [ ] **Step 2: Create i18n config**

```typescript
export const defaultLocale = "en" as const;

export const locales = ["en", "es", "fr"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

export function isSupported(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return defaultLocale;
  const raw = navigator.language.split("-")[0] ?? defaultLocale;
  return isSupported(raw) ? raw : defaultLocale;
}
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/00013_add_language.sql src/i18n/config.ts
git commit -m "feat(i18n): add language migration and locale config"
```

---

### Task 2: English translation dictionary

**Files:**
- Create: `src/i18n/locales/en.json`

- [ ] **Step 1: Create en.json with ALL keys**

Create the file with complete dot-notation keys for every user-facing string in the app. Here are all key sections (the file should contain actual string values for every key):

```
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "back": "Back",
    "continue": "Continue",
    "submit": "Submit",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "close": "Close",
    "confirm": "Confirm",
    "delete": "Delete",
    "edit": "Edit",
    "view": "View",
    "search": "Search",
    "noResults": "No results found",
    "copy": "Copy",
    "copied": "Copied!",
    "noData": "No data available",
    "retry": "Retry",
    "send": "Send",
    "receive": "Receive",
    "status": "Status"
  },
  "nav": {
    "dashboard": "Dashboard",
    "accounts": "Accounts",
    "send": "Send Money",
    "transactions": "Transactions",
    "deposit": "Deposit",
    "statements": "Statements",
    "settings": "Settings",
    "notifications": "Notifications",
    "signOut": "Sign Out",
    "overview": "Overview",
    "users": "Users",
    "transfers": "Transfers",
    "kyc": "KYC Verifications",
    "activity": "Activity Log",
    "reports": "Reports",
    "adminPanel": "Admin Panel",
    "adminDashboard": "Dashboard",
    "toggleNav": "Toggle navigation",
    "language": "Language"
  },
  "auth": {
    "login": {
      "title": "Welcome Back",
      "subtitle": "Sign in to your IWB account",
      "emailLabel": "Email",
      "emailPlaceholder": "Enter your email",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Enter your password",
      "signIn": "Sign In",
      "signingIn": "Signing in...",
      "noAccount": "Don't have an account?",
      "createAccount": "Create one",
      "error": "Invalid email or password"
    },
    "signup": {
      "title": "Create account",
      "step": "Step {{current}} of 3: {{name}}",
      "personalInfo": "Personal Info",
      "identity": "Identity",
      "review": "Review",
      "successTitle": "Account created!",
      "successMessage": "Your registration has been submitted for verification.",
      "creatingAccount": "Creating your account...",
      "uploadingDocs": "Uploading your documents..."
    },
    "pendingVerification": {
      "title": "Verification in Progress",
      "pendingMessage": "Your account is pending verification. This usually takes 1-2 business days.",
      "rejectedTitle": "Verification Failed",
      "rejectedMessage": "Your account verification was not approved.",
      "reason": "Reason",
      "contactSupport": "Please contact support for more information.",
      "signedOut": "You have been signed out."
    }
  },
  "personalInfo": {
    "fullName": "Full Name",
    "fullNamePlaceholder": "John Doe",
    "email": "Email",
    "emailPlaceholder": "john@example.com",
    "password": "Password",
    "passwordPlaceholder": "Create a strong password",
    "phone": "Phone Number",
    "phonePlaceholder": "+1 (555) 000-0000",
    "dateOfBirth": "Date of Birth",
    "address": "Address",
    "addressPlaceholder": "123 Main Street",
    "city": "City",
    "cityPlaceholder": "New York",
    "state": "State",
    "statePlaceholder": "NY",
    "zipCode": "ZIP Code",
    "zipPlaceholder": "10001",
    "ssnLastFour": "SSN (Last 4 digits)",
    "ssnPlaceholder": "1234",
    "ssnHelp": "For identity verification purposes"
  },
  "identityDocs": {
    "profilePhoto": "Profile Photo",
    "profilePhotoHelp": "JPG or PNG recommended",
    "idFront": "Driver's License / State ID — Front",
    "idFrontHelp": "Clear photo, all details visible",
    "idBack": "Driver's License / State ID — Back",
    "idBackHelp": "Clear photo, barcode visible",
    "uploadPhoto": "Upload profile photo",
    "uploadFront": "Upload front of ID",
    "uploadBack": "Upload back of ID"
  },
  "reviewSubmit": {
    "title": "Review Your Information",
    "subtitle": "Please verify everything is correct before submitting",
    "personalDetails": "Personal Details",
    "documents": "Documents",
    "idDocument": "ID Document",
    "agree": "By submitting, you agree to our",
    "termsOfService": "Terms of Service",
    "and": "and",
    "privacyPolicy": "Privacy Policy",
    "submit": "Submit Application",
    "submitting": "Submitting..."
  },
  "dashboard": {
    "welcome": "Welcome back, {{name}}",
    "totalBalance": "Total Balance",
    "recentTransactions": "Recent Transactions",
    "viewAll": "View All",
    "quickActions": "Quick Actions",
    "noTransactions": "No recent transactions",
    "spendingInsights": "Spending Insights",
    "promotions": "Special Offers",
    "learnMore": "Learn More"
  },
  "accounts": {
    "title": "Your Accounts",
    "checking": "Checking",
    "savings": "Savings",
    "credit": "Credit",
    "balance": "Balance",
    "accountNumber": "Account Number",
    "openDate": "Opened",
    "status": "Status",
    "active": "Active",
    "inactive": "Inactive",
    "frozen": "Frozen",
    "noAccounts": "No accounts found",
    "totalAcrossAccounts": "Total across all accounts"
  },
  "send": {
    "title": "Send Money",
    "recipient": "Recipient",
    "recipientPlaceholder": "Search by name, email, or account number",
    "amount": "Amount",
    "amountPlaceholder": "0.00",
    "description": "Description (optional)",
    "descriptionPlaceholder": "What's this for?",
    "schedule": "Schedule",
    "scheduleNow": "Send now",
    "scheduleLater": "Schedule for later",
    "scheduleDate": "Scheduled Date",
    "review": "Review Transfer",
    "confirm": "Confirm Transfer",
    "sending": "Processing...",
    "success": "Transfer sent successfully!",
    "pendingApproval": "Pending Approval",
    "pendingApprovalMessage": "Your transfer has been submitted and is pending admin approval.",
    "fromAccount": "From Account",
    "insufficientFunds": "Insufficient funds",
    "failed": "Transfer failed",
    "scheduled": "Scheduled Transfer",
    "scheduledMessage": "Your transfer has been scheduled."
  },
  "transactions": {
    "title": "Transactions",
    "allTransactions": "All Transactions",
    "export": "Export CSV",
    "exporting": "Exporting...",
    "filter": "Filter",
    "dateRange": "Date Range",
    "type": "Type",
    "all": "All",
    "credit": "Credit",
    "debit": "Debit",
    "transfer": "Transfer",
    "payment": "Payment",
    "deposit": "Deposit",
    "withdrawal": "Withdrawal",
    "amount": "Amount",
    "description": "Description",
    "date": "Date",
    "status": "Status",
    "completed": "Completed",
    "pending": "Pending",
    "failed": "Failed",
    "receipt": "View Receipt",
    "receiptTitle": "Transaction Receipt",
    "receiptId": "Transaction ID",
    "receiptDate": "Date",
    "receiptFrom": "From",
    "receiptTo": "To",
    "receiptDescription": "Description",
    "receiptAmount": "Amount",
    "receiptStatus": "Status",
    "receiptMethod": "Payment Method",
    "receiptReference": "Reference",
    "downloadReceipt": "Download Receipt",
    "noTransactions": "No transactions found"
  },
  "deposit": {
    "title": "Deposit Funds",
    "subtitle": "Add funds to your account",
    "amount": "Deposit Amount",
    "amountPlaceholder": "0.00",
    "fromAccount": "From Account (External)",
    "accountPlaceholder": "Enter external account number",
    "description": "Description (optional)",
    "descriptionPlaceholder": "e.g. Paycheck deposit",
    "submit": "Submit Deposit Request",
    "submitting": "Submitting...",
    "success": "Deposit request submitted for approval!",
    "pending": "Your deposit is pending admin approval.",
    "failed": "Deposit failed"
  },
  "statements": {
    "title": "Account Statements",
    "subtitle": "Download monthly statements for your accounts",
    "selectAccount": "Select Account",
    "selectMonth": "Select Month",
    "generate": "Generate Statement",
    "generating": "Generating...",
    "download": "Download",
    "noStatement": "No statement available for this period",
    "statementFor": "Statement for {{account}} - {{month}}"
  },
  "settings": {
    "title": "Settings",
    "profile": "Profile Settings",
    "fullName": "Full Name",
    "phone": "Phone",
    "address": "Address",
    "city": "City",
    "state": "State",
    "zip": "ZIP Code",
    "saving": "Saving...",
    "saved": "Settings saved successfully",
    "saveFailed": "Failed to save settings",
    "password": "Change Password",
    "currentPassword": "Current Password",
    "newPassword": "New Password",
    "confirmPassword": "Confirm New Password",
    "updatePassword": "Update Password",
    "passwordUpdated": "Password updated successfully",
    "language": "Language",
    "languageDescription": "Choose your preferred language"
  },
  "notifications": {
    "title": "Notifications",
    "noNotifications": "No notifications yet",
    "markRead": "Mark as read",
    "markAllRead": "Mark all as read",
    "system": "System",
    "transfer": "Transfer",
    "deposit": "Deposit",
    "admin": "Admin",
    "newNotification": "New notification"
  },
  "admin": {
    "login": {
      "title": "Admin Access",
      "subtitle": "Enter the admin password to continue",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Enter admin password",
      "submit": "Access Admin Panel",
      "verifying": "Verifying...",
      "error": "Invalid password"
    },
    "dashboard": {
      "title": "Admin Dashboard",
      "totalUsers": "Total Users",
      "activeAccounts": "Active Accounts",
      "pendingKyc": "Pending KYC",
      "recentActivity": "Recent Activity",
      "totalDeposits": "Total Deposits",
      "totalTransfers": "Total Transfers"
    },
    "users": {
      "title": "User Management",
      "searchPlaceholder": "Search by name or email...",
      "noUsers": "No users found",
      "credit": "Credit Account",
      "debit": "Debit Account",
      "creditTitle": "Credit User Account",
      "debitTitle": "Debit User Account",
      "amount": "Amount",
      "reason": "Reason",
      "submit": "Submit",
      "success": "Account updated successfully",
      "failed": "Operation failed"
    },
    "kyc": {
      "title": "KYC Verifications",
      "subtitle": "Review and verify new account registrations",
      "pendingReview": "Pending Review",
      "noPending": "No pending verifications",
      "allReviewed": "All registrations have been reviewed",
      "history": "History",
      "noHistory": "No verified or rejected users yet",
      "phone": "Phone",
      "dob": "DOB",
      "address": "Address",
      "ssn": "SSN (last 4)",
      "viewIdFront": "View ID Front",
      "viewIdBack": "View ID Back",
      "approve": "Approve",
      "reject": "Reject",
      "rejectReason": "Reason for rejection...",
      "confirmReject": "Confirm Reject",
      "cancel": "Cancel",
      "submitted": "Submitted"
    },
    "transfers": {
      "title": "Transfer Approvals",
      "subtitle": "Review and approve pending transfers",
      "pendingReview": "Pending Approval",
      "noPending": "No pending transfers",
      "amount": "Amount",
      "from": "From",
      "to": "To",
      "description": "Description",
      "date": "Date",
      "approve": "Approve",
      "reject": "Reject",
      "reason": "Rejection reason...",
      "confirmReject": "Confirm Reject",
      "cancel": "Cancel",
      "history": "Transfer History",
      "noHistory": "No processed transfers yet"
    },
    "deposits": {
      "title": "Deposit Requests",
      "subtitle": "Review and approve deposit requests",
      "pendingReview": "Pending Approval",
      "noPending": "No pending deposit requests",
      "amount": "Amount",
      "user": "User",
      "fromAccount": "From Account",
      "description": "Description",
      "date": "Date",
      "approve": "Approve",
      "reject": "Reject",
      "reason": "Rejection reason...",
      "confirmReject": "Confirm Reject",
      "cancel": "Cancel",
      "history": "Deposit History",
      "noHistory": "No processed deposits yet"
    },
    "activity": {
      "title": "Activity Log",
      "subtitle": "Monitor all system activity",
      "noActivity": "No activity found",
      "user": "User",
      "action": "Action",
      "details": "Details",
      "date": "Date"
    },
    "reports": {
      "title": "Reports",
      "subtitle": "Generate and download system reports",
      "totalUsers": "Total Users",
      "totalAccounts": "Total Accounts",
      "totalDeposits": "Total Deposits",
      "totalTransfers": "Total Transfers",
      "pendingKyc": "Pending KYC Verifications",
      "userGrowth": "User Growth (Last 30 Days)",
      "exportReport": "Export Report",
      "exporting": "Exporting..."
    }
  },
  "adminCommon": {
    "viewAll": "View All",
    "search": "Search"
  },
  "transferActions": {
    "id": "ID",
    "sender": "Sender",
    "recipient": "Recipient",
    "amount": "Amount",
    "description": "Description",
    "date": "Date",
    "status": "Status",
    "adminNote": "Admin Note",
    "approve": "Approve",
    "reject": "Reject",
    "cancel": "Cancel",
    "confirmReject": "Confirm Reject",
    "rejectReason": "Rejection reason..."
  },
  "notifMessages": {
    "registrationSubmitted": "Registration Submitted",
    "registrationSubmittedBody": "Your account registration has been submitted and is pending verification. We'll notify you once it's approved.",
    "accountApproved": "Account Approved",
    "accountApprovedBody": "Your account has been verified and approved. You can now access all IWB banking services.",
    "accountRejected": "Account Rejected",
    "accountRejectedBody": "Your account registration has been rejected. Reason: {{reason}}. Please contact support for more information.",
    "transferApproved": "Transfer Approved",
    "transferApprovedBody": "Your transfer of ${{amount}} to {{recipient}} has been approved and processed.",
    "transferRejected": "Transfer Rejected",
    "transferRejectedBody": "Your transfer of ${{amount}} to {{recipient}} has been rejected. Reason: {{reason}}.",
    "transferReceived": "Transfer Received",
    "transferReceivedBody": "You received ${{amount}} from {{sender}}.",
    "depositApproved": "Deposit Approved",
    "depositApprovedBody": "Your deposit of ${{amount}} has been approved and credited to your account.",
    "depositRejected": "Deposit Rejected",
    "depositRejectedBody": "Your deposit of ${{amount}} has been rejected. Reason: {{reason}}.",
    "depositSubmitted": "Deposit Submitted",
    "depositSubmittedBody": "Your deposit request of ${{amount}} has been submitted and is pending admin approval.",
    "transferScheduled": "Transfer Scheduled",
    "transferScheduledBody": "Your transfer of ${{amount}} to {{recipient}} has been scheduled for {{date}}."
  }
}
```

The actual file must contain ALL string values (the real English text for each key). This is the source of truth.

- [ ] **Step 2: Commit**

```bash
git add src/i18n/locales/en.json
git commit -m "feat(i18n): add English translation dictionary"
```

---

### Task 3: Spanish translation dictionary

**Files:**
- Create: `src/i18n/locales/es.json`

- [ ] **Step 1: Copy en.json and translate all values to Spanish**

Same key structure as en.json but with Spanish translations for every value. Save as `src/i18n/locales/es.json`.

- [ ] **Step 2: Commit**

```bash
git add src/i18n/locales/es.json
git commit -m "feat(i18n): add Spanish translation dictionary"
```

---

### Task 4: French translation dictionary

**Files:**
- Create: `src/i18n/locales/fr.json`

- [ ] **Step 1: Copy en.json and translate all values to French**

Same key structure as en.json but with French translations for every value. Save as `src/i18n/locales/fr.json`.

- [ ] **Step 2: Commit**

```bash
git add src/i18n/locales/fr.json
git commit -m "feat(i18n): add French translation dictionary"
```

---

### Task 5: Dictionary loader

**Files:**
- Create: `src/i18n/dictionary.ts`

- [ ] **Step 1: Create dictionary loader**

```typescript
import type { Locale } from "./config";

export type Dict = Record<string, string | Record<string, unknown>>;

const cache = new Map<Locale, Dict>();

export async function loadDictionary(locale: Locale): Promise<Dict> {
  if (cache.has(locale)) return cache.get(locale)!;
  const dict = (await import(`./locales/${locale}.json`)) as Dict;
  cache.set(locale, dict);
  return dict;
}

export function getNestedValue(obj: Dict, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (typeof current !== "object" || current === null) return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

export function interpolate(text: string, params?: Record<string, string>): string {
  if (!params) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key as string] ?? `{{${key}}}`);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/i18n/dictionary.ts
git commit -m "feat(i18n): add dictionary loader with caching"
```

---

### Task 6: Client-side LocaleProvider

**Files:**
- Create: `src/i18n/client.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create LocaleProvider**

```typescript
"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { defaultLocale, type Locale } from "./config";
import { loadDictionary, getNestedValue, interpolate, type Dict } from "./dictionary";
import { updateLanguage } from "@/lib/actions/settings";

interface LocaleContextValue {
  locale: Locale;
  t: (key: string, params?: Record<string, string>) => string;
  setLocale: (locale: Locale) => Promise<void>;
  isLoaded: boolean;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  t: (key: string) => key,
  setLocale: async () => {},
  isLoaded: false,
});

export function useLocale() {
  return useContext(LocaleContext);
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function detectInitialLocale(): Locale {
  const cookie = getCookie("iwb_locale");
  if (cookie) {
    const supported = ["en", "es", "fr"];
    if (supported.includes(cookie)) return cookie as Locale;
  }
  if (typeof navigator !== "undefined") {
    const lang = navigator.language.split("-")[0]!;
    if (["en", "es", "fr"].includes(lang)) return lang as Locale;
  }
  return defaultLocale;
}

export function LocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale: string }) {
  const [locale, setLocaleState] = useState<Locale>(
    ["en", "es", "fr"].includes(initialLocale) ? (initialLocale as Locale) : detectInitialLocale(),
  );
  const [dict, setDict] = useState<Dict>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadDictionary(locale).then((d) => {
      setDict(d);
      setIsLoaded(true);
    });
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      const val = getNestedValue(dict, key);
      return interpolate(val, params);
    },
    [dict],
  );

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    setCookie("iwb_locale", newLocale, 365);
    try {
      await updateLanguage(newLocale);
    } catch {
      // server update is best-effort; cookie is already set
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale, isLoaded }}>
      {children}
    </LocaleContext.Provider>
  );
}
```

- [ ] **Step 2: Update root layout to wrap with LocaleProvider**

In `src/app/layout.tsx`, import LocaleProvider and wrap children. Also set `lang` attribute on `<html>`.

Read the user's profile language preference server-side and pass as `initialLocale` prop.

```typescript
// At top of layout function, before return:
import { createServiceClient } from "@/lib/supabase/service";
import { LocaleProvider } from "@/i18n/client";
import { defaultLocale } from "@/i18n/config";

// In the layout component:
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Try to detect locale from profile (if logged in), then cookie, then browser
  const svc = createServiceClient();
  // We'll try cookies first since this is initial load
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("iwb_locale")?.value ?? "";
  const supported = ["en", "es", "fr"];
  const initialLocale = supported.includes(cookieLocale) ? cookieLocale : defaultLocale;

  return (
    <html lang={initialLocale}>
      <body>
        <LocaleProvider initialLocale={initialLocale}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/client.tsx src/app/layout.tsx
git commit -m "feat(i18n): add LocaleProvider and wrap root layout"
```

---

### Task 7: Server-side locale utilities

**Files:**
- Create: `src/i18n/server.ts`

- [ ] **Step 1: Create server-side t()**

```typescript
import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";
import { loadDictionary, getNestedValue, interpolate, type Dict } from "./dictionary";

const dictCache = new Map<string, Dict>();

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const val = store.get("iwb_locale")?.value;
  if (val && (locales as readonly string[]).includes(val)) return val as Locale;
  return defaultLocale;
}

export async function getDict(): Promise<Dict> {
  const locale = await getServerLocale();
  if (dictCache.has(locale)) return dictCache.get(locale)!;
  const dict = await loadDictionary(locale);
  dictCache.set(locale, dict);
  return dict;
}

export async function t(key: string, params?: Record<string, string>): Promise<string> {
  const dict = await getDict();
  const val = getNestedValue(dict, key);
  return interpolate(val, params);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/i18n/server.ts
git commit -m "feat(i18n): add server-side t() utility"
```

---

### Task 8: Language update server action

**Files:**
- Create/modify: `src/lib/actions/settings.ts`
- Create: `src/components/features/language-switcher.tsx`

- [ ] **Step 1: Add updateLanguage to settings actions**

```typescript
export async function updateLanguage(locale: string) {
  "use server";
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const supported = ["en", "es", "fr"];
  if (!supported.includes(locale)) return { error: "Unsupported locale" };

  const svc = createServiceClient();
  const { error } = await svc.from("profiles").update({ language: locale }).eq("id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}
```

- [ ] **Step 2: Create language-switcher component**

```typescript
"use client";

import { useLocale } from "@/i18n/client";
import { localeLabels, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">
        Language / Idioma / Langue
      </label>
      <div className="flex flex-wrap gap-2">
        {(Object.entries(localeLabels) as [Locale, string][]).map(([code, label]) => (
          <button
            key={code}
            onClick={() => setLocale(code)}
            className={`rounded-iwb-md px-4 py-2 text-sm font-medium transition-all ${
              locale === code
                ? "bg-iwb-teal text-iwb-navy"
                : "border border-iwb-border text-iwb-slate hover:border-iwb-teal hover:text-iwb-navy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/settings.ts src/components/features/language-switcher.tsx
git commit -m "feat(i18n): add language update action and language-switcher component"
```

---

### Task 9: Add language switcher to Settings page

**Files:**
- Modify: `src/app/(dashboard)/settings/page.tsx` or `settings-client.tsx`

- [ ] **Step 1: Import and render LanguageSwitcher in the Settings page**

Find the settings page/client component. Add a "Language" section:
```tsx
import { LanguageSwitcher } from "@/components/features/language-switcher";

// Inside the settings form, add a language section:
<div className="space-y-4">
  <h3 className="text-base font-semibold text-iwb-navy">Language</h3>
  <p className="text-sm text-iwb-slate-light">Choose your preferred language</p>
  <LanguageSwitcher />
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/settings/
git commit -m "feat(i18n): add language switcher to settings page"
```

---

### Task 10: Replace hardcoded strings — Navigation

**Files:**
- Modify: `src/components/features/sidebar.tsx`
- Modify: `src/components/features/mobile-nav.tsx`
- Modify: `src/components/features/admin-sidebar.tsx`

- [ ] **Step 1: Refactor sidebar to use t()**

These are client components. Import `useLocale()`, call `t("nav.dashboard")` etc. for each nav label. Wrap in `useLocale().t` calls.

For the sidebar, replace hardcoded link labels:
```tsx
const { t } = useLocale();
// then:
{t("nav.dashboard")}
{t("nav.accounts")}
// etc.
```

- [ ] **Step 2: Same for mobile-nav.tsx and admin-sidebar.tsx**

- [ ] **Step 3: Commit**

```bash
git add src/components/features/sidebar.tsx src/components/features/mobile-nav.tsx src/components/features/admin-sidebar.tsx
git commit -m "feat(i18n): translate navigation components"
```

---

### Task 11: Replace hardcoded strings — Auth pages

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/signup/page.tsx`
- Modify: `src/app/(auth)/signup/steps/personal-info.tsx`
- Modify: `src/app/(auth)/signup/steps/identity-docs.tsx`
- Modify: `src/app/(auth)/signup/steps/review-submit.tsx`
- Modify: `src/app/(auth)/pending-verification/page.tsx`
- Modify: `src/app/(auth)/pending-verification/pending-content.tsx`
- Modify: `src/app/(auth)/layout.tsx`
- Modify: `src/components/features/admin-login-form.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add "use client" + useLocale() to auth pages**

For each auth page/component that contains hardcoded user-facing strings, import `useLocale()` and replace strings:
```tsx
const { t } = useLocale();
// Replace: <h1>Welcome Back</h1>
// With:    <h1>{t("auth.login.title")}</h1>
```

For server components in the auth folder that can't use hooks, add "use client" and use the hook, or use the server-side `t()`.

The signup wizard (page.tsx) is already a client component. The pending-verification page has a co-located pending-content.tsx client component. The login page is a client component.

- [ ] **Step 2: Commit**

```bash
git add src/app/\(auth\)/ src/app/page.tsx src/components/features/admin-login-form.tsx
git commit -m "feat(i18n): translate auth pages"
```

---

### Task 12: Replace hardcoded strings — Dashboard & Accounts

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`
- Modify: `src/app/(dashboard)/accounts/page.tsx`
- Modify: `src/app/(dashboard)/accounts/accounts-client.tsx`
- Modify: `src/components/features/balance-card.tsx`
- Modify: `src/components/features/quick-actions.tsx`
- Modify: `src/components/features/recent-transactions.tsx`
- Modify: `src/components/features/promotion-card.tsx`
- Modify: `src/components/features/spending-insights.tsx`
- Modify: `src/components/features/account-cards.tsx`

- [ ] **Step 1: Translate all dashboard-related components**

Each client component imports `useLocale()` and replaces strings. Example:
```tsx
const { t } = useLocale();
// ...
<h2>{t("dashboard.totalBalance")}</h2>
<p>{t("dashboard.welcome", { name: user.full_name })}</p>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/ src/app/\(dashboard\)/accounts/ src/components/features/balance-card.tsx src/components/features/quick-actions.tsx src/components/features/recent-transactions.tsx src/components/features/promotion-card.tsx src/components/features/spending-insights.tsx src/components/features/account-cards.tsx
git commit -m "feat(i18n): translate dashboard and accounts pages"
```

---

### Task 13: Replace hardcoded strings — Send, Transactions, Deposit, Statements

**Files:**
- Modify: `src/app/(dashboard)/send/page.tsx`
- Modify: `src/app/(dashboard)/send/send-form.tsx`
- Modify: `src/app/(dashboard)/send/send-confirmation.tsx`
- Modify: `src/app/(dashboard)/send/send-result.tsx`
- Modify: `src/app/(dashboard)/send/transfer-details.tsx`
- Modify: `src/app/(dashboard)/send/schedule-toggle.tsx`
- Modify: `src/app/(dashboard)/transactions/page.tsx`
- Modify: `src/app/(dashboard)/transactions/transaction-row.tsx`
- Modify: `src/app/(dashboard)/transactions/transaction-history.tsx`
- Modify: `src/app/(dashboard)/deposit/page.tsx`
- Modify: `src/app/(dashboard)/statements/page.tsx`
- Modify: `src/components/features/deposit-form.tsx`
- Modify: `src/components/features/transaction-receipt.tsx`
- Modify: `src/components/features/recipient-search.tsx`

- [ ] **Step 1: Translate each page/component**

Import `useLocale()` in client components and replace hardcoded strings with `t("send.title")`, `t("transactions.title")`, etc.

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/send/ src/app/\(dashboard\)/transactions/ src/app/\(dashboard\)/deposit/ src/app/\(dashboard\)/statements/ src/components/features/deposit-form.tsx src/components/features/transaction-receipt.tsx src/components/features/recipient-search.tsx
git commit -m "feat(i18n): translate send, transactions, deposit, statements"
```

---

### Task 14: Replace hardcoded strings — Settings & Notifications

**Files:**
- Modify: `src/app/(dashboard)/settings/page.tsx`
- Modify: `src/app/(dashboard)/settings/settings-client.tsx`
- Modify: `src/app/(dashboard)/notifications/page.tsx`
- Modify: `src/app/(dashboard)/notifications/notification-list.tsx`
- Modify: `src/components/features/settings-form.tsx`
- Modify: `src/components/features/settings-provider.tsx`
- Modify: `src/components/features/notification-bell.tsx`

- [ ] **Step 1: Translate settings and notifications**

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/settings/ src/app/\(dashboard\)/notifications/ src/components/features/settings-form.tsx src/components/features/settings-provider.tsx src/components/features/notification-bell.tsx
git commit -m "feat(i18n): translate settings and notifications"
```

---

### Task 15: Replace hardcoded strings — Admin pages

**Files:**
- Modify: All files under `src/app/admin/` including:
  - `admin/page.tsx`, `admin/dashboard/page.tsx`, `admin/users/page.tsx`
  - `admin/transactions/page.tsx`, `admin/transfers/page.tsx`
  - `admin/deposits/page.tsx`, `admin/kyc/page.tsx`
  - `admin/reports/page.tsx`, `admin/activity/page.tsx`
  - `admin/**/*.tsx` (co-located components like kyc-actions, transfer-actions, deposit-actions)
  - `admin/**/loading.tsx` files
- Modify: `src/components/features/admin-user-actions.tsx`

- [ ] **Step 1: Translate each admin page/component**

Import `useLocale()` or server-side `t()` depending on component type. Replace:
```tsx
// Client components:
const { t } = useLocale();
<h1>{t("admin.kyc.title")}</h1>

// Server components:
import { t } from "@/i18n/server";
<h1>{await t("admin.kyc.title")}</h1>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/ src/components/features/admin-user-actions.tsx
git commit -m "feat(i18n): translate admin pages"
```

---

### Task 16: Translate notification messages in server actions

**Files:**
- Modify: `src/lib/actions/kyc.ts`
- Modify: `src/lib/actions/transfer.ts`
- Modify: `src/lib/actions/deposit.ts`
- Modify: `src/lib/actions/admin.ts`
- Modify: `src/lib/actions/notifications.ts`

- [ ] **Step 1: Replace hardcoded notification messages with locale lookup**

For each `createNotificationSystem` call, replace English title/message strings with dynamic locale-based strings. The notifications are stored and displayed to the user, so they need to be in the user's language.

Since the server action doesn't know the user's locale (it could look it up from the profile), approach: store the notification with a locale-neutral key, and translate on display.

Actually simpler: for notification titles/bodies, use English as-is since they're stored in DB and displayed via `t()`. Add translation keys for known notification patterns.

For notifications, the approach is:
1. Store locale-neutral title/message in the notification
2. On the frontend, display them directly (not translated)

OR:
1. Store English
2. Use `t()` with the stored string as fallback

For simplicity, keep notification messages as plain English for now and add a note that they can be translated later via notification templates.

Actually, the simplest approach: notification messages are stored in English in the DB and displayed as-is. This is common for system notifications. Skip translating them for now.

- [ ] **Step 2: Commit (if changes made)**

---

### Task 17: Shared UI components

**Files:**
- Modify: `src/components/ui/empty-state.tsx`
- Modify: `src/components/ui/copy-button.tsx`
- Modify: `src/components/ui/route-progress.tsx`

These components may contain user-facing strings (e.g., "No data", "Copy", "Loading..."). Replace with `t()` calls.

- [ ] **Step 1: Translate empty-state**

- [ ] **Step 2: Translate copy-button** (replace "Copy" / "Copied!" with `t("common.copy")` / `t("common.copied")`)

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/empty-state.tsx src/components/ui/copy-button.tsx
git commit -m "feat(i18n): translate shared UI components"
```

---

### Task 18: Build and verify

- [ ] **Step 1: Run the build**

```bash
pnpm build
```

Expected: Build succeeds, no TypeScript errors, no missing translation keys.

- [ ] **Step 2: Fix any build errors**

- [ ] **Step 3: Create a new branch and push**

```bash
git checkout -b phase-10/i18n
git push -u origin phase-10/i18n
```
