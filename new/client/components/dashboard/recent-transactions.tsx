"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { TransactionRow } from "@/components/shared/transaction-row";
import { cn } from "@/lib/utils";

export interface RecentRow {
    id: string;
    type: "income" | "expense";
    description: string;
    amount: number;
    category: string;
    date: string | Date;
}

const FILTERS = [
    { id: "all", label: "All" },
    { id: "income", label: "Income" },
    { id: "expense", label: "Expense" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export function RecentTransactions({
    items,
    className,
    initialFilter = "all",
}: {
    items: RecentRow[];
    className?: string;
    initialFilter?: FilterId;
}) {
    const [filter, setFilter] = React.useState<FilterId>(initialFilter);

    const filtered = React.useMemo(() => {
        if (filter === "all") return items;
        return items.filter((i) => i.type === filter);
    }, [items, filter]);

    const totals = React.useMemo(() => {
        let income = 0;
        let expense = 0;
        for (const i of items) {
            if (i.type === "income") income += i.amount;
            else expense += i.amount;
        }
        return { income, expense };
    }, [items]);

    return (
        <Card className={cn("border-border/60", className)}>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-base">Recent Transactions</CardTitle>
                    <CardDescription>
                        Latest income and expense entries · {totals.income > 0 || totals.expense > 0
                            ? `${items.length} in view`
                            : "no activity yet"}
                    </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
                        {FILTERS.map((f) => {
                            const active = filter === f.id;
                            return (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setFilter(f.id)}
                                    className={cn(
                                        "rounded-md px-2.5 py-1 text-xs font-medium transition",
                                        active
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                    aria-pressed={active}
                                >
                                    {f.label}
                                    {f.id !== "all" ? (
                                        <Badge
                                            variant="secondary"
                                            className="ml-1.5 rounded px-1 py-0 text-[10px] tabular-nums"
                                        >
                                            {items.filter((i) => i.type === f.id).length}
                                        </Badge>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                    <Button asChild variant="ghost" size="sm" className="gap-1">
                        <Link href={filter === "income" ? "/income" : "/expense"}>
                            View all <ArrowUpRight className="size-3.5" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-3">
                {filtered.length ? (
                    <div className="flex flex-col gap-1">
                        {filtered.map((r) => (
                            <TransactionRow
                                key={`${r.type}-${r.id}`}
                                transaction={{
                                    id: r.id,
                                    type: r.type,
                                    description: r.description,
                                    amount: r.amount,
                                    category: r.category,
                                    date: r.date,
                                }}
                                showActions={false}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<Receipt className="size-4" />}
                        title="Nothing here yet"
                        description={
                            filter === "all"
                                ? "Your most recent transactions will appear here."
                                : `No ${filter} entries in this range.`
                        }
                        action={
                            <div className="flex gap-2">
                                <Button asChild size="sm" variant="outline">
                                    <Link href="/income">Add income</Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href="/expense">Add expense</Link>
                                </Button>
                            </div>
                        }
                    />
                )}
            </CardContent>
        </Card>
    );
}
