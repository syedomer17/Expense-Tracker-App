import type { Metadata } from "next";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export const metadata: Metadata = {
    title: "Expenses",
    description:
        "Browse, filter, and export every expense — by date range, category, or free-text search.",
    alternates: { canonical: "/expense" },
    robots: { index: false, follow: false },
};

export default function ExpensePage() {
    return <TransactionsClient kind="expense" />;
}
