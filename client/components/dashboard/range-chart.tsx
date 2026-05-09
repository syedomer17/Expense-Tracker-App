"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { formatCompact } from "@/lib/format";

interface BucketRow {
    key: string;
    label: string;
    income: number;
    expense: number;
    balance: number;
}

const config = {
    income: { label: "Income", color: "oklch(0.72 0.18 155)" },
    expense: { label: "Expense", color: "oklch(0.66 0.22 25)" },
} satisfies ChartConfig;

export function RangeChart({ data }: { data: BucketRow[] }) {
    return (
        <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
            <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                <defs>
                    <linearGradient id="rangeIncomeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-income)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-income)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rangeExpenseFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-expense)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-expense)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={16}
                    fontSize={11}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCompact(Number(v))}
                    width={40}
                    fontSize={11}
                />
                <ChartTooltip
                    cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                    content={
                        <ChartTooltipContent
                            indicator="dot"
                            formatter={(value, name) => (
                                <div className="flex w-full items-center justify-between gap-3 text-xs">
                                    <span className="text-muted-foreground capitalize">
                                        {String(name)}
                                    </span>
                                    <span className="font-mono font-medium tabular-nums">
                                        {formatCompact(Number(value))}
                                    </span>
                                </div>
                            )}
                        />
                    }
                />
                <Area
                    type="monotone"
                    dataKey="income"
                    stroke="var(--color-income)"
                    strokeWidth={2}
                    fill="url(#rangeIncomeFill)"
                />
                <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="var(--color-expense)"
                    strokeWidth={2}
                    fill="url(#rangeExpenseFill)"
                />
                <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
        </ChartContainer>
    );
}
