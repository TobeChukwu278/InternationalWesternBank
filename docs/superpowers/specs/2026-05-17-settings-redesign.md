# Settings Page Redesign

Polish the settings page with organized sections, Material Icons, functional preferences (DB-backed), and functional password change.

## DB Migration

Add to `profiles` table (run via Supabase Dashboard SQL Editor):

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'USD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light';
```

## Page Layout

Four vertical sections in Cards on a single scrollable page:

### 1. Profile

- Avatar circle with user's first initial on the left
- Full name heading, email below, "Member since {date}" below that
- Edit Name form: Input + Save Changes button (existing SettingsForm)

### 2. Preferences

- Email Notifications toggle (switch/checkbox)
- Preferred Currency select (USD, EUR, GBP, NGN)
- Theme select (Light, Dark)

Each preference saved individually on change via server action. Uses existing `Select` component and a custom `Toggle` component.

### 3. Security

- Current password input (password type)
- New password input (password type)
- Confirm new password input (password type)
- "Update Password" button
- Calls `supabase.auth.updateUser({ password })` via server action
- Validation: new password must match confirm, min 6 chars

### 4. Account

- Account number with copy button (uses existing `CopyButton`)
- User ID (monospace, read-only)
- Member since date (from profiles.created_at or user.created_at)

## Data Flow

### Server component (`page.tsx`)

Fetches:
- User email + created_at from Supabase Auth
- Profile: full_name, notifications_enabled, preferred_currency, theme
- Account: account_number

Passes all data as props to a single `SettingsClient` component.

### Server actions (`src/lib/actions/settings.ts`)

| Action | Purpose |
|--------|---------|
| `updateProfile(formData)` | Already exists at `@/lib/actions/profile.ts`, update full_name |
| `updatePreferences(formData)` | Update notifications_enabled, preferred_currency, theme on profiles table |
| `updatePassword(formData)` | Call `supabase.auth.updateUser({ password })` with new password |

### Client component (`settings-client.tsx`)

"use client" component managing all 4 sections. Uses `useActionState` for form submissions and `useToast` for feedback.

## Component Details

### Toggle component (new)

File: `src/components/ui/toggle.tsx`

A styled toggle switch matching the design system. Props: `checked`, `onChange`, `label`. Renders a sliding switch with teal active state.

### SettingsClient component (new)

File: `src/app/(dashboard)/settings/settings-client.tsx`

"use client" component that renders all 4 sections. Uses existing `SettingsForm` for profile editing, new inline forms for preferences and security.

## Files Changed

| File | Change |
|------|--------|
| `src/app/(dashboard)/settings/page.tsx` | Rewrite — fetch all data, pass to SettingsClient |
| `src/app/(dashboard)/settings/settings-client.tsx` | **New** — client component with all 4 sections |
| `src/components/ui/toggle.tsx` | **New** — toggle switch component |
| `src/lib/actions/settings.ts` | **New** — updatePreferences + updatePassword server actions |
| `src/lib/actions/profile.ts` | Unchanged (reused by Profile section) |
| `src/types/database.ts` | Update Profile type with new fields |
| Migration via SQL Editor | Add 3 columns to profiles table |

## Scope Notes

- Toggle component is a simple CSS slider, no third-party library
- Preferences save individually on change (no "Save All" button)
- Password change uses Supabase's built-in auth.updateUser — no email verification needed
- Theme preference is stored but not yet applied (no dark mode CSS). Stored for future use.
- Currency preference is stored but doesn't change display formatting yet. Stored for future use.
- The Profile section reuses the existing `SettingsForm` component
- "Member since" uses `profiles.created_at`
