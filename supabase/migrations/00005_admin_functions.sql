-- Admin functions for crediting/debiting user accounts
-- These are SECURITY DEFINER so they bypass RLS; access is controlled by the application layer

CREATE OR REPLACE FUNCTION admin_credit_account(
  p_sub_account_id UUID,
  p_amount NUMERIC(12,2),
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_transaction_id UUID;
  v_reference TEXT;
BEGIN
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  v_reference := 'ADM' || to_char(now(), 'YYYYMMDDHH24MISS') || upper(substr(md5(random()::text), 1, 6));

  UPDATE sub_accounts
  SET balance = balance + p_amount
  WHERE id = p_sub_account_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Sub-account not found');
  END IF;

  INSERT INTO transactions (to_sub_account_id, amount, status, type, reference, description)
  VALUES (p_sub_account_id, p_amount, 'completed', 'deposit', v_reference, p_description)
  RETURNING id INTO v_transaction_id;

  RETURN json_build_object('success', true, 'transaction_id', v_transaction_id, 'reference', v_reference);
END;
$$;

CREATE OR REPLACE FUNCTION admin_debit_account(
  p_sub_account_id UUID,
  p_amount NUMERIC(12,2),
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_current_balance NUMERIC(12,2);
  v_transaction_id UUID;
  v_reference TEXT;
BEGIN
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  SELECT balance INTO v_current_balance
  FROM sub_accounts
  WHERE id = p_sub_account_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Sub-account not found');
  END IF;

  IF v_current_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  v_reference := 'ADM' || to_char(now(), 'YYYYMMDDHH24MISS') || upper(substr(md5(random()::text), 1, 6));

  UPDATE sub_accounts
  SET balance = balance - p_amount
  WHERE id = p_sub_account_id;

  INSERT INTO transactions (from_sub_account_id, amount, status, type, reference, description)
  VALUES (p_sub_account_id, p_amount, 'completed', 'withdrawal', v_reference, p_description)
  RETURNING id INTO v_transaction_id;

  RETURN json_build_object('success', true, 'transaction_id', v_transaction_id, 'reference', v_reference);
END;
$$;
