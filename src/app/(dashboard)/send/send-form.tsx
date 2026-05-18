"use client";

interface SendFormProps {
  subAccounts: { id: string; type: string; balance: number; is_default: boolean }[];
  accountNumber: string;
  recentRecipients: { account_number: string; full_name: string }[];
  preferredCurrency: string;
}

export function SendForm(_props: SendFormProps) {
  return null;
}
