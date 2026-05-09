"use client";

import * as React from "react";
import { Cell, Pie, PieChart, Sector, type SectorProps } from "recharts";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CategoryRow {
    category: string;
    total: number;
    count: number;
}

const PALETTE = [
    "oklch(0.62 0.21 296)",
    "oklch(0.66 0.22 25)",
    "oklch(0.72 0.18 70)",
    "oklch(0.72 0.18 155)",
    "oklch(0.66 0.18 230)",
    "oklch(0.66 0.22 340)",
];

function ActiveSlice(props: SectorProps) {
    const outer = (props.outerRadius ?? 0) + 4;
    return <Sector {...props} outerRadius={outer} />;
}

export function SpendingDonut({
    data,
    className,
}: {
    data: CategoryRow[];
    className?: string;
}) {
    const total = React.useMemo(
        () => data.reduce((sum, d) => sum + d.total, 0),
        [data]
    );

    const chartData = React.useMemo(
        () =>
            data.map((d, i) => ({
                name: d.category || "Uncategorized",
                value: d.total,
                count: d.count,
                fill: PALETTE[i % PALETTE.length],
            })),
        [data]
    );

    const config = React.useMemo<ChartConfig>(() => {
        const cfg: ChartConfig = {
            value: { label: "Spending" },
        };
        chartData.forEach((row) => {
            cfg[row.name] = { label: row.name, color: row.fill };
        });
        return cfg;
    }, [chartData]);

    return (
        <ChartContainer
            config={config}
            className={cn("aspect-auto h-[260px] w-full", className)}
        >
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            hideLabel
                            formatter={(value, name) => {
                                const numeric = Number(value);
                                const share =
                                    total > 0 ? (numeric / total) * 100 : 0;
                                return (
                                    <div className="flex w-full items-center justify-between gap-3 text-xs">
                                        <span className="text-muted-foreground">
                                            {String(name)}
                                        </span>
                                        <span className="font-mono font-medium tabular-nums">
                                            {formatCurrency(numeric)}
                                            <span className="ml-2 text-muted-foreground">
                                                {share.toFixed(1)}%
                                            </span>
                                        </span>
                                    </div>
                                );
                            }}
                        />
                    }
                />
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    strokeWidth={2}
                    activeShape={ActiveSlice}
                >
                    {chartData.map((entry) => (
                        <Cell
                            key={entry.name}
                            fill={entry.fill}
                            stroke="var(--background)"
                        />
                    ))}
                    <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-foreground"
                    >
                        <tspan
                            x="50%"
                            dy="-0.6em"
                            className="fill-muted-foreground text-[10px] uppercase tracking-wider"
                        >
                            Total
                        </tspan>
                        <tspan
                            x="50%"
                            dy="1.4em"
                            className="text-base font-semibold tabular-nums"
                        >
                            {formatCurrency(total)}
                        </tspan>
                        <tspan
                            x="50%"
                            dy="1.4em"
                            className="fill-muted-foreground text-[10px] tabular-nums"
                        >
                            {chartData.length} categories
                        </tspan>
                    </text>
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    verticalAlign="bottom"
                />
            </PieChart>
        </ChartContainer>
    );
}
