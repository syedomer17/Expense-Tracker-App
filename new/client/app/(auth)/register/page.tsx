import Link from "next/link";
import { RegisterForm } from "./register-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata = { title: "Create account — Ledger" };

export default function RegisterPage() {
    return (
        <AuthCard
            title="Create your account"
            description="Start tracking your finances in under a minute."
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
            <RegisterForm />
        </AuthCard>
    );
}
