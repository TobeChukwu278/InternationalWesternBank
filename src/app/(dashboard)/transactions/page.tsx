import { Card } from "@/components/ui/card";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">Transactions</h1>
        <p className="mt-1 text-sm text-iwb-slate">
          View your transaction history
        </p>
      </div>
      <Card className="p-12 text-center">
        <p className="text-iwb-slate">No transactions yet</p>
      </Card>
    </div>
  );
}
