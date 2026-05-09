import Link from "next/link";
import { Suspense } from "react";
import { ResetForm } from "./reset-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata = { title: "Reset password — Ledger" };

export default function ResetPasswordPage() {
    return (
        <AuthCard
            title="Set a new password"
            description="Enter your reset code and pick a new password."
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
