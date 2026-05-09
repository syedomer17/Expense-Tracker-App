"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { PRIMARY_NAV } from "@/components/shell/nav-config";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
    onNavigate?: () => void;
    className?: string;
}

export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
    const pathname = usePathname();
    return (
        <nav className={cn("flex h-full flex-col gap-6 p-4", className)}>
            <Link
                href="/dashboard"
                onClick={onNavigate}
                className="flex items-center gap-2.5 px-2 py-1"
            >
                <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
                    <Sparkles className="size-4" />
                </div>
                <div className="leading-tight">
                    <div className="text-sm font-semibold tracking-tight">Ledger</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Premium tracker
                    </div>
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

            <div className="mt-auto rounded-xl border border-border/60 bg-gradient-to-br from-muted/50 to-muted/20 p-3">
                <p className="text-xs font-semibold tracking-tight">Pro tip</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Aim for a 20%+ savings rate to keep your future self happy.
                </p>
            </div>
        </nav>
    );
}
