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
    return runWeekly(request);
}

export async function GET(request: Request) {
    if (!isAuthorizedCron(request)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return runWeekly(request);
}

async function runWeekly(request: Request) {
    try {
        await ConnectDB();
        const window = previousWindow("week");
        const goals = await Goal.find({ "email.weekly": true }).lean();
        const appUrl = appUrlFromRequest(request);

        let sent = 0;
        let skipped = 0;
        const errors: Array<{ userId: string; error: string }> = [];

        for (const goal of goals) {
            try {
                if (goal.lastSent?.weekly && goal.lastSent.weekly >= window.start) {
                    skipped++;
                    continue;
                }
                const user = await User.findById(goal.userId).select("name email").lean();
                if (!user?.email) {
                    skipped++;
                    continue;
                }

                const totals = await totalsForWindow(String(goal.userId), window);
                const progress = buildProgress(window, totals, goal.weeklyTarget ?? 0);
                const streak = await streakFor(
                    String(goal.userId),
                    "week",
                    goal.weeklyTarget ?? 0
                );

                await sendDigestEmail({
                    to: user.email,
                    appUrl,
                    name: user.name?.split(" ")[0] ?? "there",
                    period: "week",
                    progress,
                    streak,
                });

                await Goal.updateOne(
                    { _id: goal._id },
                    { $set: { "lastSent.weekly": new Date() } }
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
        console.error("[cron/weekly-digest] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
