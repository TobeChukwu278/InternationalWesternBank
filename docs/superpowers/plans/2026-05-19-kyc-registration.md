# KYC Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the simple 3-field signup with a real bank-grade multi-step registration including identity documents, profile photo, admin KYC verification, and account gating.

**Architecture:** 3-step client wizard → uploads files to Supabase Storage → server action creates auth user + pending profile → dashboard gate blocks non-active users → admin KYC page with approve/reject.

**Tech Stack:** Next.js 16 App Router, Supabase (Auth + Storage + Postgres), Tailwind CSS v4, Material Icons

---

### Task 1: DB Migration + Types — Add KYC Fields to Profiles

**Files:**
- Create: `supabase/migrations/00011_kyc_verification.sql`
- Modify: `src/types/database.ts`

- [ ] **Step 1: Create migration**

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'not_submitted' CHECK (kyc_status IN ('not_submitted', 'pending', 'verified', 'rejected'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_zip TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id_document_front TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id_document_back TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ssn_last_four TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES admins(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE profiles ALTER COLUMN status SET DEFAULT 'pending';
```

- [ ] **Step 2: Update database.ts**

Add fields to the `Profile` interface:

```ts
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  notifications_enabled: boolean;
  preferred_currency: string;
  theme: string;
  status: "pending" | "active" | "rejected";
  kyc_status: "not_submitted" | "pending" | "verified" | "rejected";
  phone: string | null;
  date_of_birth: string | null;
  address_line1: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  avatar_url: string | null;
  id_document_front: string | null;
  id_document_back: string | null;
  ssn_last_four: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/00011_kyc_verification.sql src/types/database.ts
git commit -m "feat: add KYC fields to profiles"
```

---

### Task 2: Rewrite Auth Action — Signup with Full Profile Data + Storage Upload Helper

**Files:**
- Modify: `src/lib/actions/auth.ts`
- Create: `src/lib/actions/kyc.ts`

- [ ] **Step 1: Create kyc.ts with admin approve/reject actions**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdminSession } from "@/lib/admin-auth";
import { createNotificationSystem } from "@/lib/actions/notifications";

export async function signupWithKyc(formData: FormData) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const dateOfBirth = formData.get("date_of_birth") as string;
  const addressLine1 = formData.get("address_line1") as string;
  const addressCity = formData.get("address_city") as string;
  const addressState = formData.get("address_state") as string;
  const addressZip = formData.get("address_zip") as string;
  const avatarUrl = formData.get("avatar_url") as string;
  const idFrontUrl = formData.get("id_document_front") as string;
  const idBackUrl = formData.get("id_document_back") as string;
  const ssnLastFour = formData.get("ssn_last_four") as string;

  if (!email || !password || !fullName) return { error: "Missing required fields" };

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Failed to create user" };

  const svc = createServiceClient();

  const { error: updateError } = await svc
    .from("profiles")
    .update({
      phone: phone || null,
      date_of_birth: dateOfBirth || null,
      address_line1: addressLine1 || null,
      address_city: addressCity || null,
      address_state: addressState || null,
      address_zip: addressZip || null,
      avatar_url: avatarUrl || null,
      id_document_front: idFrontUrl || null,
      id_document_back: idBackUrl || null,
      ssn_last_four: ssnLastFour || null,
      status: "pending",
      kyc_status: "pending",
    })
    .eq("id", authData.user.id);

  if (updateError) return { error: `Failed to save profile: ${updateError.message}` };

  await createNotificationSystem(
    authData.user.id,
    "Registration Submitted",
    "Your account registration has been submitted and is pending verification. We'll notify you once it's approved.",
    "system",
  );

  revalidatePath("/", "layout");
  return { success: true, userId: authData.user.id };
}

export async function approveKyc(formData: FormData) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return { error: "Not authorized" };

  const userId = formData.get("user_id") as string;
  if (!userId) return { error: "Missing user ID" };

  const svc = createServiceClient();

  const { data: admin } = await svc.from("admins").select("id").limit(1).single();
  if (!admin) return { error: "Admin not found" };

  const { error } = await svc
    .from("profiles")
    .update({
      status: "active",
      kyc_status: "verified",
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  await createNotificationSystem(
    userId,
    "Account Approved",
    "Your account has been verified and approved. You can now access all IWB banking services.",
    "system",
  );

  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function rejectKyc(formData: FormData) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return { error: "Not authorized" };

  const userId = formData.get("user_id") as string;
  const reason = formData.get("reason") as string;
  if (!userId) return { error: "Missing user ID" };
  if (!reason) return { error: "Rejection reason is required" };

  const svc = createServiceClient();

  const { data: admin } = await svc.from("admins").select("id").limit(1).single();
  if (!admin) return { error: "Admin not found" };

  const { error } = await svc
    .from("profiles")
    .update({
      status: "rejected",
      kyc_status: "rejected",
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  await createNotificationSystem(
    userId,
    "Account Rejected",
    `Your account registration has been rejected. Reason: ${reason}. Please contact support for more information.`,
    "system",
  );

  revalidatePath("/admin", "layout");
  return { success: true };
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/kyc.ts
git commit -m "feat: add signupWithKyc, approveKyc, rejectKyc actions"
```

---

### Task 3: Create Storage Upload Utility

**Files:**
- Create: `src/lib/upload.ts`

- [ ] **Step 1: Create the upload utility**

```ts
"use client";

import { createClient } from "@/lib/supabase/client";

export async function uploadProfilePhoto(file: File, userId: string): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/profile.${ext}`;

  const { error } = await supabase.storage
    .from("profile-photos")
    .upload(path, file, { upsert: true });

  if (error) return null;

  const { data: urlData } = await supabase.storage
    .from("profile-photos")
    .getPublicUrl(path);

  return urlData?.publicUrl ?? null;
}

export async function uploadKycDocument(
  file: File,
  userId: string,
  side: "front" | "back",
): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/${side}.${ext}`;

  const { error } = await supabase.storage
    .from("kyc-documents")
    .upload(path, file, { upsert: true });

  if (error) return null;

  const { data: urlData } = await supabase.storage
    .from("kyc-documents")
    .getPublicUrl(path);

  return urlData?.publicUrl ?? null;
}
```

- [ ] **Step 2: Ensure supabase client exists**

The file `src/lib/supabase/client.ts` should already exist (browser client). If not, create it:
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/upload.ts
git commit -m "feat: add storage upload utilities for profile photos and KYC documents"
```

---

### Task 4: Create Signup Step Components

**Files:**
- Create: `src/app/(auth)/signup/steps/personal-info.tsx`
- Create: `src/app/(auth)/signup/steps/identity-docs.tsx`
- Create: `src/app/(auth)/signup/steps/review-submit.tsx`

- [ ] **Step 1: Create PersonalInfo step**

```tsx
"use client";

interface PersonalInfoData {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  date_of_birth: string;
  address_line1: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

interface PersonalInfoProps {
  data: PersonalInfoData;
  onChange: (data: Partial<PersonalInfoData>) => void;
  onNext: () => void;
}

export function PersonalInfo({ data, onChange, onNext }: PersonalInfoProps) {
  const required = [
    { key: "full_name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "password", label: "Password" },
    { key: "phone", label: "Phone Number" },
    { key: "date_of_birth", label: "Date of Birth" },
    { key: "address_line1", label: "Home Address" },
    { key: "address_city", label: "City" },
    { key: "address_state", label: "State" },
    { key: "address_zip", label: "ZIP Code" },
  ];

  const isValid = required.every((r) => (data as any)[r.key]?.trim());

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            value={data.full_name}
            onChange={(e) => onChange({ full_name: e.target.value })}
            placeholder="John Doe"
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="john@example.com"
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Phone Number</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Date of Birth</label>
          <input
            type="date"
            value={data.date_of_birth}
            onChange={(e) => onChange({ date_of_birth: e.target.value })}
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Password</label>
          <input
            type="password"
            value={data.password}
            onChange={(e) => onChange({ password: e.target.value })}
            placeholder="Create a strong password"
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Home Address</label>
          <input
            type="text"
            value={data.address_line1}
            onChange={(e) => onChange({ address_line1: e.target.value })}
            placeholder="123 Main St"
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">City</label>
          <input
            type="text"
            value={data.address_city}
            onChange={(e) => onChange({ address_city: e.target.value })}
            placeholder="Los Angeles"
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">State</label>
            <input
              type="text"
              value={data.address_state}
              onChange={(e) => onChange({ address_state: e.target.value })}
              placeholder="CA"
              className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
              required
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">ZIP</label>
            <input
              type="text"
              value={data.address_zip}
              onChange={(e) => onChange({ address_zip: e.target.value })}
              placeholder="90012"
              className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
              required
            />
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full rounded-iwb-md bg-iwb-teal px-6 py-3.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create IdentityDocs step**

```tsx
"use client";

import { useState, useRef } from "react";
import { uploadProfilePhoto, uploadKycDocument } from "@/lib/upload";

interface IdentityDocsProps {
  ssnLastFour: string;
  onSsnChange: (val: string) => void;
  onDocumentsChange: (docs: {
    avatarUrl?: string;
    idFrontUrl?: string;
    idBackUrl?: string;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function IdentityDocs({ ssnLastFour, onSsnChange, onDocumentsChange, onNext, onBack }: IdentityDocsProps) {
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);

  const avatarRef = useRef<HTMLInputElement>(null);
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(
    file: File | undefined,
    setPreview: (v: string | null) => void,
    setFile: (f: File | null) => void,
  ) {
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUploadAndContinue() {
    if (!idFrontFile || !idBackFile || !avatarFile) return;
    setUploading(true);

    // Use a temp userId for preview — real userId will come from server
    const tempId = "temp";

    const avatarUrl = await uploadProfilePhoto(avatarFile, tempId);
    const idFrontUrl = await uploadKycDocument(idFrontFile, tempId, "front");
    const idBackUrl = await uploadKycDocument(idBackFile, tempId, "back");

    onDocumentsChange({
      avatarUrl: avatarUrl ?? undefined,
      idFrontUrl: idFrontUrl ?? undefined,
      idBackUrl: idBackUrl ?? undefined,
    });

    setUploading(false);
    onNext();
  }

  const canContinue = avatarFile && idFrontFile && idBackFile;

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider mb-3 block">
          Profile Photo <span className="text-iwb-error">*</span>
        </label>
        <div
          onClick={() => avatarRef.current?.click()}
          className="flex cursor-pointer items-center gap-4 rounded-iwb-lg border border-dashed border-iwb-border p-4 transition-colors hover:border-iwb-teal"
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Preview" className="size-16 rounded-full object-cover" />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-iwb-surface text-iwb-slate-light">
              <i className="material-icons text-2xl">person_add</i>
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-iwb-navy">
              {avatarFile ? avatarFile.name : "Upload profile photo"}
            </p>
            <p className="text-xs text-iwb-slate-light">JPG or PNG recommended</p>
          </div>
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0], setAvatarPreview, setAvatarFile)}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider mb-3 block">
          Driver's License / State ID — Front <span className="text-iwb-error">*</span>
        </label>
        <div
          onClick={() => idFrontRef.current?.click()}
          className="flex cursor-pointer items-center gap-4 rounded-iwb-lg border border-dashed border-iwb-border p-4 transition-colors hover:border-iwb-teal"
        >
          {idFrontPreview ? (
            <img src={idFrontPreview} alt="ID Front" className="size-16 rounded-lg object-cover" />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-lg bg-iwb-surface text-iwb-slate-light">
              <i className="material-icons text-2xl">badge</i>
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-iwb-navy">
              {idFrontFile ? idFrontFile.name : "Upload front of ID"}
            </p>
            <p className="text-xs text-iwb-slate-light">Clear photo, all details visible</p>
          </div>
          <input
            ref={idFrontRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0], setIdFrontPreview, setIdFrontFile)}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider mb-3 block">
          Driver's License / State ID — Back <span className="text-iwb-error">*</span>
        </label>
        <div
          onClick={() => idBackRef.current?.click()}
          className="flex cursor-pointer items-center gap-4 rounded-iwb-lg border border-dashed border-iwb-border p-4 transition-colors hover:border-iwb-teal"
        >
          {idBackPreview ? (
            <img src={idBackPreview} alt="ID Back" className="size-16 rounded-lg object-cover" />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-lg bg-iwb-surface text-iwb-slate-light">
              <i className="material-icons text-2xl">badge</i>
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-iwb-navy">
              {idBackFile ? idBackFile.name : "Upload back of ID"}
            </p>
            <p className="text-xs text-iwb-slate-light">Clear photo, barcode visible</p>
          </div>
          <input
            ref={idBackRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0], setIdBackPreview, setIdBackFile)}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">
          SSN (Last 4 Digits) <span className="text-iwb-slate-light font-normal">— Optional</span>
        </label>
        <input
          type="text"
          value={ssnLastFour}
          onChange={(e) => onSsnChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="1234"
          maxLength={4}
          className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-iwb-md border-2 border-iwb-border px-4 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-surface"
        >
          Back
        </button>
        <button
          onClick={handleUploadAndContinue}
          disabled={!canContinue || uploading}
          className="flex-1 rounded-iwb-md bg-iwb-teal px-4 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-iwb-navy border-t-transparent" />
          ) : null}
          {uploading ? "Uploading..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ReviewSubmit step**

```tsx
"use client";

interface PersonalInfoData {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address_line1: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

interface ReviewSubmitProps {
  personalInfo: PersonalInfoData;
  ssnLastFour: string;
  avatarPreview: string | null;
  idFrontPreview: string | null;
  idBackPreview: string | null;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export function ReviewSubmit({
  personalInfo, ssnLastFour, avatarPreview, idFrontPreview, idBackPreview, submitting, onSubmit, onBack,
}: ReviewSubmitProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-iwb-lg border border-iwb-border-light bg-white p-5">
        <h3 className="text-sm font-semibold text-iwb-navy mb-3">Personal Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-iwb-slate-light">Name</span>
            <span className="font-medium text-iwb-navy">{personalInfo.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-iwb-slate-light">Email</span>
            <span className="font-medium text-iwb-navy">{personalInfo.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-iwb-slate-light">Phone</span>
            <span className="font-medium text-iwb-navy">{personalInfo.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-iwb-slate-light">DOB</span>
            <span className="font-medium text-iwb-navy">{personalInfo.date_of_birth}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-iwb-slate-light">Address</span>
            <span className="font-medium text-iwb-navy text-right">
              {personalInfo.address_line1}, {personalInfo.address_city}, {personalInfo.address_state} {personalInfo.address_zip}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-iwb-lg border border-iwb-border-light bg-white p-5">
        <h3 className="text-sm font-semibold text-iwb-navy mb-3">Identity Documents</h3>
        <div className="flex gap-4">
          {avatarPreview ? (
            <div className="text-center">
              <img src={avatarPreview} alt="Profile" className="mx-auto size-16 rounded-full object-cover" />
              <p className="mt-1 text-xs text-iwb-slate-light">Photo</p>
            </div>
          ) : null}
          {idFrontPreview ? (
            <div className="text-center">
              <img src={idFrontPreview} alt="ID Front" className="mx-auto size-16 rounded-lg object-cover" />
              <p className="mt-1 text-xs text-iwb-slate-light">ID Front</p>
            </div>
          ) : null}
          {idBackPreview ? (
            <div className="text-center">
              <img src={idBackPreview} alt="ID Back" className="mx-auto size-16 rounded-lg object-cover" />
              <p className="mt-1 text-xs text-iwb-slate-light">ID Back</p>
            </div>
          ) : null}
        </div>
        {ssnLastFour ? (
          <p className="mt-3 text-xs text-iwb-slate">
            SSN (last 4): ••••{ssnLastFour}
          </p>
        ) : null}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex-1 rounded-iwb-md border-2 border-iwb-border px-4 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-surface disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 rounded-iwb-md bg-iwb-teal px-4 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span className="size-4 animate-spin rounded-full border-2 border-iwb-navy border-t-transparent" />
          ) : null}
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>

      <p className="text-center text-xs text-iwb-slate-light">
        By submitting, you agree to IWB's Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(auth\)/signup/steps/
git commit -m "feat: add signup step components (personal info, identity docs, review)"
```

---

### Task 5: Rewrite Signup Page + Create Pending Verification Page

**Files:**
- Modify: `src/app/(auth)/signup/page.tsx`
- Create: `src/app/(auth)/pending-verification/page.tsx`

- [ ] **Step 1: Rewrite signup page.tsx**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { signupWithKyc } from "@/lib/actions/kyc";
import { PersonalInfo } from "./steps/personal-info";
import { IdentityDocs } from "./steps/identity-docs";
import { ReviewSubmit } from "./steps/review-submit";

interface PersonalInfoData {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  date_of_birth: string;
  address_line1: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

const steps = ["Personal Info", "Identity", "Review"];

export default function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    full_name: "", email: "", password: "", phone: "", date_of_birth: "",
    address_line1: "", address_city: "", address_state: "", address_zip: "",
  });
  const [ssnLastFour, setSsnLastFour] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [idFrontUrl, setIdFrontUrl] = useState<string | undefined>();
  const [idBackUrl, setIdBackUrl] = useState<string | undefined>();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);

  function handlePersonalChange(data: Partial<PersonalInfoData>) {
    setPersonalInfo((prev) => ({ ...prev, ...data }));
  }

  function handleDocumentsChange(docs: { avatarUrl?: string; idFrontUrl?: string; idBackUrl?: string }) {
    if (docs.avatarUrl) setAvatarUrl(docs.avatarUrl);
    if (docs.idFrontUrl) setIdFrontUrl(docs.idFrontUrl);
    if (docs.idBackUrl) setIdBackUrl(docs.idBackUrl);
  }

  function handleIdentityNext() {
    setAvatarPreview((document.querySelector(".identity-docs [alt='Preview']") as HTMLImageElement)?.src ?? null);
    setIdFrontPreview((document.querySelector(".identity-docs [alt='ID Front']") as HTMLImageElement)?.src ?? null);
    setIdBackPreview((document.querySelector(".identity-docs [alt='ID Back']") as HTMLImageElement)?.src ?? null);
    setCurrentStep(2);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("full_name", personalInfo.full_name);
    formData.set("email", personalInfo.email);
    formData.set("password", personalInfo.password);
    formData.set("phone", personalInfo.phone);
    formData.set("date_of_birth", personalInfo.date_of_birth);
    formData.set("address_line1", personalInfo.address_line1);
    formData.set("address_city", personalInfo.address_city);
    formData.set("address_state", personalInfo.address_state);
    formData.set("address_zip", personalInfo.address_zip);
    if (avatarUrl) formData.set("avatar_url", avatarUrl);
    if (idFrontUrl) formData.set("id_document_front", idFrontUrl);
    if (idBackUrl) formData.set("id_document_back", idBackUrl);
    if (ssnLastFour) formData.set("ssn_last_four", ssnLastFour);

    const res = await signupWithKyc(formData);

    if (res.success) {
      router.push("/pending-verification");
    } else {
      setError(res.error ?? "Something went wrong");
    }

    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-iwb-navy items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#0a2540,_#001020)]" />
        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-white/10">
            <span className="text-2xl font-bold text-iwb-teal">IWB</span>
          </div>
          <h2 className="text-3xl font-bold text-white">International Western Bank</h2>
          <p className="mt-3 text-lg text-iwb-slate-light">
            Open your account in minutes. Join thousands of satisfied customers worldwide.
          </p>
          <div className="mt-8 space-y-3 text-left">
            <div className="flex items-center gap-3 text-white/70">
              <i className="material-icons text-iwb-teal text-sm">verified</i>
              <span className="text-sm">FDIC insured up to $250,000</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <i className="material-icons text-iwb-teal text-sm">security</i>
              <span className="text-sm">256-bit encrypted security</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <i className="material-icons text-iwb-teal text-sm">support_agent</i>
              <span className="text-sm">24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-iwb-surface px-4 py-12 lg:px-8">
        <Card className="w-full max-w-lg p-8">
          <div className="mb-8 text-center lg:hidden">
            <span className="text-xl font-bold text-iwb-navy">IWB</span>
          </div>

          <h1 className="text-xl font-semibold text-iwb-navy">Create account</h1>
          <p className="mt-1 text-sm text-iwb-slate">
            Step {currentStep + 1} of 3: {steps[currentStep]}
          </p>

          {/* Progress bar */}
          <div className="mt-6 flex gap-2">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= currentStep ? "bg-iwb-teal" : "bg-iwb-border"
                }`}
              />
            ))}
          </div>

          <div className="mt-8">
            {currentStep === 0 ? (
              <PersonalInfo data={personalInfo} onChange={handlePersonalChange} onNext={() => setCurrentStep(1)} />
            ) : currentStep === 1 ? (
              <IdentityDocs
                ssnLastFour={ssnLastFour}
                onSsnChange={setSsnLastFour}
                onDocumentsChange={handleDocumentsChange}
                onNext={handleIdentityNext}
                onBack={() => setCurrentStep(0)}
              />
            ) : (
              <ReviewSubmit
                personalInfo={personalInfo}
                ssnLastFour={ssnLastFour}
                avatarPreview={avatarPreview}
                idFrontPreview={idFrontPreview}
                idBackPreview={idBackPreview}
                submitting={submitting}
                onSubmit={handleSubmit}
                onBack={() => setCurrentStep(1)}
              />
            )}
          </div>

          {error ? (
            <div className="mt-4 rounded-iwb-lg bg-iwb-error/5 border border-iwb-error/20 p-3">
              <p className="text-sm text-iwb-error">{error}</p>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create pending verification page**

```tsx
export default function PendingVerificationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-iwb-surface px-4">
      <div className="w-full max-w-md rounded-iwb-xl bg-white p-8 text-center shadow-iwb-card">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-iwb-navy">
          <i className="material-icons text-white text-3xl">account_balance</i>
        </div>

        <i className="material-icons text-5xl text-iwb-teal mb-4">how_to_reg</i>
        <h1 className="text-xl font-semibold text-iwb-navy">Registration Submitted</h1>
        <p className="mt-2 text-sm text-iwb-slate">
          Thank you for registering with International Western Bank. Your application is being reviewed.
        </p>

        <div className="mt-6 rounded-iwb-lg bg-iwb-surface p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <i className="material-icons text-iwb-teal text-sm">schedule</i>
            <span className="text-iwb-slate">Typical review time: 1-2 business days</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <i className="material-icons text-iwb-teal text-sm">notifications</i>
            <span className="text-iwb-slate">You'll be notified once your account is approved</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <i className="material-icons text-iwb-teal text-sm">support_agent</i>
            <span className="text-iwb-slate">Contact support if you have questions</span>
          </div>
        </div>

        <div className="mt-6 border-t border-iwb-border-light pt-6 text-xs text-iwb-slate-light space-y-1">
          <p>International Western Bank</p>
          <p>249 E Ocean Blvd, Long Beach, CA 90802</p>
          <p>+1 (786) 245-4920</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 4: Build check**

Run: `pnpm build`

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/signup/page.tsx src/app/\(auth\)/pending-verification/page.tsx
git commit -m "feat: rewrite signup with multi-step wizard and pending verification page"
```

---

### Task 6: Dashboard Layout Gate — Block Pending/Rejected Users

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Add profile status check**

Read the current `src/app/(dashboard)/layout.tsx`. After fetching the user, also fetch their profile and check status:

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Sidebar } from "@/components/features/sidebar";
import { MobileNav } from "@/components/features/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check profile status
  const svc = createServiceClient();
  const { data: profile } = await svc
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single();

  if (profile?.status === "pending" || !profile) {
    redirect("/pending-verification");
  }

  if (profile?.status === "rejected") {
    redirect("/pending-verification?rejected=true");
  }

  return (
    <div className="flex bg-iwb-surface">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0" style={{ height: "100dvh" }}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
```

- [ ] **Step 2: Update pending-verification page to handle rejected=true param**

Make the page read searchParams and show a "rejected" state:

```tsx
import { Suspense } from "react";
import { PendingContent } from "./pending-content";

export default function PendingVerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PendingContent />
    </Suspense>
  );
}
```

Create `src/app/(auth)/pending-verification/pending-content.tsx`:

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export function PendingContent() {
  const searchParams = useSearchParams();
  const rejected = searchParams.get("rejected") === "true";

  if (rejected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-iwb-surface px-4">
        <div className="w-full max-w-md rounded-iwb-xl bg-white p-8 text-center shadow-iwb-card">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-iwb-error/10">
            <i className="material-icons text-4xl text-iwb-error">cancel</i>
          </div>
          <h1 className="text-xl font-semibold text-iwb-navy">Account Rejected</h1>
          <p className="mt-2 text-sm text-iwb-slate">
            Unfortunately, your account registration could not be approved at this time.
          </p>
          <p className="mt-4 text-xs text-iwb-slate-light">
            Please contact support for more information.
          </p>
          <div className="mt-6 border-t border-iwb-border-light pt-6 text-xs text-iwb-slate-light space-y-1">
            <p>International Western Bank</p>
            <p>+1 (786) 245-4920</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-iwb-surface px-4">
      <div className="w-full max-w-md rounded-iwb-xl bg-white p-8 text-center shadow-iwb-card">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-iwb-navy">
          <i className="material-icons text-white text-3xl">account_balance</i>
        </div>
        <i className="material-icons text-5xl text-iwb-teal mb-4">how_to_reg</i>
        <h1 className="text-xl font-semibold text-iwb-navy">Registration Submitted</h1>
        <p className="mt-2 text-sm text-iwb-slate">
          Thank you for registering. Your application is being reviewed.
        </p>
        <div className="mt-6 rounded-iwb-lg bg-iwb-surface p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <i className="material-icons text-iwb-teal text-sm">schedule</i>
            <span className="text-iwb-slate">Typical review time: 1-2 business days</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <i className="material-icons text-iwb-teal text-sm">notifications</i>
            <span className="text-iwb-slate">You'll be notified once approved</span>
          </div>
        </div>
        <div className="mt-6 border-t border-iwb-border-light pt-6 text-xs text-iwb-slate-light space-y-1">
          <p>International Western Bank</p>
          <p>249 E Ocean Blvd, Long Beach, CA 90802</p>
          <p>+1 (786) 245-4920</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/layout.tsx src/app/\(auth\)/pending-verification/
git commit -m "feat: gate dashboard on profile status, update pending page with rejected state"
```

---

### Task 7: Admin KYC Page + Sidebar Nav + Notifications

**Files:**
- Create: `src/app/admin/kyc/page.tsx`
- Create: `src/app/admin/kyc/kyc-actions.tsx`
- Modify: `src/components/features/admin-sidebar.tsx`

- [ ] **Step 1: Create admin KYC page**

```tsx
import { createServiceClient } from "@/lib/supabase/service";
import { KycActions } from "./kyc-actions";

export default async function AdminKycPage() {
  const svc = createServiceClient();

  const { data: pendingUsers } = await svc
    .from("profiles")
    .select("*")
    .eq("kyc_status", "pending")
    .order("created_at", { ascending: false });

  const { data: allUsers } = await svc
    .from("profiles")
    .select("*")
    .in("kyc_status", ["verified", "rejected"])
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">KYC Verifications</h1>
        <p className="mt-1 text-sm text-iwb-slate">Review and verify new account registrations</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-iwb-navy mb-4">
          Pending Review
          {(pendingUsers ?? []).length > 0 ? (
            <span className="ml-2 rounded-iwb-full bg-iwb-error/10 px-2.5 py-0.5 text-xs font-medium text-iwb-error">
              {(pendingUsers ?? []).length}
            </span>
          ) : null}
        </h2>

        {(pendingUsers ?? []).length === 0 ? (
          <div className="rounded-iwb-xl bg-white p-12 text-center shadow-iwb-card">
            <i className="material-icons text-4xl text-iwb-slate-light mb-3">check_circle</i>
            <p className="text-base font-medium text-iwb-navy">No pending verifications</p>
            <p className="mt-1 text-sm text-iwb-slate">All registrations have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(pendingUsers ?? []).map((user: any) => (
              <div key={user.id} className="rounded-iwb-xl bg-white shadow-iwb-card border border-iwb-border-light overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="size-12 rounded-full object-cover" />
                      ) : (
                        <span className="flex size-12 items-center justify-center rounded-full bg-iwb-navy/5 text-sm font-bold text-iwb-slate">
                          {user.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-iwb-navy">{user.full_name}</p>
                        <p className="text-xs text-iwb-slate-light">{user.email}</p>
                        <p className="text-xs text-iwb-slate-light mt-0.5">
                          Submitted {new Date(user.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div><span className="text-iwb-slate-light">Phone:</span> <span className="text-iwb-navy">{user.phone ?? "—"}</span></div>
                    <div><span className="text-iwb-slate-light">DOB:</span> <span className="text-iwb-navy">{user.date_of_birth ?? "—"}</span></div>
                    <div className="col-span-2">
                      <span className="text-iwb-slate-light">Address:</span>{" "}
                      <span className="text-iwb-navy">
                        {[user.address_line1, user.address_city, user.address_state, user.address_zip].filter(Boolean).join(", ") || "—"}
                      </span>
                    </div>
                    {user.ssn_last_four ? (
                      <div><span className="text-iwb-slate-light">SSN (last 4):</span> <span className="text-iwb-navy">••••{user.ssn_last_four}</span></div>
                    ) : null}
                  </div>

                  {user.id_document_front || user.id_document_back ? (
                    <div className="mt-4 flex gap-3">
                      {user.id_document_front ? (
                        <a href={user.id_document_front} target="_blank" className="flex items-center gap-2 rounded-iwb-md border border-iwb-border-light px-3 py-2 text-xs text-iwb-slate hover:border-iwb-teal hover:text-iwb-teal transition-colors">
                          <i className="material-icons text-sm">badge</i>
                          View ID Front
                        </a>
                      ) : null}
                      {user.id_document_back ? (
                        <a href={user.id_document_back} target="_blank" className="flex items-center gap-2 rounded-iwb-md border border-iwb-border-light px-3 py-2 text-xs text-iwb-slate hover:border-iwb-teal hover:text-iwb-teal transition-colors">
                          <i className="material-icons text-sm">badge</i>
                          View ID Back
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <KycActions userId={user.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-iwb-navy mb-4">History</h2>
        {(allUsers ?? []).length === 0 ? (
          <p className="text-sm text-iwb-slate">No verified or rejected users yet</p>
        ) : (
          <div className="rounded-iwb-xl bg-white shadow-iwb-card overflow-hidden">
            <div className="divide-y divide-iwb-border-light">
              {(allUsers ?? []).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex size-8 items-center justify-center rounded-full text-xs ${
                      user.kyc_status === "verified" ? "bg-iwb-teal/10 text-iwb-teal" : "bg-iwb-error/10 text-iwb-error"
                    }`}>
                      <i className="material-icons text-sm">
                        {user.kyc_status === "verified" ? "check" : "close"}
                      </i>
                    </span>
                    <div>
                      <p className="text-sm font-medium text-iwb-navy">{user.full_name}</p>
                      <p className="text-xs text-iwb-slate-light">{user.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium capitalize ${
                    user.kyc_status === "verified" ? "text-iwb-teal" : "text-iwb-error"
                  }`}>
                    {user.kyc_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create kyc-actions.tsx**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveKyc, rejectKyc } from "@/lib/actions/kyc";

interface KycActionsProps {
  userId: string;
}

export function KycActions({ userId }: KycActionsProps) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    const formData = new FormData();
    formData.set("user_id", userId);
    await approveKyc(formData);
    setLoading(false);
    router.refresh();
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setLoading(true);
    const formData = new FormData();
    formData.set("user_id", userId);
    formData.set("reason", rejectReason);
    await rejectKyc(formData);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="border-t border-iwb-border-light px-5 py-3 bg-iwb-surface">
      {showReject ? (
        <div className="space-y-3">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            rows={2}
            className="w-full rounded-iwb-md border border-iwb-border bg-white px-3 py-2 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-error focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
              className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-error px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-iwb-error/90 disabled:opacity-50"
            >
              {loading ? "..." : "Confirm Reject"}
            </button>
            <button
              onClick={() => { setShowReject(false); setRejectReason(""); }}
              className="rounded-iwb-md border border-iwb-border px-4 py-2 text-xs font-semibold text-iwb-slate"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-teal px-4 py-2 text-xs font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:opacity-50"
          >
            <i className="material-icons text-sm">check</i>
            Approve
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-iwb-md border border-iwb-error/30 px-4 py-2 text-xs font-semibold text-iwb-error transition-all hover:bg-iwb-error/5 disabled:opacity-50"
          >
            <i className="material-icons text-sm">close</i>
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update admin sidebar**

Read `src/components/features/admin-sidebar.tsx`. Add a "KYC" nav item between "Deposits" and "Activity Log":

```tsx
{
  label: "KYC",
  href: "/admin/kyc",
  icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11a3 3 0 10-4 2.83M20 17.83A3.001 3.001 0 0017 15" />
  ),
},
```

- [ ] **Step 4: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 5: Build check**

Run: `pnpm build`

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/kyc/ src/components/features/admin-sidebar.tsx
git commit -m "feat: add admin KYC page with approve/reject and sidebar nav"
```
