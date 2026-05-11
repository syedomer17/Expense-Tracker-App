"use client";

import * as React from "react";
import {
    AlertCircle,
    ArrowDownLeft,
    ArrowUpRight,
    Download,
    FilterX,
    Plus,
    Receipt,
    Search,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
    TransactionRow,
    type TransactionRowItem,
} from "@/components/shared/transaction-row";
import {
    TransactionForm,
    type TransactionRecord,
} from "@/components/transactions/transaction-form";
import { ColumnChart } from "@/components/transactions/column-chart";
import { api, ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";

interface ListResponse {
    items: TransactionRecord[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

type DashboardRange = "day" | "week" | "month" | "year";

interface SeriesRow {
    key: string;
    label: string;
    total: number;
    count: number;
}

interface OverviewResponse {
    overview: {
        range: DashboardRange;
        total: number;
        count: number;
        byCategory: Array<{ category: string; total: number; count: number }>;
        byMonth: Array<{ month: string; total: number; count: number }>;
        byBucket: SeriesRow[];
        recent: Array<{
            id: string;
            description: string;
            amount: number;
            category: string;
            date: string;
        }>;
    };
}

interface Props {
    kind: "income" | "expense";
}

const PAGE_SIZE = 20;

export function TransactionsClient({ kind }: Props) {
    const isIncome = kind === "income";
    const labels = {
        title: isIncome ? "Income" : "Expenses",
        eyebrow: isIncome ? "Money in" : "Money out",
        description: isIncome
            ? "All the money you've earned, in one calm place."
            : "Every expense you log here keeps your savings rate honest.",
        addLabel: isIncome ? "Add income" : "Add expense",
        emptyTitle: isIncome ? "No income recorded" : "No expenses recorded",
        emptyDesc: isIncome
            ? "Log your first paycheck or freelance gig to see it here."
            : "Record your first expense to start understanding your spending.",
    };

    const [items, setItems] = React.useState<TransactionRecord[]>([]);
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [total, setTotal] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    const [overview, setOverview] = React.useState<OverviewResponse["overview"] | null>(
        null
    );
    const [overviewLoading, setOverviewLoading] = React.useState(true);
    const [chartRange, setChartRange] = React.useState<DashboardRange>("month");

    const [search, setSearch] = React.useState("");
    const [category, setCategory] = React.useState("");
    const [from, setFrom] = React.useState("");
    const [to, setTo] = React.useState("");

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<TransactionRecord | null>(null);
    const [confirmDelete, setConfirmDelete] = React.useState<TransactionRowItem | null>(
        null
    );
    const [deletePending, setDeletePending] = React.useState(false);

    const filtersActive = !!(search || category || from || to);

    const overviewRequestId = React.useRef(0);
    const fetchOverview = React.useCallback(
        async (range: DashboardRange = chartRange) => {
            const id = ++overviewRequestId.current;
            setOverviewLoading(true);
            try {
                const res = await api.get<OverviewResponse>(
                    `/api/${kind}/overview?range=${range}`
                );
                if (overviewRequestId.current === id) setOverview(res.overview);
            } catch {
                // ignore
            } finally {
                if (overviewRequestId.current === id) setOverviewLoading(false);
            }
        },
        [kind, chartRange]
    );

    const handleRangeChange = React.useCallback(
        (next: DashboardRange) => {
            if (next === chartRange) return;
            setChartRange(next);
            fetchOverview(next);
        },
        [chartRange, fetchOverview]
    );

    const fetchList = React.useCallback(
        async (targetPage = page) => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.set("page", String(targetPage));
                params.set("limit", String(PAGE_SIZE));
                if (category) params.set("category", category);
                if (from) params.set("from", from);
                if (to) params.set("to", to);
                const res = await api.get<ListResponse>(
                    `/api/${kind}/get${kind}?${params.toString()}`
                );
                setItems(res.items);
                setPage(res.page);
                setTotalPages(res.totalPages);
                setTotal(res.total);
            } catch (err) {
                if (err instanceof ApiError) toast.error(err.message);
                else toast.error("Could not load");
            } finally {
                setLoading(false);
            }
        },
        [kind, page, category, from, to]
    );

    React.useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    React.useEffect(() => {
        fetchList(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, from, to]);

    const filteredItems = React.useMemo(() => {
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter(
            (i) =>
                i.description.toLowerCase().includes(q) ||
                i.category.toLowerCase().includes(q)
        );
    }, [items, search]);

    function openAdd() {
        setEditing(null);
        setDialogOpen(true);
    }

    function openEdit(t: TransactionRowItem) {
        const found = items.find((i) => i.id === t.id);
        if (found) {
            setEditing(found);
            setDialogOpen(true);
        }
    }

    async function handleDeleteConfirmed() {
        if (!confirmDelete) return;
        setDeletePending(true);
        try {
            await api.delete(`/api/${kind}/delete${kind}/${confirmDelete.id}`);
            toast.success("Deleted");
            setConfirmDelete(null);
            await Promise.all([fetchList(page), fetchOverview()]);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not delete");
        } finally {
            setDeletePending(false);
        }
    }

    function handleSaved() {
        setDialogOpen(false);
        setEditing(null);
        fetchList(1);
        fetchOverview();
    }

    function clearFilters() {
        setSearch("");
        setCategory("");
        setFrom("");
        setTo("");
    }

    function downloadXlsx() {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        const url = `/api/${kind}/downloadexcel${
            params.toString() ? `?${params.toString()}` : ""
        }`;
        window.location.href = url;
    }

    const topCategories = overview?.byCategory.slice(0, 3) ?? [];
    const recentMonth = overview?.byMonth[overview.byMonth.length - 1];

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                eyebrow={labels.eyebrow}
                title={labels.title}
                description={labels.description}
                actions={
                    <>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-10 px-4"
                            onClick={downloadXlsx}
                        >
                            <Download className="size-4" /> Export
                        </Button>
                        <Button size="lg" className="h-10 px-4" onClick={openAdd}>
                            <Plus className="size-4" /> {labels.addLabel}
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    label={`Total ${kind}`}
                    value={
                        overviewLoading ? (
                            <Skeleton className="h-7 w-24" />
                        ) : (
                            formatCurrency(overview?.total ?? 0)
                        )
                    }
                    icon={
                        isIncome ? (
                            <ArrowDownLeft className="size-4" />
                        ) : (
                            <ArrowUpRight className="size-4" />
                        )
                    }
                    accent={isIncome ? "income" : "expense"}
                    footer={
                        overviewLoading ? null : (
                            <span>{overview?.count ?? 0} entries</span>
                        )
                    }
                />
                <StatCard
                    label="Latest month"
                    value={
                        overviewLoading ? (
                            <Skeleton className="h-7 w-24" />
                        ) : recentMonth ? (
                            formatCurrency(recentMonth.total)
                        ) : (
                            "—"
                        )
                    }
                    icon={
                        isIncome ? (
                            <TrendingUp className="size-4" />
                        ) : (
                            <TrendingDown className="size-4" />
                        )
                    }
                    accent="balance"
                    footer={recentMonth ? <span>{recentMonth.month}</span> : null}
                />
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                            Top categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {overviewLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ) : topCategories.length ? (
                            <ul className="space-y-1.5 text-sm">
                                {topCategories.map((c) => (
                                    <li
                                        key={c.category}
                                        className="flex items-center justify-between gap-3"
                                    >
                                        <span className="truncate font-medium">{c.category}</span>
                                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                                            {formatCurrency(c.total)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No data yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ColumnChart
                kind={kind}
                byCategory={overview?.byCategory ?? []}
                byBucket={overview?.byBucket ?? []}
                range={chartRange}
                onRangeChange={handleRangeChange}
                loading={overviewLoading}
            />

            <Card className="border-border/60">
                <CardHeader className="gap-3">
                    <div className="flex flex-col gap-1">
                        <CardTitle className="text-base">All {kind}</CardTitle>
                        <CardDescription>
                            {total} {total === 1 ? "entry" : "entries"} total
                            {filtersActive ? " · filters applied" : ""}
                        </CardDescription>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
                        <div className="space-y-1">
                            <Label htmlFor="search" className="text-xs text-muted-foreground">
                                Search
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search description / category"
                                    className="pl-7"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="category" className="text-xs text-muted-foreground">
                                Category
                            </Label>
                            <Input
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="All"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:contents">
                            <div className="space-y-1">
                                <Label htmlFor="from" className="text-xs text-muted-foreground">
                                    From
                                </Label>
                                <Input
                                    id="from"
                                    type="date"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="to" className="text-xs text-muted-foreground">
                                    To
                                </Label>
                                <Input
                                    id="to"
                                    type="date"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    {filtersActive ? (
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-muted-foreground"
                            >
                                <FilterX className="size-3.5" /> Clear filters
                            </Button>
                        </div>
                    ) : null}
                </CardHeader>
                <Separator />
                <CardContent className="p-2 sm:p-3">
                    {loading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-3 py-3">
                                    <Skeleton className="size-9 rounded-xl" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-3 w-1/3" />
                                    </div>
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : filteredItems.length ? (
                        <div className="flex flex-col gap-1">
                            {filteredItems.map((t) => (
                                <TransactionRow
                                    key={t.id}
                                    transaction={{
                                        ...t,
                                        type: kind,
                                    }}
                                    onEdit={openEdit}
                                    onDelete={(row) => setConfirmDelete(row)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<Receipt className="size-4" />}
                            title={
                                filtersActive ? "No results match your filters" : labels.emptyTitle
                            }
                            description={
                                filtersActive
                                    ? "Try clearing filters or expanding your date range."
                                    : labels.emptyDesc
                            }
                            action={
                                filtersActive ? (
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear filters
                                    </Button>
                                ) : (
                                    <Button onClick={openAdd}>
                                        <Plus className="size-4" /> {labels.addLabel}
                                    </Button>
                                )
                            }
                        />
                    )}

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={(p) => fetchList(p)}
                        disabled={loading}
                    />

                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? `Edit ${kind}` : labels.addLabel}
                        </DialogTitle>
                        <DialogDescription>
                            {editing
                                ? "Update the details and save."
                                : `Capture the details of this ${kind}.`}
                        </DialogDescription>
                    </DialogHeader>
                    <TransactionForm
                        kind={kind}
                        initial={editing}
                        onCancel={() => setDialogOpen(false)}
                        onSuccess={handleSaved}
                        suggestedCategories={overview?.byCategory.map((c) => c.category)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!confirmDelete}
                onOpenChange={(o) => !o && setConfirmDelete(null)}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="size-4 text-destructive" />
                            Delete this {kind}?
                        </DialogTitle>
                        <DialogDescription>
                            This will permanently remove the entry. You can&apos;t undo this.
                        </DialogDescription>
                    </DialogHeader>
                    {confirmDelete ? (
                        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
                            <p className="font-medium">{confirmDelete.description}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {confirmDelete.category} · {formatDate(confirmDelete.date)} ·{" "}
                                <span className="tabular-nums">
                                    {formatCurrency(confirmDelete.amount)}
                                </span>
                            </p>
                        </div>
                    ) : null}
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setConfirmDelete(null)}
                            disabled={deletePending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirmed}
                            disabled={deletePending}
                        >
                            {deletePending ? "Deleting…" : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
