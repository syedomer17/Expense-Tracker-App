import Goal from "@/models/goalModel";
import User from "@/models/userModel";
import {
    buildProgress,
    currentWindow,
    streakFor,
    totalsForWindow,
} from "@/lib/savings";
import { appUrlFromRequest, sendGoalHitEmail } from "@/lib/digest";

type Period = "week" | "month";

interface ClaimCandidate {
    period: Period;
    target: number;
    windowStart: Date;
}

export async function checkAndNotifyGoalHit(
    userId: string,
    appUrl: string
): Promise<void> {
    const goal = await Goal.findOne({ userId }).lean();
    if (!goal) return;

    const weekTarget = goal.weeklyTarget ?? 0;
    const monthTarget = goal.monthlyTarget ?? 0;
    if (weekTarget <= 0 && monthTarget <= 0) return;

    const weekWindow = currentWindow("week");
    const monthWindow = currentWindow("month");

    const candidates: ClaimCandidate[] = [];
    if (weekTarget > 0) {
        const totals = await totalsForWindow(userId, weekWindow);
        if (totals.savings >= weekTarget) {
            candidates.push({
                period: "week",
                target: weekTarget,
                windowStart: weekWindow.start,
            });
        }
    }
    if (monthTarget > 0) {
        const totals = await totalsForWindow(userId, monthWindow);
        if (totals.savings >= monthTarget) {
            candidates.push({
                period: "month",
                target: monthTarget,
                windowStart: monthWindow.start,
            });
        }
    }
    if (!candidates.length) return;

    const claimed: ClaimCandidate[] = [];
    for (const c of candidates) {
        const field = `lastSent.goalHit.${c.period}`;
        const result = await Goal.updateOne(
            {
                _id: goal._id,
                $or: [
                    { [field]: null },
                    { [field]: { $exists: false } },
                    { [field]: { $lt: c.windowStart } },
                ],
            },
            { $set: { [field]: new Date() } }
        );
        if (result.modifiedCount === 1) claimed.push(c);
    }
    if (!claimed.length) return;

    const user = await User.findById(userId).select("name email").lean();
    if (!user?.email) return;

    const name = user.name?.split(" ")[0] ?? "there";

    for (const c of claimed) {
        try {
            const window = c.period === "week" ? weekWindow : monthWindow;
            const totals = await totalsForWindow(userId, window);
            const progress = buildProgress(window, totals, c.target);
            const streak = await streakFor(userId, c.period, c.target);
            await sendGoalHitEmail({
                to: user.email,
                appUrl,
                name,
                period: c.period,
                progress,
                streak,
            });
        } catch (err) {
            console.error(`[goalNotify] ${c.period} email error:`, err);
        }
    }
}

export { appUrlFromRequest };
