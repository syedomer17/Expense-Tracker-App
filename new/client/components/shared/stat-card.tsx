import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
    trend?: { value: number | null; label?: string } | null;
    accent?: "default" | "income" | "expense" | "balance";
    footer?: React.ReactNode;
    className?: string;
}

const accentBg: Record<NonNullable<StatCardProps["accent"]>, string> = {
    default: "bg-muted text-foreground",
    income: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    expense: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    balance: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export function StatCard({
    label,
    value,
    icon,
    trend,
    accent = "default",
    footer,
    className,
}: StatCardProps) {
    const trendDirection =
        trend && trend.value !== null
            ? trend.value > 0
                ? "up"
                : trend.value < 0
                    ? "down"
                    : "flat"
            : null;

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border-border/60 transition-shadow hover:shadow-md",
                className
            )}
        >
            <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                            {label}
                        </p>
                    </div>
                    {icon ? (
                        <div
                            className={cn(
                                "flex size-9 items-center justify-center rounded-xl",
                                accentBg[accent]
                            )}
                        >
                            {icon}
                        </div>
                    ) : null}
                </div>
                <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">
                        {value}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {trendDirection ? (
                        <span
                            className={cn(
                                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium tabular-nums",
                                trendDirection === "up"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : trendDirection === "down"
                                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                        : "bg-muted text-muted-foreground"
                            )}
                        >
                            {trendDirection === "up" ? (
                                <ArrowUpRight className="size-3" />
                            ) : trendDirection === "down" ? (
                                <ArrowDownRight className="size-3" />
                            ) : null}
                            {trend!.value !== null
                                ? `${trend!.value > 0 ? "+" : ""}${trend!.value.toFixed(1)}%`
                                : "—"}
                        </span>
                    ) : null}
                    {footer ?? trend?.label}
                </div>
            </CardContent>
        </Card>
    );
}
