ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (id = auth.uid() OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY accounts_select_own ON accounts
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY sub_accounts_select_own ON sub_accounts
  FOR SELECT USING (
    account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

CREATE POLICY transactions_select_own ON transactions
  FOR SELECT USING (
    from_sub_account_id IN (SELECT s.id FROM sub_accounts s JOIN accounts a ON a.id = s.account_id WHERE a.user_id = auth.uid())
    OR to_sub_account_id IN (SELECT s.id FROM sub_accounts s JOIN accounts a ON a.id = s.account_id WHERE a.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );
