"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export function ForgotForm() {
    const router = useRouter();
    const [email, setEmail] = React.useState("");
    const [pending, setPending] = React.useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        try {
            await api.post("/api/user/forgot-password", { email });
            toast.success("If that email exists, a reset code is on the way");
            router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not send code");
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
            <Button
                type="submit"
                size="lg"
                className="h-11 w-full text-sm font-medium"
                disabled={pending}
            >
                {pending ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Sending…
                    </>
                ) : (
                    <>
                        Send reset code
                        <ArrowRight className="size-4" />
                    </>
                )}
            </Button>
            <p className="rounded-md border border-dashed border-border/70 bg-muted/30 px-3 py-2.5 text-center text-[11px] leading-relaxed text-muted-foreground">
                We&apos;ll email you a 6-digit code valid for 10 minutes.
            </p>
        </form>
    );
}
