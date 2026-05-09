"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api";
import { formatDateInput } from "@/lib/format";

export interface TransactionFormValue {
    description: string;
    amount: number;
    category: string;
    date: string;
}

export interface TransactionRecord {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
}

interface TransactionFormProps {
    kind: "income" | "expense";
    initial?: TransactionRecord | null;
    onSuccess: (saved: TransactionRecord) => void;
    onCancel?: () => void;
    suggestedCategories?: string[];
}

const INCOME_CATEGORIES = [
    "Salary",
    "Freelance",
    "Investments",
    "Business",
    "Gifts",
    "Other",
];
const EXPENSE_CATEGORIES = [
    "Food",
    "Transport",
    "Housing",
    "Utilities",
    "Entertainment",
    "Health",
    "Shopping",
    "Education",
    "Travel",
    "Other",
];

export function TransactionForm({
    kind,
    initial,
    onSuccess,
    onCancel,
    suggestedCategories,
}: TransactionFormProps) {
    const [description, setDescription] = React.useState(initial?.description ?? "");
    const [amount, setAmount] = React.useState(
        initial?.amount !== undefined ? String(initial.amount) : ""
    );
    const [category, setCategory] = React.useState(initial?.category ?? "");
    const [date, setDate] = React.useState(
        formatDateInput(initial?.date ?? new Date())
    );
    const [pending, setPending] = React.useState(false);

    const presets =
        suggestedCategories && suggestedCategories.length
            ? suggestedCategories
            : kind === "income"
                ? INCOME_CATEGORIES
                : EXPENSE_CATEGORIES;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount < 0) {
            toast.error("Enter a valid non-negative amount");
            return;
        }
        const payload = {
            description: description.trim(),
            amount: numericAmount,
            category: category.trim(),
            date: new Date(date).toISOString(),
        };
        setPending(true);
        try {
            const isEdit = Boolean(initial?.id);
            const path = isEdit
                ? `/api/${kind}/update${kind}/${initial!.id}`
                : `/api/${kind}/add${kind}`;
            const method = isEdit ? "patch" : "post";
            const response = await api[method]<{
                income?: TransactionRecord;
                expense?: TransactionRecord;
            }>(path, payload);
            const saved = (response.income ?? response.expense) as TransactionRecord;
            toast.success(isEdit ? "Updated" : "Added");
            onSuccess(saved);
        } catch (err) {
            if (err instanceof ApiError) toast.error(err.message);
            else toast.error("Could not save");
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                        kind === "income"
                            ? "e.g. November salary"
                            : "e.g. Groceries at Costco"
                    }
                    required
                    maxLength={500}
                    rows={2}
                />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                        id="amount"
                        inputMode="decimal"
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Input
                    id="category"
                    list={`${kind}-cats`}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Pick or type a category"
                    required
                    maxLength={100}
                />
                <datalist id={`${kind}-cats`}>
                    {presets.map((c) => (
                        <option key={c} value={c} />
                    ))}
                </datalist>
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {presets.slice(0, 6).map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setCategory(c)}
                            className="rounded-md border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                {onCancel ? (
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                ) : null}
                <Button type="submit" disabled={pending}>
                    {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                    {pending ? "Saving…" : initial ? "Save changes" : "Add"}
                </Button>
            </div>
        </form>
    );
}
