# Admin Delete User Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow admins to soft-delete a user, preventing login and re-registration while preserving data.

**Architecture:** Soft delete via `profiles.deleted_at` column. Auth users remain in `auth.users` (email stays taken). Login action checks `deleted_at`. Signup action checks `deleted_at` via service client and returns a generic rejection message. Admin UI filters deleted users from list/counts.

**Tech Stack:** Next.js 16, Supabase (Auth + Postgres), Tailwind CSS v4, TypeScript, `pnpm`

---

### Task 1: Migration for `deleted_at` column

**Files:**
- Create: `supabase/migrations/00014_add_deleted_at.sql`

- [ ] **Step 1: Create migration**

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/00014_add_deleted_at.sql
git commit -m "feat: add deleted_at column to profiles"
```

---

### Task 2: `deleteUser` server action

**Files:**
- Modify: `src/lib/actions/admin.ts`

- [ ] **Step 1: Add `deleteUser` server action**

Import at top: nothing new needed (already has `isAdminSession`, `createServiceClient`, `revalidatePath`).

Add this function to the file:

```typescript
export async function deleteUser(formData: FormData) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return { error: "Not authorized" };

  const userId = formData.get("user_id") as string;
  const userEmail = formData.get("user_email") as string;

  if (!userId) return { error: "User ID is required" };

  const serviceSupabase = createServiceClient();

  // Set deleted_at on profile
  const { error: updateError } = await serviceSupabase
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", userId);

  if (updateError) {
    return { error: `Failed to delete user: ${updateError.message}` };
  }

  // Create notification for the user
  const { error: notifError } = await serviceSupabase
    .from("notifications")
    .insert({
      user_id: userId,
      title: "Account Deleted",
      message: "Your account has been deleted by an administrator.",
      type: "system",
    });

  if (notifError) {
    console.error("Failed to create notification:", notifError.message);
  }

  revalidatePath("/admin", "layout");

  return { success: true };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/admin.ts
git commit -m "feat: add deleteUser server action"
```

---

### Task 3: Block login + signup for deleted accounts

**Files:**
- Modify: `src/lib/actions/auth.ts`

- [ ] **Step 1: Block login for deleted profiles**

Add import at top:
```typescript
import { createServiceClient } from "@/lib/supabase/service";
```

In the `login` function, after `supabase.auth.signInWithPassword()` succeeds but before the redirect, add a check. Actually, a better approach: query the profile BEFORE sign in, to avoid leaking whether the email exists.

Replace the login function:

```typescript
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Check if the account was deleted
  const serviceSupabase = createServiceClient();
  const { data: deletedProfile } = await serviceSupabase
    .from("profiles")
    .select("deleted_at")
    .eq("email", email)
    .not("deleted_at", "is", null)
    .maybeSingle();

  if (deletedProfile) {
    return { error: "Cannot register with this email." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
```

- [ ] **Step 2: Block signup for deleted accounts**

Modify the `signup` function to check deleted profiles before calling `supabase.auth.signUp()`:

```typescript
export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  // Check if this email belongs to a deleted account
  const serviceSupabase = createServiceClient();
  const { data: deletedProfile } = await serviceSupabase
    .from("profiles")
    .select("deleted_at")
    .eq("email", email)
    .not("deleted_at", "is", null)
    .maybeSingle();

  if (deletedProfile) {
    return { error: "Cannot register with this email." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/auth.ts
git commit -m "feat: block login and signup for deleted accounts"
```

---

### Task 4: Filter deleted users from admin UI

**Files:**
- Modify: `src/app/admin/users/page.tsx`

- [ ] **Step 1: Add `.is("deleted_at", null)` filter**

In the profiles query on line 9-12, add the filter:

```typescript
const { data: users } = await supabase
    .from("profiles")
    .select("*, accounts!inner(*, sub_accounts(*))")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/users/page.tsx
git commit -m "feat: filter deleted users from admin list"
```

---

### Task 5: Add delete button + confirmation to manage modal

**Files:**
- Modify: `src/components/features/admin-user-actions.tsx`

- [ ] **Step 1: Add delete user state + UI to the modal**

The modal is opened by clicking "Manage" on a user row. Inside the modal, below the sub-account section, add:

1. A danger zone divider with "Delete User" button that expands a confirmation section
2. Confirmation requires typing the user's name
3. On confirm, calls the `deleteUser` server action

Add `deleteUser` import at top:
```typescript
import { creditAccount, debitAccount, deleteUser } from "@/lib/actions/admin";
```

In the `AdminUserActions` component, add a new state:
```typescript
const [deleteConfirm, setDeleteConfirm] = useState(false);
const [deleteName, setDeleteName] = useState("");
const [deletePending, setDeletePending] = useState(false);
const [deleteError, setDeleteError] = useState<string | null>(null);
```

In the modal JSX, after the sub-accounts section (`</div>` closing the space-y-3 section), add:

```tsx
          {/* Delete User */}
          <hr className="border-iwb-border-light" />
          <div className="rounded-iwb-lg border border-iwb-error/20 bg-iwb-error/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="material-icons text-iwb-error text-sm">warning</i>
              <p className="text-sm font-semibold text-iwb-error">{t("admin.users.deleteUser")}</p>
            </div>
            <p className="text-xs text-iwb-slate mb-3">
              {t("admin.users.deleteWarning")}
            </p>

            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="rounded-iwb-md bg-iwb-error px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-iwb-error/90"
              >
                {t("admin.users.deleteUser")}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-iwb-slate">
                  {t("admin.users.deleteConfirm", { name: user.full_name })}
                </p>
                <input
                  type="text"
                  value={deleteName}
                  onChange={(e) => setDeleteName(e.target.value)}
                  placeholder={user.full_name}
                  className="block w-full rounded-iwb-md border border-iwb-border bg-white px-4 py-2 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-error focus:ring-2 focus:ring-iwb-error/10 focus:outline-none"
                />
                {deleteError ? (
                  <p className="text-xs text-iwb-error">{deleteError}</p>
                ) : null}
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      if (deleteName.trim() !== user.full_name) {
                        setDeleteError("Name does not match");
                        return;
                      }
                      setDeletePending(true);
                      setDeleteError(null);
                      const formData = new FormData();
                      formData.set("user_id", user.id);
                      formData.set("user_email", user.email);
                      const result = await deleteUser(formData);
                      setDeletePending(false);
                      if (result.success) {
                        setOpen(false);
                        setDeleteConfirm(false);
                        setDeleteName("");
                      } else {
                        setDeleteError(result.error ?? "Failed to delete user");
                      }
                    }}
                    disabled={deletePending}
                    className="rounded-iwb-md bg-iwb-error px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-iwb-error/90 disabled:opacity-50"
                  >
                    {deletePending ? t("admin.users.processing") : t("admin.users.deleteUser")}
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirm(false);
                      setDeleteName("");
                      setDeleteError(null);
                    }}
                    className="rounded-iwb-md px-4 py-2 text-xs font-medium text-iwb-slate transition-colors hover:text-iwb-navy"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            )}
          </div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/admin-user-actions.tsx
