-- Atomic money transfer between two sub_accounts
-- Returns JSON: { success: boolean, error?: string, transaction?: record }
CREATE OR REPLACE FUNCTION transfer_money(
  p_from_sub_account_id UUID,
  p_to_sub_account_id UUID,
  p_amount NUMERIC(12,2),
  p_reference TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_sender_balance NUMERIC(12,2);
  v_receiver_exists BOOLEAN;
  v_transaction_id UUID;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  -- Check sender has sufficient balance
  SELECT balance INTO v_sender_balance
  FROM sub_accounts
  WHERE id = p_from_sub_account_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Sender account not found');
  END IF;

  IF v_sender_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Check receiver exists
  SELECT EXISTS(SELECT 1 FROM sub_accounts WHERE id = p_to_sub_account_id)
  INTO v_receiver_exists;

  IF NOT v_receiver_exists THEN
    RETURN json_build_object('success', false, 'error', 'Recipient account not found');
  END IF;

  -- Debit sender
  UPDATE sub_accounts
  SET balance = balance - p_amount
  WHERE id = p_from_sub_account_id;

  -- Credit receiver
  UPDATE sub_accounts
  SET balance = balance + p_amount
  WHERE id = p_to_sub_account_id;

  -- Create transaction record
  INSERT INTO transactions (from_sub_account_id, to_sub_account_id, amount, status, type, reference, description)
  VALUES (p_from_sub_account_id, p_to_sub_account_id, p_amount, 'completed', 'transfer', p_reference, p_description)
  RETURNING id INTO v_transaction_id;

  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id
  );
END;
$$;
