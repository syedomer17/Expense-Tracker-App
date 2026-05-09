import { NextResponse } from "next/server";
import { startOfDay } from "date-fns";
import { ConnectDB } from "@/lib/db";
import Goal from "@/models/goalModel";
import User from "@/models/userModel";
import { buildProgress, currentWindow, totalsForWindow } from "@/lib/savings";
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
        const today = startOfDay(new Date());
        const weekWindow = currentWindow("week");
        const goals = await Goal.find({ "email.daily": true }).lean();
        const appUrl = appUrlFromRequest(request);

        let sent = 0;
        let skipped = 0;
        const errors: Array<{ userId: string; error: string }> = [];

        for (const goal of goals) {
            try {
                if (goal.lastSent?.daily && goal.lastSent.daily >= today) {
                    skipped++;
                    continue;
                }
                const user = await User.findById(goal.userId).select("name email").lean();
                if (!user?.email) {
                    skipped++;
                    continue;
                }

                const totals = await totalsForWindow(String(goal.userId), weekWindow);
                const progress = buildProgress(weekWindow, totals, goal.weeklyTarget ?? 0);

                await sendDigestEmail({
                    to: user.email,
                    appUrl,
                    name: user.name?.split(" ")[0] ?? "there",
                    period: "day",
                    progress,
                });

                await Goal.updateOne(
                    { _id: goal._id },
                    { $set: { "lastSent.daily": new Date() } }
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
        console.error("[cron/daily-digest] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
