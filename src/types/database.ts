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
  status: "pending" | "active" | "rejected";
  kyc_status: "not_submitted" | "pending" | "verified" | "rejected";
  phone: string | null;
  date_of_birth: string | null;
  address_line1: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  avatar_url: string | null;
  id_document_front: string | null;
  id_document_back: string | null;
  ssn_last_four: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
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

export type NotificationType = "transfer" | "deposit" | "system";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  reference: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Admin {
  id: string;
  role: AdminRole;
  created_at: string;
}
