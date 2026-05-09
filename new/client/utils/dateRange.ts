export type DateRange = "daily" | "weekly" | "monthly" | "yearly";

const VALID_RANGES: ReadonlySet<DateRange> = new Set([
    "daily",
    "weekly",
    "monthly",
    "yearly",
]);

export function isDateRange(value: unknown): value is DateRange {
    return typeof value === "string" && VALID_RANGES.has(value as DateRange);
}

function getDateRange(range: DateRange): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date();

    switch (range) {
        case "daily":
            return {
                start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                end,
            };
        case "weekly": {
            const firstDayOfWeek = now.getDate() - now.getDay();
            return {
                start: new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek),
                end,
            };
        }
        case "monthly":
            return {
                start: new Date(now.getFullYear(), now.getMonth(), 1),
                end,
            };
        case "yearly":
            return {
                start: new Date(now.getFullYear(), 0, 1),
                end,
            };
    }
}

export default getDateRange;
