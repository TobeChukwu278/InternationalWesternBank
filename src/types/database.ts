export type SubAccountType = "savings" | "checking";

export type TransactionStatus = "pending" | "completed" | "failed";
export type TransactionType = "deposit" | "withdrawal" | "transfer" | "internal_transfer";

export type AdminRole = "admin" | "super_admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  notifications_enabled: boolean;
  preferred_currency: string;
  theme: string;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  account_number: string;
  created_at: string;
}

export interface SubAccount {
  id: string;
  account_id: string;
  type: SubAccountType;
  balance: number;
  currency: string;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  from_sub_account_id: string | null;
  to_sub_account_id: string | null;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  reference: string;
  description: string | null;
  merchant_name: string | null;
  category: string | null;
  created_at: string;
  scheduled_date: string | null;
}

export interface Admin {
  id: string;
  role: AdminRole;
  created_at: string;
}
