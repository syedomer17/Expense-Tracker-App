"use client";

import * as React from "react";
import {
    Loader2,
    Pencil,
    Plus,
    ShoppingBag,
    Sparkles,
    Trash2,
    Wallet,
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
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { api, ApiError } from "@/lib/api";
import { formatCurrency, formatDate, formatDateInput } from "@/lib/format";
import { cn } from "@/lib/utils";

type Priority = "low" | "medium" | "high";

interface WishlistItem {
    id: string;
    name: string;
    targetAmount: number;
    savedAmount: number;
    remaining: number;
    percent: number;
    targetDate: string | null;
    priority: Priority;
    notes: string;
    completed: boolean;
    completedAt: string | null;
    createdAt: string;
}

interface Summary {
    income: number;
    expense: number;
    balance: number;
    committed: number;
    free: number;
}

interface WishlistResponse {
    items: WishlistItem[];
    summary: Summary;
}

const PRIORITY_OPTIONS: { id: Priority; label: string }[] = [
    { id: "high", label: "High" },
    { id: "medium", label: "Medium" },
    { id: "low", label: "Low" },
];

export function WishlistClient() {
    const [items, setItems] = React.useState<WishlistItem[]>([]);
    const [summary, setSummary] = React.useState<Summary | null>(null);
    const [loading, setLoading] = React.useState(true);

    const [name, setName] = React.useState("");
    const [target, setTarget] = React.useState("");
    const [date, setDate] = React.useState("");
    const [priority, setPriority] = React.useState<Priority>("medium");
    const [creating, setCreating] = React.useState(false);

    const refresh = React.useCallback(async () => {
        try {
            const res = await api.get<WishlistResponse>("/api/wishlist");
            setItems(res.items);
            setSummary(res.summary);
        } catch (err) {
            if (err instanceof ApiError) toast.error(err.message);
            else toast.error("Could not load wishlist");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        refresh();
    }, [refresh]);

    async function createItem(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = name.trim();
        const targetNum = Number(target);
        if (!trimmed) {
            toast.error("Give it a name");
            return;
        }
        if (!Number.isFinite(targetNum) || targetNum <= 0) {
            toast.error("Enter a valid target amount");
            return;
        }
        setCreating(true);
        try {
            await api.post<{ item: WishlistItem }>("/api/wishlist", {
                name: trimmed,
                targetAmount: targetNum,
                targetDate: date || null,
                priority,
            });
            setName("");
            setTarget("");
            setDate("");
            setPriority("medium");
            toast.success("Added to wishlist");
            await refresh();
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Could not save");
        } finally {
            setCreating(false);
        }
    }

    async function updateItem(
        item: WishlistItem,
        patch: {
            name: string;
            targetAmount: number;
            savedAmount: number;
            targetDate: string | null;
            priority: Priority;
            notes: string;
        }
    ) {
        const res = await api.patch<{ item: WishlistItem }>(
            `/api/wishlist/${item.id}`,
            patch
        );
        setItems((current) =>
            current.map((i) => (i.id === item.id ? res.item : i))
        );
        await refresh();
    }

    async function contribute(item: WishlistItem, amount: number) {
        if (!Number.isFinite(amount) || amount === 0) {
            toast.error("Enter an amount");
            return;
        }
        try {
            const res = await api.post<{ item: WishlistItem }>(
                `/api/wishlist/${item.id}/contribute`,
                { amount }
            );
            setItems((current) =>
                current.map((i) => (i.id === item.id ? res.item : i))
            );
            await refresh();
            if (res.item.completed && !item.completed) {
                toast.success(`Fully funded — ${res.item.name}`);
            } else {
                toast.success("Saved");
            }
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Could not update");
        }
    }

    async function removeItem(item: WishlistItem) {
        if (!confirm(`Remove "${item.name}" from your wishlist?`)) return;
        try {
            await api.delete(`/api/wishlist/${item.id}`);
            setItems((current) => current.filter((i) => i.id !== item.id));
            await refresh();
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Could not remove");
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                eyebrow="Planning"
                title="Wishlist"
                description="Plan future purchases. Set a target, put aside savings, watch the bar fill."
            />

            <BalanceSummary summary={summary} loading={loading} />

            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                        <Plus className="size-4" /> Add an item
                    </CardTitle>
                    <CardDescription>
                        What do you want to buy, and how much does it cost?
                    </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <form
                        onSubmit={createItem}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end"
                    >
                        <div className="space-y-1.5">
                            <Label htmlFor="wl-name">What</Label>
                            <Input
                                id="wl-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="MacBook Pro"
                                maxLength={120}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="wl-target">Target ($)</Label>
                            <Input
                                id="wl-target"
                                type="number"
                                inputMode="decimal"
                                min="1"
                                step="1"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                placeholder="2000"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="wl-date">By date</Label>
                            <Input
                                id="wl-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-3">
                            <Label>Priority</Label>
                            <div className="flex items-center justify-between gap-3">
                                <Select
                                    value={priority}
                                    onValueChange={(v) => setPriority(v as Priority)}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRIORITY_OPTIONS.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="submit" disabled={creating}>
                                    {creating ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Plus className="size-4" />
                                    )}
                                    {creating ? "Adding…" : "Add"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            ) : items.length === 0 ? (
                <Card className="border-dashed border-border/60">
                    <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                        <ShoppingBag className="size-8 text-muted-foreground" />
                        <p className="text-sm font-medium">Your wishlist is empty</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            Add something you'd like to save up for. Each item gets its own
                            progress bar.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {items.map((item) => (
                        <WishlistItemCard
                            key={item.id}
                            item={item}
                            onContribute={contribute}
                            onUpdate={updateItem}
                            onRemove={removeItem}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function BalanceSummary({
    summary,
    loading,
}: {
    summary: Summary | null;
    loading: boolean;
}) {
    if (loading || !summary) {
        return (
            <Card className="border-border/60">
                <CardContent className="py-6">
                    <Skeleton className="h-20 w-full" />
                </CardContent>
            </Card>
        );
    }

    const overcommitted = summary.free < 0;

    return (
        <Card className="border-border/60">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <Wallet className="size-4" /> Your balance
                </CardTitle>
                <CardDescription>
                    Lifetime savings, what you've set aside, and what's still free.
                </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-4">
                <SummaryStat label="Income" value={summary.income} tone="positive" />
                <SummaryStat label="Expenses" value={summary.expense} tone="negative" />
                <SummaryStat
                    label="Committed"
                    value={summary.committed}
                    tone="muted"
                    hint="Across active wishlist items"
                />
                <SummaryStat
                    label={overcommitted ? "Over by" : "Free to allocate"}
                    value={Math.abs(summary.free)}
                    tone={overcommitted ? "negative" : "positive"}
                    hint={
                        overcommitted
                            ? "You've set aside more than your balance covers"
                            : `Balance ${formatCurrency(summary.balance)}`
                    }
                />
            </CardContent>
        </Card>
    );
}

function SummaryStat({
    label,
    value,
    tone,
    hint,
}: {
    label: string;
    value: number;
    tone: "positive" | "negative" | "muted";
    hint?: string;
}) {
    const toneClass =
        tone === "positive"
            ? "text-emerald-600 dark:text-emerald-500"
            : tone === "negative"
                ? "text-rose-600 dark:text-rose-500"
                : "text-foreground";
    return (
        <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {label}
            </p>
            <p
                className={cn(
                    "font-display text-2xl font-normal tabular-nums",
                    toneClass
                )}
            >
                {formatCurrency(value)}
            </p>
            {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
        </div>
    );
}

function WishlistItemCard({
    item,
    onContribute,
    onUpdate,
    onRemove,
}: {
    item: WishlistItem;
    onContribute: (item: WishlistItem, amount: number) => Promise<void>;
    onUpdate: (
        item: WishlistItem,
        patch: {
            name: string;
            targetAmount: number;
            savedAmount: number;
            targetDate: string | null;
            priority: Priority;
            notes: string;
        }
    ) => Promise<void>;
    onRemove: (item: WishlistItem) => Promise<void>;
}) {
    const [amountInput, setAmountInput] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);

    async function submitContribution(e: React.FormEvent) {
        e.preventDefault();
        const n = Number(amountInput);
        if (!Number.isFinite(n) || n === 0) {
            toast.error("Enter a non-zero amount");
            return;
        }
        setBusy(true);
        try {
            await onContribute(item, n);
            setAmountInput("");
        } finally {
            setBusy(false);
        }
    }

    const percent = Math.max(0, Math.min(100, item.percent));
    const priorityTone =
        item.priority === "high"
            ? "text-rose-600 dark:text-rose-500"
            : item.priority === "medium"
                ? "text-amber-600 dark:text-amber-500"
                : "text-muted-foreground";

    return (
        <Card
            className={cn(
                "border-border/60 transition",
                item.completed && "border-emerald-500/40 bg-emerald-500/[0.03]"
            )}
        >
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base font-medium">
                            {item.completed ? (
                                <Sparkles className="size-4 text-emerald-500" />
                            ) : null}
                            {item.name}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                            <span className={priorityTone}>
                                {item.priority.charAt(0).toUpperCase() +
                                    item.priority.slice(1)}{" "}
                                priority
                            </span>
                            {item.targetDate ? (
                                <>
                                    <span>·</span>
                                    <span>by {formatDate(item.targetDate)}</span>
                                </>
                            ) : null}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditOpen(true)}
                            aria-label={`Edit ${item.name}`}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemove(item)}
                            aria-label={`Remove ${item.name}`}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                        <p className="font-display text-2xl font-normal tabular-nums">
                            {formatCurrency(item.savedAmount)}
                        </p>
                        <p className="text-sm text-muted-foreground tabular-nums">
                            of {formatCurrency(item.targetAmount)}
                        </p>
                    </div>
                    <Progress
                        value={percent}
                        className={cn(
                            "h-2",
                            item.completed && "[&>div]:bg-emerald-500"
                        )}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{percent.toFixed(0)}% funded</span>
                        <span className="tabular-nums">
                            {item.completed
                                ? "Fully funded"
                                : `${formatCurrency(item.remaining)} to go`}
                        </span>
                    </div>
                </div>

                <Separator />

                <form onSubmit={submitContribution} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor={`contribute-${item.id}`} className="text-xs">
                            Add savings
                        </Label>
                        <Input
                            id={`contribute-${item.id}`}
                            type="number"
                            inputMode="decimal"
                            step="1"
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                            placeholder="50"
                            disabled={busy}
                        />
                    </div>
                    <Button type="submit" disabled={busy} variant="default">
                        {busy ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            "Save"
                        )}
                    </Button>
                </form>
                <p className="text-[11px] text-muted-foreground">
                    Use a negative number to take savings back out.
                </p>
            </CardContent>
            <EditItemDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                item={item}
                onUpdate={onUpdate}
            />
        </Card>
    );
}

function EditItemDialog({
    open,
    onOpenChange,
    item,
    onUpdate,
}: {
    open: boolean;
    onOpenChange: (next: boolean) => void;
    item: WishlistItem;
    onUpdate: (
        item: WishlistItem,
        patch: {
            name: string;
            targetAmount: number;
            savedAmount: number;
            targetDate: string | null;
            priority: Priority;
            notes: string;
        }
    ) => Promise<void>;
}) {
    const [name, setName] = React.useState(item.name);
    const [target, setTarget] = React.useState(String(item.targetAmount));
    const [saved, setSaved] = React.useState(String(item.savedAmount));
    const [date, setDate] = React.useState(
        item.targetDate ? formatDateInput(item.targetDate) : ""
    );
    const [priority, setPriority] = React.useState<Priority>(item.priority);
    const [notes, setNotes] = React.useState(item.notes);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (!open) return;
        setName(item.name);
        setTarget(String(item.targetAmount));
        setSaved(String(item.savedAmount));
        setDate(item.targetDate ? formatDateInput(item.targetDate) : "");
        setPriority(item.priority);
        setNotes(item.notes);
    }, [open, item]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = name.trim();
        const targetNum = Number(target);
        const savedNum = Number(saved);
        if (!trimmed) {
            toast.error("Name is required");
            return;
        }
        if (!Number.isFinite(targetNum) || targetNum <= 0) {
            toast.error("Target must be a positive number");
            return;
        }
        if (!Number.isFinite(savedNum) || savedNum < 0) {
            toast.error("Saved must be zero or more");
            return;
        }
        setSaving(true);
        try {
            await onUpdate(item, {
                name: trimmed,
                targetAmount: targetNum,
                savedAmount: savedNum,
                targetDate: date || null,
                priority,
                notes,
            });
            toast.success("Updated");
            onOpenChange(false);
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Could not update");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit item</DialogTitle>
                    <DialogDescription>
                        Adjust the goal, saved amount, deadline, or notes.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor={`edit-name-${item.id}`}>Name</Label>
                        <Input
                            id={`edit-name-${item.id}`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={120}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor={`edit-target-${item.id}`}>Target ($)</Label>
                            <Input
                                id={`edit-target-${item.id}`}
                                type="number"
                                inputMode="decimal"
                                min="1"
                                step="1"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor={`edit-saved-${item.id}`}>Saved ($)</Label>
                            <Input
                                id={`edit-saved-${item.id}`}
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="1"
                                value={saved}
                                onChange={(e) => setSaved(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor={`edit-date-${item.id}`}>By date</Label>
                            <Input
                                id={`edit-date-${item.id}`}
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Priority</Label>
                            <Select
                                value={priority}
                                onValueChange={(v) => setPriority(v as Priority)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor={`edit-notes-${item.id}`}>Notes</Label>
                        <Textarea
                            id={`edit-notes-${item.id}`}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            maxLength={500}
                            rows={3}
                            placeholder="Optional"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                            {saving ? "Saving…" : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
