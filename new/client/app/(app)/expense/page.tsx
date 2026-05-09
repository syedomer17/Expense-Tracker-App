import { TransactionsClient } from "@/components/transactions/transactions-client";

export const metadata = { title: "Expenses — Ledger" };

export default function ExpensePage() {
    return <TransactionsClient kind="expense" />;
}
