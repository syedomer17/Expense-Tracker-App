import mongoose from "mongoose";
import {
    addDays,
    addMonths,
    addWeeks,
    differenceInCalendarDays,
    endOfDay,
    endOfMonth,
    endOfWeek,
    format,
    startOfDay,
    startOfMonth,
    startOfWeek,
} from "date-fns";
import Income from "@/models/incomeModel";
import Expense from "@/models/expenseModel";

export type Period = "day" | "week" | "month";

export interface PeriodWindow {
    period: Period;
    start: Date;
    end: Date;
    label: string;
}

const WEEK_OPTS = { weekStartsOn: 1 } as const;

export function currentWindow(period: Period, now: Date = new Date()): PeriodWindow {
    if (period === "day") {
        return {
            period,
            start: startOfDay(now),
            end: endOfDay(now),
            label: format(now, "EEE, MMM d"),
        };
    }
    if (period === "week") {
        const start = startOfWeek(now, WEEK_OPTS);
        const end = endOfWeek(now, WEEK_OPTS);
        return { period, start, end, label: `Week of ${format(start, "MMM d")}` };
    }
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return { period, start, end, label: format(now, "MMMM yyyy") };
}

export function previousWindow(period: Period, now: Date = new Date()): PeriodWindow {
    if (period === "day") return currentWindow("day", addDays(now, -1));
    if (period === "week") return currentWindow("week", addWeeks(now, -1));
    return currentWindow("month", addMonths(now, -1));
}

export interface PeriodTotals {
    income: number;
    expense: number;
    savings: number;
}

async function sumAmount(
    Model: typeof Income | typeof Expense,
    userObjectId: mongoose.Types.ObjectId,
    start: Date,
    end: Date
): Promise<number> {
    const rows = await Model.aggregate<{ total: number }>([
        { $match: { userId: userObjectId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return Number(rows[0]?.total ?? 0);
}

export async function totalsForWindow(
    userId: string,
    window: PeriodWindow
): Promise<PeriodTotals> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const [income, expense] = await Promise.all([
        sumAmount(Income, userObjectId, window.start, window.end),
        sumAmount(Expense, userObjectId, window.start, window.end),
    ]);
    return { income, expense, savings: income - expense };
}

export interface ProgressSummary {
    window: { period: Period; start: string; end: string; label: string };
    totals: PeriodTotals;
    target: number;
    percent: number | null;
    pace: "ahead" | "on-track" | "behind" | "no-target";
    paceDelta: number;
    daysElapsed: number;
    daysTotal: number;
}

export function buildProgress(
    window: PeriodWindow,
    totals: PeriodTotals,
    target: number,
    now: Date = new Date()
): ProgressSummary {
    const daysTotal = Math.max(
        1,
        differenceInCalendarDays(window.end, window.start) + 1
    );
    const elapsedRaw = differenceInCalendarDays(now, window.start) + 1;
    const daysElapsed = Math.min(daysTotal, Math.max(1, elapsedRaw));

    let percent: number | null = null;
    let pace: ProgressSummary["pace"] = "no-target";
    let paceDelta = 0;

    if (target > 0) {
        percent = (totals.savings / target) * 100;
        const expectedSoFar = (target * daysElapsed) / daysTotal;
        paceDelta = totals.savings - expectedSoFar;
        if (totals.savings >= target) pace = "ahead";
        else if (paceDelta >= 0) pace = "on-track";
        else pace = "behind";
    }

    return {
        window: {
            period: window.period,
            start: window.start.toISOString(),
            end: window.end.toISOString(),
            label: window.label,
        },
        totals,
        target,
        percent,
        pace,
        paceDelta,
        daysElapsed,
        daysTotal,
    };
}

export async function streakFor(
    userId: string,
    period: "week" | "month",
    target: number,
    now: Date = new Date(),
    maxLookback = 12
): Promise<number> {
    if (target <= 0) return 0;
    let streak = 0;
    let cursor =
        period === "week"
            ? addWeeks(startOfWeek(now, WEEK_OPTS), -1)
            : addMonths(startOfMonth(now), -1);
    for (let i = 0; i < maxLookback; i++) {
        const window = currentWindow(period, cursor);
        const totals = await totalsForWindow(userId, window);
        if (totals.savings >= target) {
            streak++;
            cursor =
                period === "week" ? addWeeks(cursor, -1) : addMonths(cursor, -1);
        } else {
            break;
        }
    }
    return streak;
}

export interface HistoryRow {
    key: string;
    label: string;
    savings: number;
    target: number;
    hit: boolean;
}

export async function recentHistory(
    userId: string,
    period: "week" | "month",
    target: number,
    count = 6,
    now: Date = new Date()
): Promise<HistoryRow[]> {
    const rows: HistoryRow[] = [];
    let cursor =
        period === "week"
            ? addWeeks(startOfWeek(now, WEEK_OPTS), -1)
            : addMonths(startOfMonth(now), -1);
    for (let i = 0; i < count; i++) {
        const window = currentWindow(period, cursor);
        const totals = await totalsForWindow(userId, window);
        const key =
            period === "week"
                ? format(window.start, "yyyy-'W'II")
                : format(window.start, "yyyy-MM");
        rows.push({
            key,
            label:
                period === "week"
                    ? format(window.start, "MMM d")
                    : format(window.start, "MMM yyyy"),
            savings: totals.savings,
            target,
            hit: target > 0 && totals.savings >= target,
        });
        cursor = period === "week" ? addWeeks(cursor, -1) : addMonths(cursor, -1);
    }
    return rows.reverse();
}
