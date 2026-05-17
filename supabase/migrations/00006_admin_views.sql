-- View that enriches transactions with sender/recipient profile names
CREATE OR REPLACE VIEW transaction_details AS
SELECT
  t.id,
  t.from_sub_account_id,
  t.to_sub_account_id,
  t.amount,
  t.status,
  t.type,
  t.reference,
  t.description,
  t.created_at,
  fp.full_name AS sender_name,
  fp.email AS sender_email,
  tp.full_name AS receiver_name,
  tp.email AS receiver_email
FROM transactions t
LEFT JOIN sub_accounts fs ON fs.id = t.from_sub_account_id
LEFT JOIN accounts fa ON fa.id = fs.account_id
LEFT JOIN profiles fp ON fp.id = fa.user_id
LEFT JOIN sub_accounts ts ON ts.id = t.to_sub_account_id
LEFT JOIN accounts ta ON ta.id = ts.account_id
LEFT JOIN profiles tp ON tp.id = ta.user_id;
