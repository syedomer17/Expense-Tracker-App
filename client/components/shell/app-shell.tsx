"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { UserMenu } from "@/components/shell/user-menu";
import { PRIMARY_NAV } from "@/components/shell/nav-config";

interface AppShellProps {
    user: { name?: string | null; email: string };
    children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
    const pathname = usePathname();
    const [open, setOpen] = React.useState(false);
    const current = PRIMARY_NAV.find(
        (i) => pathname === i.href || pathname?.startsWith(`${i.href}/`)
    );

    return (
        <div className="flex min-h-screen w-full bg-background">
            <aside className="sticky top-0 hidden h-screen w-64 shrink-0 self-start overflow-y-auto border-r border-border/60 bg-sidebar lg:block">
                <SidebarNav />
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="lg:hidden"
                                aria-label="Open menu"
                            >
                                <Menu className="size-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Navigation</SheetTitle>
                            </SheetHeader>
                            <SidebarNav onNavigate={() => setOpen(false)} />
                        </SheetContent>
                    </Sheet>

                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 lg:hidden"
                        >
                            <span className="font-display text-base font-medium tracking-tight">
                                Ledger
                            </span>
                        </Link>
                        {current ? (
                            <span className="hidden truncate text-sm font-medium text-muted-foreground lg:inline">
                                {current.label}
                            </span>
                        ) : null}
                    </div>

                    <UserMenu user={user} />
                </header>

                <main className="flex-1">
                    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
