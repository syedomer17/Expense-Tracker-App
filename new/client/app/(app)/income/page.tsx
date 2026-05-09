import { TransactionsClient } from "@/components/transactions/transactions-client";

export const metadata = { title: "Income — Ledger" };

export default function IncomePage() {
    return <TransactionsClient kind="income" />;
}
