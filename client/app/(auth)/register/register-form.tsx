"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
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
                    `Server is not reachable right now. Please check your database connection.\n${err.message}`
                );
            } else {
                toast.error(err instanceof Error ? err.message : "Could not register");
            }
        } finally {
            setPending(false);
        }
    }

    const strength = passwordStrength(password);

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium tracking-wide">
                    Full name
                </Label>
                <div className="relative">
                    <UserRound
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
                        aria-hidden
                    />
                    <Input
                        id="name"
                        autoComplete="name"
                        placeholder="Jane Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        minLength={2}
                        maxLength={100}
                        required
                        className="h-11 pl-9"
                    />
                </div>
            </div>

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
                <Label htmlFor="password" className="text-xs font-medium tracking-wide">
                    Password
                </Label>
                <div className="relative">
                    <Lock
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
                        aria-hidden
                    />
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
                <PasswordStrength score={strength.score} label={strength.label} active={password.length > 0} />
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
                        Creating account…
                    </>
                ) : (
                    <>
                        Create account
                        <ArrowRight className="size-4" />
                    </>
                )}
            </Button>

            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                By creating an account you agree to our terms and privacy policy.
            </p>
        </form>
    );
}

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
    if (!pw) return { score: 0, label: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
    const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
    const labels = ["Too short", "Weak", "Okay", "Good", "Strong"];
    return { score: clamped, label: labels[clamped] };
}

function PasswordStrength({
    score,
    label,
    active,
}: {
    score: 0 | 1 | 2 | 3 | 4;
    label: string;
    active: boolean;
}) {
    const colors = [
        "bg-muted",
        "bg-rose-500/80",
        "bg-amber-500/80",
        "bg-emerald-500/70",
        "bg-emerald-500",
    ];
    return (
        <div
            className="flex items-center gap-2 pt-1 transition-opacity"
            style={{ opacity: active ? 1 : 0.4 }}
        >
            <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((n) => (
                    <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-colors ${score >= n ? colors[score] : "bg-muted"
                            }`}
                    />
                ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {active ? label : "Strength"}
            </span>
        </div>
    );
}
