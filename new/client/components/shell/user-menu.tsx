"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Moon, Sun, UserCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";
import { api } from "@/lib/api";

interface UserMenuProps {
    user: { name?: string | null; email: string };
}

export function UserMenu({ user }: UserMenuProps) {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [pending, setPending] = React.useState(false);
    const displayName =
        (user.name && user.name.trim()) || user.email.split("@")[0] || "Account";
    const firstName = displayName.split(" ")[0];

    async function handleLogout() {
        setPending(true);
        try {
            await api.post("/api/user/logout");
            toast.success("Signed out");
            router.push("/login");
            router.refresh();
        } catch {
            toast.error("Could not sign out");
        } finally {
            setPending(false);
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-2 px-1.5"
                    aria-label="Account menu"
                >
                    <Avatar className="size-7">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold text-white">
                            {initials(displayName)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:inline">
                        {firstName}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="truncate text-xs font-normal text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <UserCircle className="mr-2 size-4" /> Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={(e) => {
                        e.preventDefault();
                        setTheme(theme === "dark" ? "light" : "dark");
                    }}
                >
                    {theme === "dark" ? (
                        <>
                            <Sun className="mr-2 size-4" /> Light mode
                        </>
                    ) : (
                        <>
                            <Moon className="mr-2 size-4" /> Dark mode
                        </>
                    )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                    disabled={pending}
                >
                    <LogOut className="mr-2 size-4" />
                    {pending ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
