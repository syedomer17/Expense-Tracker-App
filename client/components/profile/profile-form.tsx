"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

interface ProfileFormProps {
    initial: { name: string; email: string };
}

export function ProfileForm({ initial }: ProfileFormProps) {
    const router = useRouter();
    const [name, setName] = React.useState(initial.name);
    const [email, setEmail] = React.useState(initial.email);
    const [pending, setPending] = React.useState(false);
    const dirty = name !== initial.name || email !== initial.email;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!dirty) return;
        setPending(true);
        try {
            await api.patch("/api/user/profile", { name, email });
            toast.success("Profile updated");
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not update");
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                        id="name"
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={pending || !dirty}>
                    {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                    {pending ? "Saving…" : "Save changes"}
                </Button>
            </div>
        </form>
    );
}
