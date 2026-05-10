import type { Metadata } from "next";
import { GoalsClient } from "@/components/goals/goals-client";

export const metadata: Metadata = {
    title: "Goals",
    description:
        "Set savings goals, track your progress over time, and get notified the moment you hit a milestone.",
    alternates: { canonical: "/goals" },
    robots: { index: false, follow: false },
};

export default function GoalsPage() {
    return <GoalsClient />;
}
