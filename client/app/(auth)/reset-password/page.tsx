import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ResetForm } from "./reset-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
    title: "Reset password",
    description:
        "Set a new password for your Ledger account using the reset code we emailed to you.",
    alternates: { canonical: "/reset-password" },
    robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
    return (
        <AuthCard
            eyebrow="Account recovery"
            title={
                <>
                    Set a{" "}
                    <em className="not-italic font-display italic text-muted-foreground">
                        new
                    </em>{" "}
                    password.
                </>
            }
            description="Enter the 6-digit code from your email and choose a new password."
            footer={
                <span>
                    Back to{" "}
                    <Link
                        href="/login"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        sign in
                    </Link>
                </span>
            }
        >
            <Suspense fallback={null}>
                <ResetForm />
            </Suspense>
        </AuthCard>
    );
}
