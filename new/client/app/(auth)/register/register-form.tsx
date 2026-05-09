"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";

export function RegisterForm() {
    const router = useRouter();
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [show, setShow] = React.useState(false);
    const [pending, setPending] = React.useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        try {
            await api.post("/api/user/register", { name, email, password });
            toast.success("Account created — check your inbox to verify");
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (err) {
            if (err instanceof ApiError && err.status >= 500) {
                toast.error(
                    "Server is not reachable right now. Please check your database connection.",
                    { description: err.message }
                );
            } else {
                toast.error(err instanceof Error ? err.message : "Could not register");
            }
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                    id="name"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={2}
                    maxLength={100}
                    required
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={show ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        maxLength={128}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                        aria-label={show ? "Hide password" : "Show password"}
                    >
                        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                </div>
            </div>
            <Button type="submit" size="lg" className="h-11 w-full text-sm" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                {pending ? "Creating account…" : "Create account"}
            </Button>
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                By creating an account you agree to our terms and privacy policy.
            </p>
        </form>
    );
}
