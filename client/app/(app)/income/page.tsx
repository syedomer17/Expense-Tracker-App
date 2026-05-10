import type { Metadata } from "next";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export const metadata: Metadata = {
    title: "Income",
    description:
        "Track every income source. Filter, review, and export your earnings to Excel in one click.",
    alternates: { canonical: "/income" },
    robots: { index: false, follow: false },
};

export default function IncomePage() {
    return <TransactionsClient kind="income" />;
}
