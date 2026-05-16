import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { serverFetch } from "@/lib/server-fetch";

interface MeResponse {
    user: {
        id: string;
        name?: string | null;
        email: string;
        avatarUrl?: string | null;
        createdAt?: string;
    };
}

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { ok, status, data } = await serverFetch<MeResponse>("/api/user/me");
    if (!ok && (status === 401 || status === 403)) {
        redirect("/login");
    }

    const user = data?.user ?? {
        id: "unknown",
        email: "user@local",
        name: "User",
        avatarUrl: null,
    };

    // Non-auth failures (e.g. stale user record) should not force login loops.
    return <AppShell user={user}>{children}</AppShell>;
}
