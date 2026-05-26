ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recipient_account_number TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recipient_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recipient_bank TEXT;
