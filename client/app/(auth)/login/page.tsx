import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthDivider, OAuthButtons } from "@/components/auth/oauth-buttons";

export const metadata: Metadata = {
    title: "Sign in",
    description:
        "Sign in to Ledger with email, Google, or GitHub and pick up your finances right where you left off.",
    alternates: { canonical: "/login" },
    openGraph: {
        title: "Sign in — Ledger",
        description: "Sign in to Ledger and pick up your finances right where you left off.",
        url: "/login",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sign in — Ledger",
        description: "Sign in to Ledger and pick up your finances right where you left off.",
    },
};

export default function LoginPage() {
    return (
        <AuthCard
            eyebrow="Sign in"
            title={
                <>
                    Welcome <em className="not-italic font-display italic text-muted-foreground">back</em>.
                </>
            }
            description="Sign in to keep tracking your income, expenses, and goals."
            footer={
                <span>
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Create one
                    </Link>
                </span>
            }
        >
            <OAuthButtons />
            <AuthDivider />
            <LoginForm />
        </AuthCard>
    );
}