git commit -m "feat: add delete user button and confirmation to manage modal"
```

---

### Task 6: Add translation keys

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/es.json`
- Modify: `src/i18n/locales/fr.json`

- [ ] **Step 1: Add keys to en.json**

In the `admin.users` section, add:

```json
"deleteUser": "Delete User",
"deleteWarning": "This action cannot be undone. The user will lose access to their account.",
"deleteConfirm": "Type {{name}} to confirm",
"deleteConfirmed": "User deleted successfully",
"accountDisabled": "This account has been disabled."
```

In the `notifications` section, add:

```json
"account_deleted": "Account Deleted",
"msg_account_deleted": "Your account has been deleted by an administrator."
```

- [ ] **Step 2: Add keys to es.json**

```json
"deleteUser": "Eliminar Usuario",
"deleteWarning": "Esta acción no se puede deshacer. El usuario perderá acceso a su cuenta.",
"deleteConfirm": "Escriba {{name}} para confirmar",
"deleteConfirmed": "Usuario eliminado exitosamente",
"accountDisabled": "Esta cuenta ha sido deshabilitada.",
"account_deleted": "Cuenta Eliminada",
"msg_account_deleted": "Su cuenta ha sido eliminada por un administrador."
```

- [ ] **Step 3: Add keys to fr.json**

```json
"deleteUser": "Supprimer l'utilisateur",
"deleteWarning": "Cette action est irréversible. L'utilisateur perdra l'accès à son compte.",
"deleteConfirm": "Tapez {{name}} pour confirmer",
"deleteConfirmed": "Utilisateur supprimé avec succès",
"accountDisabled": "Ce compte a été désactivé.",
"account_deleted": "Compte Supprimé",
"msg_account_deleted": "Votre compte a été supprimé par un administrateur."
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n/locales/
git commit -m "feat(i18n): add delete user translation keys"
```

---

### Task 7: Build and verify

- [ ] **Step 1: Run the build**

```bash
pnpm build
```

Expected: Build succeeds, no TypeScript errors.

- [ ] **Step 2: Push the branch**

```bash
git push
```
