"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { formatCompact, formatCurrency } from "@/lib/format";

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
            <BarChart
                data={data}
                margin={{ left: 4, right: 8, top: 16, bottom: 0 }}
                barCategoryGap="20%"
                barGap={4}
            >
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
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                    content={
                        <ChartTooltipContent
                            indicator="dot"
                            formatter={(value, name) => (
                                <div className="flex w-full items-center justify-between gap-3 text-xs">
                                    <span className="text-muted-foreground capitalize">
                                        {String(name)}
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
                    dataKey="income"
                    fill="var(--color-income)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                />
                <Bar
                    dataKey="expense"
                    fill="var(--color-expense)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                />
                <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
        </ChartContainer>
    );
}
