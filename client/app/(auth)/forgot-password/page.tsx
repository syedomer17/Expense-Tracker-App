import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "./forgot-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
    title: "Forgot password",
    description:
        "Reset your Ledger password. We'll email you a 6-digit verification code so you can set a new one.",
    alternates: { canonical: "/forgot-password" },
    robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
    return (
        <AuthCard
            eyebrow="Account recovery"
            title={
                <>
                    Forgot your{" "}
                    <em className="not-italic font-display italic text-muted-foreground">
                        password
                    </em>
                    ?
                </>
            }
            description="No problem. Enter your email and we'll send you a 6-digit code to set a new one."
            footer={
                <span>
                    Remembered it?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Sign in
                    </Link>
                </span>
            }
        >
            <ForgotForm />
        </AuthCard>
    );
}
