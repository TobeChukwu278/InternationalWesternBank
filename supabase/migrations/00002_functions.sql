CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  digits TEXT;
  tries INT := 0;
BEGIN
  LOOP
    digits := lpad(floor(random() * 10000000000)::TEXT, 10, '0');
    IF NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = digits) THEN
      RETURN digits;
    END IF;
    tries := tries + 1;
    IF tries >= 10 THEN
      RAISE EXCEPTION 'Could not generate unique account number after 10 attempts';
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_account_id UUID;
  v_account_number TEXT;
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'));

  v_account_number := generate_account_number();

  INSERT INTO accounts (user_id, account_number)
  VALUES (NEW.id, v_account_number)
  RETURNING id INTO v_account_id;

  INSERT INTO sub_accounts (account_id, type, is_default)
  VALUES (v_account_id, 'checking', true);

  INSERT INTO sub_accounts (account_id, type, is_default)
  VALUES (v_account_id, 'savings', false);

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
