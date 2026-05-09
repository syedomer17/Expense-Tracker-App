import { NextResponse } from "next/server";
import { ConnectDB } from "@/lib/db";
import Goal from "@/models/goalModel";
import User from "@/models/userModel";
import {
    buildProgress,
    previousWindow,
    streakFor,
    totalsForWindow,
} from "@/lib/savings";
import { appUrlFromRequest, isAuthorizedCron, sendDigestEmail } from "@/lib/digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    if (!isAuthorizedCron(request)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return run(request);
}

export async function GET(request: Request) {
    if (!isAuthorizedCron(request)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return run(request);
}

async function run(request: Request) {
    try {
        await ConnectDB();
        const window = previousWindow("month");
        const goals = await Goal.find({ "email.monthly": true }).lean();
        const appUrl = appUrlFromRequest(request);

        let sent = 0;
        let skipped = 0;
        const errors: Array<{ userId: string; error: string }> = [];

        for (const goal of goals) {
            try {
                if (goal.lastSent?.monthly && goal.lastSent.monthly >= window.start) {
                    skipped++;
                    continue;
                }
                const user = await User.findById(goal.userId).select("name email").lean();
                if (!user?.email) {
                    skipped++;
                    continue;
                }

                const totals = await totalsForWindow(String(goal.userId), window);
                const progress = buildProgress(window, totals, goal.monthlyTarget ?? 0);
                const streak = await streakFor(
                    String(goal.userId),
                    "month",
                    goal.monthlyTarget ?? 0
                );

                await sendDigestEmail({
                    to: user.email,
                    appUrl,
                    name: user.name?.split(" ")[0] ?? "there",
                    period: "month",
                    progress,
                    streak,
                });

                await Goal.updateOne(
                    { _id: goal._id },
                    { $set: { "lastSent.monthly": new Date() } }
                );
                sent++;
            } catch (err) {
                errors.push({
                    userId: String(goal.userId),
                    error: err instanceof Error ? err.message : "unknown",
                });
            }
        }

        return NextResponse.json({ ok: true, sent, skipped, errors });
    } catch (error) {
        console.error("[cron/monthly-digest] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
