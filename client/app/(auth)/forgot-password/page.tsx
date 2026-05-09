import Link from "next/link";
import { ForgotForm } from "./forgot-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata = { title: "Forgot password — Ledger" };

export default function ForgotPasswordPage() {
    return (
        <AuthCard
            title="Forgot your password?"
            description="We'll email you a 6-digit code to reset it."
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
