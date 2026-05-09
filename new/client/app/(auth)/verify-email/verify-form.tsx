"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export function VerifyEmailForm() {
    const router = useRouter();
    const params = useSearchParams();
    const initialEmail = params.get("email") ?? "";
    const [email, setEmail] = React.useState(initialEmail);
    const [code, setCode] = React.useState("");
    const [pending, setPending] = React.useState(false);
    const [resending, setResending] = React.useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        try {
            await api.post("/api/user/verify-email", { email, code });
            toast.success("Email verified");
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Verification failed");
        } finally {
            setPending(false);
        }
    }

    async function onResend() {
        if (!email) {
            toast.error("Enter your email first");
            return;
        }
        setResending(true);
        try {
            await api.post("/api/user/resend-verification", { email });
            toast.success("If your account is unverified, a new code has been sent");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not resend");
        } finally {
            setResending(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
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
                <Label htmlFor="code">Verification code</Label>
                <Input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                    className="text-center font-mono text-base tracking-[0.4em]"
                />
            </div>
            <Button type="submit" size="lg" className="h-11 w-full text-sm" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                {pending ? "Verifying…" : "Verify email"}
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={onResend}
                disabled={resending}
            >
                {resending ? "Sending…" : "Resend code"}
            </Button>
        </form>
    );
}
