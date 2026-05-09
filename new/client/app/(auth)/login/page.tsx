import Link from "next/link";
import { LoginForm } from "./login-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata = { title: "Sign in — Ledger" };

export default function LoginPage() {
    return (
        <AuthCard
            title="Welcome back"
            description="Sign in to keep tracking your finances."
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
            <LoginForm />
        </AuthCard>
    );
}
