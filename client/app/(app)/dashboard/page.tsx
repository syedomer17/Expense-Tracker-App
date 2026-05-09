import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { serverFetch } from "@/lib/server-fetch";
import type { DashboardResult } from "@/lib/dashboard";

export const metadata = { title: "Dashboard — Ledger" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const initialRange = "month" as const;
    const { ok, data } = await serverFetch<{ dashboard: DashboardResult }>(
        `/api/dashboard?range=${initialRange}`
    );
    if (!ok || !data) redirect("/login");

    return (
        <DashboardClient
            initialData={data.dashboard}
            initialRange={initialRange}
        />
    );
}
