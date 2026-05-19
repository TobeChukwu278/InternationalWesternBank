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
