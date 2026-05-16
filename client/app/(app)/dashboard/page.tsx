import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { serverFetch } from "@/lib/server-fetch";
import type { DashboardResult } from "@/lib/dashboard";

export const metadata: Metadata = {
    title: "Dashboard",
    description:
        "Your personal finance dashboard — totals, top categories, savings rate, and time-series charts at a glance.",
    alternates: { canonical: "/dashboard" },
    robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const initialRange = "month" as const;
    const { ok, status, data } = await serverFetch<{ dashboard: DashboardResult }>(
        `/api/dashboard?range=${initialRange}`
    );
    if (!ok && (status === 401 || status === 403)) redirect("/login");
    if (!data?.dashboard) {
        throw new Error("Failed to load dashboard data");
    }

    return (
        <DashboardClient
            initialData={data.dashboard}
            initialRange={initialRange}
        />
    );
}
