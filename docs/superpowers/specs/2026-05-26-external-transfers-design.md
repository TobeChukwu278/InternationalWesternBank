# External Transfers — Design Spec

## Summary

Replace the internal IWB account search with manual entry fields for external transfers. When an admin approves an external transfer, a PDF receipt is generated and attached to the notification email.

## Database Changes

Add 3 nullable columns to `transactions` table via migration `00015_add_external_recipient.sql`:

```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recipient_account_number TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recipient_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recipient_bank TEXT;
```

External transfers leave `to_sub_account_id` as NULL. Internal transfers (between IWB users) continue to use `to_sub_account_id` as before.

## Form Changes (`send-form.tsx`, `send/page.tsx`)

### Recipient section
Replace `RecipientSearch` component (which searches IWB `accounts` table) with 3 manual text inputs:

- **Account Number** (`recipient_account_number`) — required text input
- **Account Holder Name** (`recipient_name`) — required text input
- **Bank Name** (`recipient_bank`) — required text input

Remove the "recent recipients" feature (it only made sense for internal IWB transfers).

### Rest of form
Unaffected — amount, from-account dropdown, description, schedule toggle, confirmation modal all stay the same.

### Send page (`send/page.tsx`)
Remove:
- The `recentRecipients` fetch logic (querying past transactions to find IWB recipients)
- The `RecipientInfo` type
- The `recipientSubIds` query chain

The `SendForm` props change: remove `recentRecipients`, add `accountNumber` (already there).

## Server Action Changes (`transfer.ts`)

### `sendMoney`
- Remove the IWB account lookup for recipient
- Remove the recipient sub-account resolution
- Accept new FormData fields: `recipient_account_number`, `recipient_name`, `recipient_bank`
- Create pending transaction with `to_sub_account_id = null` and populate the 3 new columns
- Remove the "Money Received" notification for external transfers (recipient is not an IWB user)

### `approveTransfer`
- Detect external vs internal: check if `tx.to_sub_account_id` is null
- External: call `admin_debit_account` RPC to debit sender (no credit). Skip the recipient notification.
- Internal: use existing `transfer_money` RPC (unchanged)
- On approval, generate PDF receipt and attach it to the notification email
- For the email: modify `createNotificationSystem` to accept an optional PDF buffer/attachment parameter

### `rejectTransfer`
- Unchanged — marks transaction as failed, notifies sender

## Email Receipt

### PDF Generation
Use `jspdf` (already installed) to generate a PDF receipt when a transfer is approved. The receipt includes:

```
IWB — International Western Bank
OFFICIAL PAYMENT RECEIPT

Reference:  TXN-abc12345
Date:       May 26, 2026
Status:     Completed

Amount:     $500.00

SENDER
  Name:        Jane Smith
  Account:     •••• 1234

RECIPIENT
  Name:        John Doe
  Account:     •••• 6789
  Bank:        Chase Bank

Thank you for banking with IWB.
249 E Ocean Blvd, Long Beach, CA 90802
```

### Nodemailer Attachment
`sendEmail` accepts an optional `attachments` array. When present, the receipt PDF is sent as an email attachment.

The `createNotificationSystem` function signature gains an optional `attachment` parameter:
```typescript
{ filename: string; content: Buffer; contentType: string }
```

### Template updates (`email-templates.ts`)
The transfer approval email body is updated to mention that a receipt PDF is attached.

## Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/00015_add_external_recipient.sql` | New — add 3 columns |
| `src/lib/email.ts` | Add optional `attachments` parameter to `sendEmail` |
| `src/lib/email-templates.ts` | Update transfer approval template to mention attached receipt |
| `src/lib/actions/notifications.ts` | Pass attachment from caller to email sender |
| `src/lib/actions/transfer.ts` | Rewrite `sendMoney`, update `approveTransfer` with PDF generation |
| `src/app/(dashboard)/send/page.tsx` | Remove IWB recipient fetch logic |
| `src/app/(dashboard)/send/send-form.tsx` | Replace RecipientSearch with 3 manual fields |
| `src/app/(dashboard)/send/send-confirmation.tsx` | Show recipient account details |
| `src/components/features/recipient-search.tsx` | Remove (replaced by inline fields) |
| `src/app/api/recipients/route.ts` | Remove (no longer needed) |
| `src/app/(auth)/signup/page.tsx` | Remove unused import |
| i18n dictionaries (en/es/fr) | Add keys for new form labels |

## Testing

- Unit tests for PDF receipt generation
- Update email template tests for the attachment mention
- Test `sendMoney` with external fields (no IWB lookup)
- Test `approveTransfer` external path (debit only, receipt generated)
