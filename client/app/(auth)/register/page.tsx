import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthDivider, OAuthButtons } from "@/components/auth/oauth-buttons";

export const metadata: Metadata = {
    title: "Create account",
    description:
        "Sign up for Ledger and start tracking your income, expenses, and savings goals in under a minute.",
    alternates: { canonical: "/register" },
    openGraph: {
        title: "Create your Ledger account",
        description: "Start tracking your income, expenses, and savings goals in under a minute.",
        url: "/register",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Create your Ledger account",
        description: "Start tracking your income, expenses, and savings goals in under a minute.",
    },
};

export default function RegisterPage() {
    return (
        <AuthCard
            eyebrow="Get started · Free"
            title={
                <>
                    Create your{" "}
                    <em className="not-italic font-display italic text-muted-foreground">
                        account
                    </em>
                    .
                </>
            }
            description="Start tracking your finances in under a minute. No credit card required."
            footer={
                <span>
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Sign in
                    </Link>
                </span>
            }
        >
            <OAuthButtons />
            <AuthDivider />
            <RegisterForm />
        </AuthCard>
    );
}
