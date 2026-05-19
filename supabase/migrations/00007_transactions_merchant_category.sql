ALTER TABLE transactions ADD COLUMN IF NOT EXISTS merchant_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';

-- Backfill existing rows
UPDATE transactions SET category = 'transfer' WHERE category = 'other' AND type IN ('transfer', 'internal_transfer');
UPDATE transactions SET category = 'deposit' WHERE category = 'other' AND type = 'deposit';
UPDATE transactions SET category = 'withdrawal' WHERE category = 'other' AND type = 'withdrawal';
UPDATE transactions SET merchant_name = description WHERE merchant_name IS NULL;
