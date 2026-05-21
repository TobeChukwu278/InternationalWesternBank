# KYC Registration & Verification System

**Goal:** Replace the simple 3-field signup with a real bank-grade multi-step registration including identity verification, document uploads, and admin approval.

## Architecture

- Signup: 3-step client wizard → server action creates auth user + pending profile → admin reviews → user notified
- Storage: Supabase Storage for documents and profile photos
- Gate: Dashboard layout checks `profile.status === "active"`, blocks pending/rejected users
- Admin: New KYC page with approve/reject, documents viewer

## DB Changes (`profiles` table)

Add columns:
- `status TEXT` — `pending` (default), `active`, `rejected`
- `kyc_status TEXT` — `not_submitted` (default), `pending`, `verified`, `rejected`
- `phone TEXT`, `date_of_birth TEXT`
- `address_line1 TEXT`, `address_city TEXT`, `address_state TEXT`, `address_zip TEXT`
- `avatar_url TEXT`, `id_document_front TEXT`, `id_document_back TEXT`
- `ssn_last_four TEXT`
- `reviewed_by UUID` (FK to admins), `reviewed_at TIMESTAMPTZ`, `rejection_reason TEXT`

## Storage Buckets

- `profile-photos` — public read, authenticated write, one per user
- `kyc-documents` — admin read only, authenticated write

## Signup Flow (3-Step Wizard)

**Step 1: Personal Information**
- Full name, email, phone, date of birth, home address (line1, city, state, zip), password
- Previous "IWB" branding side panel retained

**Step 2: Identity Documents**
- Upload driver's license / State ID (front + back) — required
- Upload profile photo — required
- SSN (last 4 digits) — optional text field
- File preview thumbnails after upload

**Step 3: Review & Submit**
- Summary card of all entered info
- Thumbnails of uploaded documents
- "Submit" button

## Post-Submit

- Auth user created via `supabase.auth.signUp`
- Profile created with `status: "pending"`, `kyc_status: "pending"`, all collected fields
- Redirect to `/pending-verification` page
- Dashboard layout: if `profile.status !== "active"`, redirect to `/pending-verification`
- Notification created for user: "Registration submitted — pending verification"

## Pending Verification Page

- "Thank you for registering" heading
- Your application is being reviewed
- IWB contact info (phone, email from bank details)
- Redirect to dashboard once status becomes "active"

## Admin KYC Page (`/admin/kyc`)

- List pending users with: name, email, submitted date
- Click to expand/view: personal info, address, uploaded documents (images), SSN
- Approve button → sets status="active", kyc_status="verified", reviewed_by, reviewed_at → sends notification
- Reject button → shows reason textarea → sets status="rejected", kyc_status="rejected" → sends notification with reason

## Admin Sidebar

Add "KYC" nav item between "Deposits" and "Activity Log"

## Files Changed

### New
- `supabase/migrations/00011_kyc_verification.sql`
- `src/app/(auth)/signup/page.tsx` — rewrite with 3-step wizard
- `src/app/(auth)/signup/steps/personal-info.tsx`
- `src/app/(auth)/signup/steps/identity-docs.tsx`
- `src/app/(auth)/signup/steps/review-submit.tsx`
- `src/app/(auth)/pending-verification/page.tsx`
- `src/app/admin/kyc/page.tsx`
- `src/app/admin/kyc/kyc-actions.tsx`

### Modified
- `src/types/database.ts` — add new Profile fields
- `src/lib/actions/auth.ts` — rewrite signup to accept complete profile data
- `src/app/(dashboard)/layout.tsx` — gate on profile status
- `src/components/features/admin-sidebar.tsx` — add KYC nav item
- `src/lib/actions/admin.ts` — add approveKyc / rejectKyc actions
