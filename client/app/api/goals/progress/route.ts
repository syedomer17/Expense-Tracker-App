import { NextResponse } from "next/server";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";
import Goal from "@/models/goalModel";
import {
    buildProgress,
    currentWindow,
    recentHistory,
    streakFor,
    totalsForWindow,
} from "@/lib/savings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HISTORY_COUNTS = [6, 12, 24] as const;

export async function GET(request: Request) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;
        await ConnectDB();

        const url = new URL(request.url);
        const requested = Number(url.searchParams.get("historyCount"));
        const historyCount: (typeof HISTORY_COUNTS)[number] =
            (HISTORY_COUNTS as readonly number[]).includes(requested)
                ? (requested as (typeof HISTORY_COUNTS)[number])
                : 6;

        const goal =
            (await Goal.findOne({ userId: auth.userId }).lean()) ??
            (await Goal.create({ userId: auth.userId })).toObject();

        const weekWindow = currentWindow("week");
        const monthWindow = currentWindow("month");
        const dayWindow = currentWindow("day");

        const [weekTotals, monthTotals, dayTotals, weekStreak, monthStreak, weekHistory, monthHistory] =
            await Promise.all([
                totalsForWindow(auth.userId, weekWindow),
                totalsForWindow(auth.userId, monthWindow),
                totalsForWindow(auth.userId, dayWindow),
                streakFor(auth.userId, "week", goal.weeklyTarget ?? 0),
                streakFor(auth.userId, "month", goal.monthlyTarget ?? 0),
                recentHistory(auth.userId, "week", goal.weeklyTarget ?? 0, historyCount),
                recentHistory(auth.userId, "month", goal.monthlyTarget ?? 0, historyCount),
            ]);

        return NextResponse.json({
            week: buildProgress(weekWindow, weekTotals, goal.weeklyTarget ?? 0),
            month: buildProgress(monthWindow, monthTotals, goal.monthlyTarget ?? 0),
            today: buildProgress(dayWindow, dayTotals, 0),
            streaks: { week: weekStreak, month: monthStreak },
            history: { week: weekHistory, month: monthHistory, count: historyCount },
        });
    } catch (error) {
        console.error("[goals/progress] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
