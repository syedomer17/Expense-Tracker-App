"use client";

import * as React from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    XAxis,
    YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { formatCompact, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type DashboardRange = "day" | "week" | "month" | "year";

interface CategoryRow {
    category: string;
    total: number;
    count: number;
}

interface BucketRow {
    key: string;
    label: string;
    total: number;
    count: number;
}

const PALETTE_INCOME = [
    "oklch(0.72 0.18 155)",
    "oklch(0.66 0.18 175)",
    "oklch(0.7 0.18 195)",
    "oklch(0.66 0.18 215)",
    "oklch(0.62 0.18 235)",
    "oklch(0.6 0.18 255)",
];

const PALETTE_EXPENSE = [
    "oklch(0.66 0.22 25)",
    "oklch(0.7 0.2 45)",
    "oklch(0.74 0.18 65)",
    "oklch(0.66 0.22 340)",
    "oklch(0.62 0.21 296)",
    "oklch(0.66 0.18 230)",
];

const MAX_CATEGORIES = 8;

const RANGE_OPTIONS: { id: DashboardRange; label: string }[] = [
    { id: "day", label: "Daily" },
    { id: "week", label: "Weekly" },
    { id: "month", label: "Monthly" },
    { id: "year", label: "Yearly" },
];

const RANGE_PERIOD_LABEL: Record<DashboardRange, string> = {
    day: "Last 14 days",
    week: "Last 12 weeks",
    month: "Last 12 months",
    year: "Last 5 years",
};

type Mode = "category" | "period";

interface Props {
    kind: "income" | "expense";
    byCategory: CategoryRow[];
    byBucket: BucketRow[];
    range: DashboardRange;
    onRangeChange: (next: DashboardRange) => void;
    loading?: boolean;
    className?: string;
}

export function ColumnChart({
    kind,
    byCategory,
    byBucket,
    range,
    onRangeChange,
    loading = false,
    className,
}: Props) {
    const isIncome = kind === "income";
    const palette = isIncome ? PALETTE_INCOME : PALETTE_EXPENSE;

    // Mode is user-controlled; falls back to whichever has data when the
    // requested mode is empty.
    const [userMode, setUserMode] = React.useState<Mode | null>(null);
    const hasCategory = byCategory.length > 0;
    const hasPeriod = byBucket.some((b) => b.total > 0);
    const autoMode: Mode = hasCategory ? "category" : "period";
    const requested = userMode ?? autoMode;
    const mode: Mode =
        (requested === "category" && !hasCategory) ||
        (requested === "period" && !hasPeriod && hasCategory)
            ? autoMode
            : requested;

    const chartData = React.useMemo(() => {
        if (mode === "category") {
            return byCategory.slice(0, MAX_CATEGORIES).map((c, i) => ({
                key: c.category || "Uncategorized",
                label: c.category || "Uncategorized",
                value: c.total,
                count: c.count,
                fill: palette[i % palette.length],
            }));
        }
        return byBucket.map((b, i) => ({
            key: b.key,
            label: b.label,
            value: b.total,
            count: b.count,
            fill: palette[i % palette.length],
        }));
    }, [mode, byCategory, byBucket, palette]);

    const config = React.useMemo<ChartConfig>(
        () => ({
            value: {
                label: isIncome ? "Income" : "Expense",
                color: palette[0],
            },
        }),
        [isIncome, palette]
    );

    const total = React.useMemo(
        () => chartData.reduce((sum, r) => sum + r.value, 0),
        [chartData]
    );

    const empty = !hasCategory && !hasPeriod;
    const periodEmpty = mode === "period" && !hasPeriod;

    return (
        <Card className={cn("border-border/60", className)}>
            <CardHeader className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-base">
                        {isIncome ? "Income breakdown" : "Spending breakdown"}
                    </CardTitle>
                    <CardDescription>
                        {mode === "category"
                            ? `Top categories${
                                  byCategory.length > MAX_CATEGORIES
                                      ? ` (showing ${MAX_CATEGORIES} of ${byCategory.length})`
                                      : ""
                              }`
                            : RANGE_PERIOD_LABEL[range]}
                        {!empty && total > 0
                            ? ` · ${formatCurrency(total)} total`
                            : ""}
                    </CardDescription>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
                        {(
                            [
                                { id: "category" as const, label: "By Category" },
                                { id: "period" as const, label: "By Period" },
                            ] satisfies { id: Mode; label: string }[]
                        ).map((opt) => {
                            const active = mode === opt.id;
                            const disabled =
                                (opt.id === "category" && !hasCategory) ||
                                (opt.id === "period" && !hasPeriod && !hasCategory);
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => setUserMode(opt.id)}
                                    aria-pressed={active}
                                    className={cn(
                                        "rounded-md px-2.5 py-1 text-xs font-medium transition",
                                        active
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground",
                                        disabled && "cursor-not-allowed opacity-40"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                "inline-flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5",
                                mode !== "period" &&
                                    "opacity-60"
                            )}
                            aria-label="Time range"
                        >
                            {RANGE_OPTIONS.map((opt) => {
                                const active = range === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                            // Switch to period mode when a range is chosen so the
                                            // change is visible immediately.
                                            setUserMode("period");
                                            onRangeChange(opt.id);
                                        }}
                                        aria-pressed={active}
                                        className={cn(
                                            "rounded-md px-2.5 py-1 text-xs font-medium transition",
                                            active
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                        {loading ? (
                            <span
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                                aria-live="polite"
                            >
                                <Loader2 className="size-3.5 animate-spin" /> Updating…
                            </span>
                        ) : null}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-4">
                {empty ? (
                    <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                        No data yet — add a few entries to see the breakdown.
                    </div>
                ) : periodEmpty ? (
                    <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                        No {kind} entries in this range — try a wider one.
                    </div>
                ) : (
                    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
                        <BarChart
                            data={chartData}
                            margin={{ left: 4, right: 8, top: 16, bottom: 0 }}
                        >
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                            />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                interval="preserveStartEnd"
                                minTickGap={12}
                                fontSize={11}
                                tickFormatter={(v) =>
                                    typeof v === "string" && v.length > 12
                                        ? `${v.slice(0, 11)}…`
                                        : String(v)
                                }
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => formatCompact(Number(v))}
                                width={40}
                                fontSize={11}
                            />
                            <ChartTooltip
                                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(_, payload) => {
                                            const item = payload?.[0]?.payload as
                                                | { label: string; count: number }
                                                | undefined;
                                            if (!item) return null;
                                            return (
                                                <div className="flex w-full items-center justify-between gap-3 text-xs">
                                                    <span className="font-medium">{item.label}</span>
                                                    <span className="text-muted-foreground tabular-nums">
                                                        {item.count}{" "}
                                                        {item.count === 1 ? "entry" : "entries"}
                                                    </span>
                                                </div>
                                            );
                                        }}
                                        formatter={(value) => (
                                            <div className="flex w-full items-center justify-between gap-3 text-xs">
                                                <span className="text-muted-foreground">
                                                    {isIncome ? "Income" : "Spent"}
                                                </span>
                                                <span className="font-mono font-medium tabular-nums">
                                                    {formatCurrency(Number(value))}
                                                </span>
                                            </div>
                                        )}
                                    />
                                }
                            />
                            <Bar
                                dataKey="value"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={48}
                            >
                                {chartData.map((entry) => (
                                    <Cell key={entry.key} fill={entry.fill} />
                                ))}
                                <LabelList
                                    dataKey="value"
                                    position="top"
                                    formatter={(value) =>
                                        value == null ? "" : formatCompact(Number(value))
                                    }
                                    className="fill-muted-foreground"
                                    fontSize={10}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
