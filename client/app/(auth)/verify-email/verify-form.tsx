"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const OTP_LENGTH = 6;

export function VerifyEmailForm() {
    const router = useRouter();
    const params = useSearchParams();
    const initialEmail = params.get("email") ?? "";
    const [email] = React.useState(initialEmail);
    const [digits, setDigits] = React.useState<string[]>(() => Array(OTP_LENGTH).fill(""));
    const [pending, setPending] = React.useState(false);
    const [resending, setResending] = React.useState(false);
    const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

    const code = digits.join("");
    const complete = digits.every(Boolean);

    function focusIndex(index: number) {
        inputsRef.current[index]?.focus();
        inputsRef.current[index]?.select();
    }

    function setDigitAt(index: number, value: string) {
        setDigits((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    }

    function handleChange(index: number, value: string) {
        const digit = value.replace(/\D/g, "").slice(-1);
        setDigitAt(index, digit);
        if (digit && index < OTP_LENGTH - 1) {
            focusIndex(index + 1);
        }
    }

    function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Backspace" && !digits[index] && index > 0) {
            event.preventDefault();
            focusIndex(index - 1);
            setDigitAt(index - 1, "");
        }
        if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();
            focusIndex(index - 1);
        }
        if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
            event.preventDefault();
            focusIndex(index + 1);
        }
    }

    function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
        event.preventDefault();
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;

        const next = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((digit, index) => {
            next[index] = digit;
        });
        setDigits(next);
        focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!complete) {
            toast.error("Enter the 6-digit code");
            return;
        }
        setPending(true);
        try {
            await api.post("/api/user/verify-email", { email, code });
            toast.success("Email verified. Welcome aboard.");
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
            toast.error("Please go back and register again");
            return;
        }
        setResending(true);
        try {
            await api.post("/api/user/resend-verification", { email });
            toast.success("A new code has been sent");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not resend");
        } finally {
            setResending(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <input type="hidden" name="email" value={email} />

            <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {digits.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => {
                            inputsRef.current[index] = el;
                        }}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        aria-label={`Digit ${index + 1}`}
                        className="h-14 rounded-2xl border border-border/90 bg-card text-center font-mono text-2xl text-foreground shadow-[0_1px_0_rgba(255,255,255,0.02),0_10px_20px_rgba(0,0,0,0.04)] outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-ring/15 sm:h-16"
                    />
                ))}
            </div>

            <div className="flex items-center justify-between gap-3">
                <p className="text-xs leading-relaxed text-muted-foreground">
                    Tap the boxes, paste the code, or let your keyboard auto-fill it.
                </p>
                <span className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {code.length}/{OTP_LENGTH}
                </span>
            </div>

            <Button
                type="submit"
                size="lg"
                className="h-12 w-full rounded-2xl text-sm font-medium"
                disabled={pending}
            >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                {pending ? "Verifying…" : "Verify and continue"}
            </Button>

            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full rounded-2xl border border-border/60 bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={onResend}
                disabled={resending}
            >
                {resending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
                {resending ? "Sending new code…" : "Resend code"}
            </Button>
        </form>
    );
}
