export type AccountType = "savings" | "checking";

export type TransactionStatus = "pending" | "completed" | "failed";
export type TransactionType = "transfer" | "deposit" | "withdrawal";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  account_number: string;
  account_type: AccountType;
  balance: number;
  currency: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  reference: string;
  description: string | null;
  created_at: string;
}
