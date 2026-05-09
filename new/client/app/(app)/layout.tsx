import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { serverFetch } from "@/lib/server-fetch";

interface MeResponse {
    user: {
        id: string;
        name?: string | null;
        email: string;
        createdAt?: string;
    };
}

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { ok, data } = await serverFetch<MeResponse>("/api/user/me");
    if (!ok || !data?.user) {
        redirect("/login");
    }
    return <AppShell user={data.user}>{children}</AppShell>;
}
