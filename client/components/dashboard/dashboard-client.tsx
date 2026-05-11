"use client";

import * as React from "react";
import Link from "next/link";
import {
    ArrowDownRight,
    ArrowUpRight,
    Loader2,
    PieChart as PieChartIcon,
    PiggyBank,
    Plus,
    Receipt,
    TrendingUp,
    Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatCard } from "@/components/shared/stat-card";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { RangeChart } from "@/components/dashboard/range-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SpendingDonut } from "@/components/dashboard/spending-donut";
import { formatCurrency } from "@/lib/format";
import type { DashboardRange, DashboardResult } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const RANGES: { id: DashboardRange; label: string }[] = [
    { id: "day", label: "Daily" },
    { id: "week", label: "Weekly" },
    { id: "month", label: "Monthly" },
    { id: "year", label: "Yearly" },
];

const RANGE_CHART_TITLE: Record<DashboardRange, string> = {
    day: "Last 14 days",
    week: "Last 12 weeks",
    month: "Last 12 months",
    year: "Last 5 years",
};

const RANGE_CHART_HINT: Record<DashboardRange, string> = {
    day: "Income vs expenses, day by day.",
    week: "Income vs expenses, week by week.",
    month: "Income vs expenses, month by month.",
    year: "Income vs expenses, monthly across 5 years.",
};

const CATEGORY_PAGE_SIZE = 5;

export function DashboardClient({
    initialData,
    initialRange,
}: {
    initialData: DashboardResult;
    initialRange: DashboardRange;
}) {
    const [range, setRange] = React.useState<DashboardRange>(initialRange);
    const [data, setData] = React.useState<DashboardResult>(initialData);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [categoryPage, setCategoryPage] = React.useState(1);
    const requestId = React.useRef(0);

    const loadRange = React.useCallback(async (next: DashboardRange) => {
        const id = ++requestId.current;
        setRange(next);
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/dashboard?range=${next}`, {
                credentials: "include",
                cache: "no-store",
            });
            if (!res.ok) throw new Error(`Request failed (${res.status})`);
            const body = (await res.json()) as { dashboard: DashboardResult };
            // Only commit results from the most recent request.
            if (requestId.current === id) setData(body.dashboard);
        } catch (err) {
            if (requestId.current === id) {
                setError(err instanceof Error ? err.message : "Failed to load data");
            }
        } finally {
            if (requestId.current === id) setLoading(false);
        }
    }, []);

    const d = data;
    const savings = d.summary.savingsRate;
    const savingsBar = Math.max(0, Math.min(100, savings));

    const categoryTotalPages = Math.max(
        1,
        Math.ceil(d.topExpenseCategories.length / CATEGORY_PAGE_SIZE)
    );

    React.useEffect(() => {
        setCategoryPage(1);
    }, [d.topExpenseCategories]);

    React.useEffect(() => {
        if (categoryPage > categoryTotalPages) setCategoryPage(categoryTotalPages);
    }, [categoryPage, categoryTotalPages]);

    const visibleCategories = React.useMemo(() => {
        const start = (categoryPage - 1) * CATEGORY_PAGE_SIZE;
        return d.topExpenseCategories.slice(start, start + CATEGORY_PAGE_SIZE);
    }, [d.topExpenseCategories, categoryPage]);

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                eyebrow="Overview"
                title="Your money at a glance"
                description="Track income, expenses and your savings rate in real time."
                actions={
                    <>
                        <Button asChild variant="outline" size="lg" className="h-10 px-4">
                            <Link href="/income">
                                <Plus className="size-4" /> Income
                            </Link>
                        </Button>
                        <Button asChild size="lg" className="h-10 px-4">
                            <Link href="/expense">
                                <Plus className="size-4" /> Expense
                            </Link>
                        </Button>
                    </>
                }
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs
                    value={range}
                    onValueChange={(v) => {
                        const next = v as DashboardRange;
                        if (next !== range) loadRange(next);
                    }}
                    className="w-fit"
                >
                    <TabsList>
                        {RANGES.map((r) => (
                            <TabsTrigger key={r.id} value={r.id} className="px-3">
                                {r.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <div
                    className={cn(
                        "inline-flex items-center gap-2 text-xs text-muted-foreground transition-opacity",
                        loading ? "opacity-100" : "opacity-0"
                    )}
                    aria-live="polite"
                >
                    <Loader2 className="size-3.5 animate-spin" /> Updating…
                </div>
            </div>

            {error ? (
                <Card className="border-rose-300/60 bg-rose-500/5">
                    <CardContent className="p-4 text-sm text-rose-700 dark:text-rose-400">
                        {error}
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total balance"
                    value={formatCurrency(d.summary.totalBalance)}
                    icon={<Wallet className="size-4" />}
                    accent="balance"
                    footer={
                        <span className="tabular-nums">
                            {d.summary.totalBalanceMonthDelta >= 0 ? "+" : "−"}
                            {formatCurrency(Math.abs(d.summary.totalBalanceMonthDelta))} this
                            month
                        </span>
                    }
                />
                <StatCard
                    label="Income (this month)"
                    value={formatCurrency(d.summary.monthlyIncome)}
                    icon={<ArrowDownRight className="size-4" />}
                    accent="income"
                    trend={{
                        value: d.summary.monthlyIncomeChangePct,
                        label: "vs last month",
                    }}
                />
                <StatCard
                    label="Expenses (this month)"
                    value={formatCurrency(d.summary.monthlyExpense)}
                    icon={<ArrowUpRight className="size-4" />}
                    accent="expense"
                    trend={{
                        value: d.summary.monthlyExpenseChangePct,
                        label: "vs last month",
                    }}
                />
                <Card className="overflow-hidden border-border/60">
                    <CardContent className="flex flex-col gap-4 p-5">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                Savings rate
                            </p>
                            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <PiggyBank className="size-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                                {savings.toFixed(1)}%
                            </div>
                            <Badge
                                variant="secondary"
                                className="rounded-md text-[10px] font-medium"
                            >
                                {d.summary.savingsRateLabel}
                            </Badge>
                        </div>
                        <Progress value={savingsBar} className="h-1.5" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <Card className="border-border/60 xl:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="size-4 text-muted-foreground" />
                            {RANGE_CHART_TITLE[range]}
                        </CardTitle>
                        <CardDescription>{RANGE_CHART_HINT[range]}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-4">
                        <RangeChart data={d.byBucket} />
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <PieChartIcon className="size-4 text-muted-foreground" />
                            Spending by Category
                        </CardTitle>
                        <CardDescription>
                            Share of expenses across your top categories.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {d.topExpenseCategories.length ? (
                            <SpendingDonut data={d.topExpenseCategories} />
                        ) : (
                            <EmptyState
                                icon={<Receipt className="size-4" />}
                                title="No expenses yet"
                                description="Add an expense to see your category breakdown."
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <Card className="border-border/60 xl:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Top expense categories</CardTitle>
                        <CardDescription>Where your money is going.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {d.topExpenseCategories.length ? (
                            <>
                                <CategoryBreakdown
                                    data={visibleCategories}
                                    accent="expense"
                                />
                                <Pagination
                                    page={categoryPage}
                                    totalPages={categoryTotalPages}
                                    onPageChange={setCategoryPage}
                                    className="px-0"
                                />
                            </>
                        ) : (
                            <EmptyState
                                icon={<Receipt className="size-4" />}
                                title="No expenses yet"
                                description="Add an expense to see your top categories."
                            />
                        )}
                    </CardContent>
                </Card>

                <RecentTransactions
                    items={d.recent}
                    className="xl:col-span-2"
                />
            </div>
        </div>
    );
}
