import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { VerifyEmailForm } from "./verify-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
    title: "Verify email",
    description:
        "Confirm your email address with the 6-digit code we sent to your inbox to activate your Ledger account.",
    alternates: { canonical: "/verify-email" },
    robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
    return (
        <AuthCard
            eyebrow="Almost there"
            title={
                <>
                    Enter the code.
                </>
            }
            description="We sent a 6-digit verification code to your inbox. Type it below to activate your account."
            footer={
                <span>
                    Wrong account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Sign in
                    </Link>
                </span>
            }
        >
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        Secure check
                    </p>
                    <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        OTP
                    </span>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                    Tap the boxes or paste the code from your message.
                </p>

                <div className="mt-5">
                    <Suspense fallback={null}>
                        <VerifyEmailForm />
                    </Suspense>
                </div>

                <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                    Didn&apos;t get it? Use resend to get a fresh code.
                </p>
            </div>
        </AuthCard>
    );
}
