"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export function PasswordForm() {
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [show, setShow] = React.useState(false);
    const [pending, setPending] = React.useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        try {
            await api.post("/api/user/password", { currentPassword, newPassword });
            toast.success("Password updated");
            setCurrentPassword("");
            setNewPassword("");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not update");
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="current">Current password</Label>
                <Input
                    id="current"
                    type={show ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="new">New password</Label>
                <div className="relative">
                    <Input
                        id="new"
                        type={show ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={8}
                        maxLength={128}
                        required
                        autoComplete="new-password"
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
                <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long.
                </p>
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={pending}>
                    {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                    {pending ? "Updating…" : "Update password"}
                </Button>
            </div>
        </form>
    );
}
