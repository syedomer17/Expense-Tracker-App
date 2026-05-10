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
                    Verify your{" "}
                    <em className="not-italic font-display italic text-muted-foreground">
                        email
                    </em>
                    .
                </>
            }
            description="Enter the 6-digit code we sent to your inbox to activate your account."
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
            <Suspense fallback={null}>
                <VerifyEmailForm />
            </Suspense>
        </AuthCard>
    );
}
