"use client";

import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CategoryRow {
    category: string;
    total: number;
    count: number;
}

const PALETTE = [
    "bg-violet-500",
    "bg-fuchsia-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-sky-500",
];

export function CategoryBreakdown({
    data,
    accent,
}: {
    data: CategoryRow[];
    accent?: "income" | "expense";
}) {
    const max = Math.max(1, ...data.map((d) => d.total));
    return (
        <div className="space-y-3">
            {data.map((row, i) => {
                const pct = Math.round((row.total / max) * 100);
                return (
                    <div key={row.category} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <div className="flex min-w-0 items-center gap-2">
                                <span
                                    className={cn(
                                        "size-2 shrink-0 rounded-full",
                                        PALETTE[i % PALETTE.length]
                                    )}
                                />
                                <span className="truncate font-medium">{row.category}</span>
                                <span className="text-xs text-muted-foreground">
                                    · {row.count}
                                </span>
                            </div>
                            <span
                                className={cn(
                                    "shrink-0 font-mono text-xs tabular-nums",
                                    accent === "income"
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : accent === "expense"
                                            ? "text-rose-600 dark:text-rose-400"
                                            : "text-foreground"
                                )}
                            >
                                {formatCurrency(row.total)}
                            </span>
                        </div>
                        <Progress value={pct} className="h-1" />
                    </div>
                );
            })}
        </div>
    );
}
