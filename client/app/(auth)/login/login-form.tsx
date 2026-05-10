"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [show, setShow] = React.useState(false);
    const [pending, setPending] = React.useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        try {
            await api.post("/api/user/login", { email, password });
            toast.success("Welcome back");
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            if (err instanceof ApiError && err.status === 403) {
                toast.error(err.message);
                router.push(`/verify-email?email=${encodeURIComponent(email)}`);
                return;
            }
            if (err instanceof ApiError && err.status >= 500) {
                toast.error(
                    `Server is not reachable right now. Please check your database connection.\n${err.message}`
                );
                return;
            }
            toast.error(err instanceof Error ? err.message : "Could not sign in");
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium tracking-wide">
                    Email
                </Label>
                <div className="relative">
                    <Mail
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
                        aria-hidden
                    />
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 pl-9"
                    />
                </div>
            </div>
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-medium tracking-wide">
                        Password
                    </Label>
                    <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Forgot password?
                    </Link>
                </div>
                <div className="relative">
                    <Lock
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
                        aria-hidden
                    />
                    <Input
                        id="password"
                        type={show ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="h-11 pl-9 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={show ? "Hide password" : "Show password"}
                    >
                        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                </div>
            </div>
            <Button
                type="submit"
                size="lg"
                className="h-11 w-full text-sm font-medium"
                disabled={pending}
            >
                {pending ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Signing in…
                    </>
                ) : (
                    <>
                        Sign in
                        <ArrowRight className="size-4" />
                    </>
                )}
            </Button>
        </form>
    );
}
