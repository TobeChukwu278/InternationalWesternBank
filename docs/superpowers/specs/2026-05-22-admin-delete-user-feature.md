# Admin Delete User Feature

## Goal
Allow admins to delete (soft-delete) a user from the admin panel, preventing login and re-registration while keeping data for audit purposes.

## Approach
**Soft delete with auth block (Option B).** Sets `deleted_at` on the profile; keeps user in `auth.users` (email stays taken → blocks re-registration); login action checks `deleted_at` and rejects disabled accounts.

## Data Model
- **Migration `00014_add_deleted_at.sql`**: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;`
- No new tables needed.

## Server Action — `deleteUser`
**File:** `src/lib/actions/admin.ts`

| Step | Detail |
|------|--------|
| Auth | `isAdminSession()` — rejects non-admins |
| Input | `formData: FormData` with `user_id`, `user_email` |
| Operation | Service client sets `profiles.deleted_at = NOW()` where `id = user_id` |
| Notification | Creates a notification for the deleted user (title: "Account Deleted", message: explains deletion) |
| Revalidation | `revalidatePath("/admin", "layout")` |

## Login Block
**File:** `src/lib/actions/auth.ts`

In the `login` function, after fetching the profile, check:
```typescript
if (profile?.deleted_at) {
  return { error: "This account has been disabled." };
}
```

## Admin UI — Query Change
**File:** `src/app/admin/users/page.tsx`

Add `.is("deleted_at", null)` to the profiles query to exclude deleted users from the list and counts.

## UI — Delete Button in Manage Modal
**File:** `src/components/features/admin-user-actions.tsx`

Add a "Delete User" section at the bottom of the manage modal (below sub-account cards):

1. A red danger zone with a "Delete User" button
2. Clicking opens a confirmation state where admin must type the user's full name to confirm
3. On confirm, calls `deleteUser` server action
4. Success: toast + closes modal + page refresh
5. Error: error message displayed inline

## Translation Keys
Add to `en.json`, `es.json`, `fr.json`:

- `admin.users.deleteUser` → "Delete User"
- `admin.users.deleteWarning` → "This action cannot be undone. The user will lose access to their account."
- `admin.users.deleteConfirm` → "Type {{name}} to confirm"
- `admin.users.deleteConfirmed` → "User deleted successfully"
- `admin.users.accountDisabled` → "This account has been disabled."
- `notifications.account_deleted` → "Account Deleted"
- `notifications.msg_account_deleted` → "Your account has been deleted by an administrator."

## Files Changed
| File | Change |
|------|--------|
| `supabase/migrations/00014_add_deleted_at.sql` | New — adds `deleted_at` column |
| `src/lib/actions/admin.ts` | New `deleteUser` server action |
| `src/lib/actions/auth.ts` | Add `deleted_at` check in login |
| `src/app/admin/users/page.tsx` | Add `.is("deleted_at", null)` filter |
| `src/components/features/admin-user-actions.tsx` | Add delete button + confirmation UI |
| `src/i18n/locales/en.json` | Add delete user keys |
| `src/i18n/locales/es.json` | Sync delete user keys |
| `src/i18n/locales/fr.json` | Sync delete user keys |

## Not in Scope
- Re-activation of deleted users
- Bulk delete
- Automated cleanup of old deleted profiles
