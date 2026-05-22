# i18n Language Translation

## Overview
Full-application internationalization for International Western Bank using a cookie/settings-based approach (no URL prefix). Users can switch languages from the Settings page; the default is their browser's preferred language.

## Supported Locales
- `en` — English (default)
- `es` — Spanish
- `fr` — French

## Locale Detection Order (first load)
1. `profiles.language` column (authenticated users)
2. `iwb_locale` cookie
3. `navigator.language` (browser default)
4. `en` (fallback)

## Architecture

### Translation Files
One JSON file per locale in `src/i18n/locales/`:
```
src/i18n/locales/
  en.json
  es.json
  fr.json
```

Keys use dot notation, organized by feature/page:
```json
{
  "common": {
    "save": "Save",
    "loading": "Loading..."
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
    "signOut": "Sign Out"
  },
  "dashboard": {
    "welcome": "Welcome back, {{name}}",
    "balance": "Total Balance",
    "recentTransactions": "Recent Transactions"
  },
  ...
}
```

### Core Modules

**`src/i18n/config.ts`** — locale definitions, labels, default locale.

**`src/i18n/dictionary.ts`** — loads translation JSON on demand (dynamic `import()`), caches in a `Map`. Used by both client and server.

**`src/i18n/client.tsx`** — `LocaleProvider` React context + `useLocale()` hook.
- Reads locale from cookie on mount
- Falls back to `navigator.language`
- Exposes `t()` and `setLocale()` to children
- `setLocale()` calls server action to persist preference, updates cookie + state
- Wraps the root layout

**`src/i18n/server.ts`** — `getServerLocale()` reads `iwb_locale` cookie from `next/headers` and returns the locale code. `getTranslations(locale)` returns the loaded dictionary. Used in server components.

### Data Layer

**Migration `00013_add_language.sql`:**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
```

**Server action `updateLanguage(locale: string)`:**
- Validates locale is in supported list
- Creates service client
- Updates `profiles.language` for the current user
- Sets `iwb_locale` cookie with 1-year expiry
- `revalidatePath("/", "layout")`

### Settings Page
Add a "Language" section to the existing settings page with a dropdown/select showing:
- English
- Español
- Français

Selection triggers `updateLanguage(locale)` server action.

## Translation Coverage
All user-facing strings across every page/component, including:
- Navigation (sidebar, mobile nav, admin sidebar)
- Dashboard, Accounts, Send Money, Transactions, Deposit, Statements, Settings, Notifications
- Auth pages (Login, Signup wizard, Pending Verification)
- Admin pages (Dashboard, Users, Transfers, Deposits, KYC, Activity, Reports)
- Shared components (Card, Modal, Table, etc.)
- Form labels, placeholders, error messages, toasts
- Notification messages
- Email templates

## Implementation Plan

1. Create migration `00013_add_language.sql`
2. Create `src/i18n/config.ts`
3. Create `src/i18n/locales/en.json` (full)
4. Create `src/i18n/locales/es.json` (full)
5. Create `src/i18n/locales/fr.json` (full)
6. Create `src/i18n/dictionary.ts`
7. Create `src/i18n/client.tsx` (LocaleProvider)
8. Create `src/i18n/server.ts`
9. Create `src/lib/actions/settings.ts` (updateLanguage)
10. Update root layout with LocaleProvider + lang attribute
11. Update settings page with language switcher
12. Replace all hardcoded strings with `t()` calls across all pages/components
13. Build and verify

## Error Handling
- Missing translation key: fall back to the key itself (visible in dev)
- Unsupported locale in cookie: fall back to `en`
- Server action fails to update profile: return error, don't change cookie
- Dictionary load failure: fall back to empty object, keys displayed as-is
