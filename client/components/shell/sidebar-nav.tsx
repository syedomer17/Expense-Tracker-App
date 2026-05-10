"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { PRIMARY_NAV } from "@/components/shell/nav-config";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
    onNavigate?: () => void;
    className?: string;
}

export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = React.useState(false);

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await api.post("/api/user/logout");
            toast.success("Signed out");
            onNavigate?.();
            router.push("/login");
            router.refresh();
        } catch {
            toast.error("Could not sign out");
        } finally {
            setLoggingOut(false);
        }
    }
    return (
        <nav className={cn("flex h-full flex-col gap-6 p-4", className)}>
            <Link
                href="/dashboard"
                onClick={onNavigate}
                className="flex flex-col gap-0.5 px-2 py-1"
            >
                <div className="font-display text-base font-medium tracking-tight">
                    Ledger
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Premium tracker
                </div>
            </Link>

            <div className="space-y-1">
                <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Workspace
                </p>
                {PRIMARY_NAV.map((item) => {
                    const Icon = item.icon;
                    const active =
                        pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition",
                                active
                                    ? "bg-foreground text-background shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="size-4" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-auto flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <LogOut className="size-4" />
                <span>{loggingOut ? "Signing out…" : "Logout"}</span>
            </button>
        </nav>
    );
}
