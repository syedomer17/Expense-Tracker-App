"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export function ResetForm() {
    const router = useRouter();
    const params = useSearchParams();
    const [email, setEmail] = React.useState(params.get("email") ?? "");
    const [code, setCode] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [show, setShow] = React.useState(false);
    const [pending, setPending] = React.useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        try {
            await api.post("/api/user/reset-password", { email, code, newPassword });
            toast.success("Password updated");
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not reset");
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="code">Reset code</Label>
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
            <div className="space-y-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                    <Input
                        id="newPassword"
                        type={show ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                {pending ? "Saving…" : "Reset password"}
            </Button>
        </form>
    );
}
