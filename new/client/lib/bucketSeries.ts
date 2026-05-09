import type { PipelineStage } from "mongoose";

export type DashboardRange = "day" | "week" | "month" | "year";

export const DASHBOARD_RANGES: DashboardRange[] = [
    "day",
    "week",
    "month",
    "year",
];

export function isDashboardRange(v: unknown): v is DashboardRange {
    return v === "day" || v === "week" || v === "month" || v === "year";
}

export interface BucketWindow {
    start: Date;
    bucketUnit: "day" | "week" | "month";
    buckets: number;
    labelFormat: "day" | "week" | "month";
}

export interface BucketAggRow {
    /** Pre-formatted key emitted by the aggregation pipeline */
    _id: string;
    total: number;
}

export interface SeriesRow {
    /** ISO key for the bucket: YYYY-MM-DD (day/week start) or YYYY-MM (month) */
    key: string;
    /** Human label for the chart x-axis */
    label: string;
    total: number;
    count: number;
}

const MONTHS_BACK = 12;

function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d: Date): Date {
    const day = startOfDay(d);
    const dow = day.getDay(); // 0 = Sunday
    day.setDate(day.getDate() - dow);
    return day;
}

export function addDays(d: Date, n: number): Date {
    const next = new Date(d);
    next.setDate(next.getDate() + n);
    return next;
}

export function addMonths(d: Date, n: number): Date {
    return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function rangeWindow(now: Date, range: DashboardRange): BucketWindow {
    switch (range) {
        case "day": {
            const buckets = 14;
            const today = startOfDay(now);
            return {
                start: addDays(today, -(buckets - 1)),
                bucketUnit: "day",
                buckets,
                labelFormat: "day",
            };
        }
        case "week": {
            const buckets = 12;
            const thisWeek = startOfWeek(now);
            return {
                start: addDays(thisWeek, -7 * (buckets - 1)),
                bucketUnit: "week",
                buckets,
                labelFormat: "week",
            };
        }
        case "year": {
            const buckets = 60;
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return {
                start: addMonths(thisMonth, -(buckets - 1)),
                bucketUnit: "month",
                buckets,
                labelFormat: "month",
            };
        }
        case "month":
        default: {
            const buckets = MONTHS_BACK;
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return {
                start: addMonths(thisMonth, -(buckets - 1)),
                bucketUnit: "month",
                buckets,
                labelFormat: "month",
            };
        }
    }
}

export function buildBucketIdExpression(unit: BucketWindow["bucketUnit"]) {
    if (unit === "day") {
        return { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
    }
    if (unit === "week") {
        return {
            $dateToString: {
                format: "%Y-%m-%d",
                date: {
                    $dateTrunc: {
                        date: "$date",
                        unit: "week",
                        startOfWeek: "sunday",
                    },
                },
            },
        };
    }
    return { $dateToString: { format: "%Y-%m", date: "$date" } };
}

/** Pipeline stage that filters to the bucket window. */
export function bucketWindowMatch(window: BucketWindow): PipelineStage {
    return { $match: { date: { $gte: window.start } } };
}

/** Pipeline stages that group transactions into buckets and total their amount. */
export function bucketGroupStages(
    window: BucketWindow,
    options: { withCount?: boolean } = {}
): PipelineStage[] {
    const groupStage: PipelineStage = {
        $group: {
            _id: buildBucketIdExpression(window.bucketUnit),
            total: { $sum: "$amount" },
            ...(options.withCount ? { count: { $sum: 1 } } : {}),
        },
    };
    return [bucketWindowMatch(window), groupStage];
}

export function formatBucketKey(d: Date, unit: BucketWindow["bucketUnit"]): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    if (unit === "month") return `${y}-${m}`;
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function formatBucketLabel(
    d: Date,
    format: BucketWindow["labelFormat"]
): string {
    if (format === "day") {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    if (format === "week") {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

/**
 * Build an empty series spanning the bucket window. Useful as a base to merge
 * grouped aggregation results into so empty buckets stay visible.
 */
export function emptySeries(window: BucketWindow): SeriesRow[] {
    const out: SeriesRow[] = [];
    for (let i = 0; i < window.buckets; i++) {
        const date =
            window.bucketUnit === "day"
                ? addDays(window.start, i)
                : window.bucketUnit === "week"
                    ? addDays(window.start, i * 7)
                    : addMonths(window.start, i);
        out.push({
            key: formatBucketKey(date, window.bucketUnit),
            label: formatBucketLabel(date, window.labelFormat),
            total: 0,
            count: 0,
        });
    }
    return out;
}
