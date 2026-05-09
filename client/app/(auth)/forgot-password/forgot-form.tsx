"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
            <Button type="submit" size="lg" className="h-11 w-full text-sm" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                {pending ? "Sending…" : "Send reset code"}
            </Button>
        </form>
    );
}
