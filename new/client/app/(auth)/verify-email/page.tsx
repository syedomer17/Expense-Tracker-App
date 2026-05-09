import Link from "next/link";
import { Suspense } from "react";
import { VerifyEmailForm } from "./verify-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata = { title: "Verify email — Ledger" };

export default function VerifyEmailPage() {
    return (
        <AuthCard
            title="Verify your email"
            description="Enter the 6-digit code we sent to your inbox."
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
