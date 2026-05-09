"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    const baseCategories = kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const presets = React.useMemo(() => {
        const merged = new Set<string>(baseCategories.filter((c) => c !== "Other"));
        for (const c of suggestedCategories ?? []) {
            if (c && c !== "Other") merged.add(c);
        }
        return [...merged, "Other"];
    }, [baseCategories, suggestedCategories]);

    const initialCategory = initial?.category ?? "";
    const initialIsPreset =
        initialCategory !== "" &&
        presets.includes(initialCategory) &&
        initialCategory !== "Other";

    const [description, setDescription] = React.useState(initial?.description ?? "");
    const [amount, setAmount] = React.useState(
        initial?.amount !== undefined ? String(initial.amount) : ""
    );
    const [selectedCategory, setSelectedCategory] = React.useState<string>(
        initialCategory === "" ? "" : initialIsPreset ? initialCategory : "Other"
    );
    const [customCategory, setCustomCategory] = React.useState(
        initialCategory !== "" && !initialIsPreset ? initialCategory : ""
    );
    const [date, setDate] = React.useState(
        formatDateInput(initial?.date ?? new Date())
    );
    const [pending, setPending] = React.useState(false);

    const isOther = selectedCategory === "Other";
    const resolvedCategory = isOther ? customCategory.trim() : selectedCategory;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount < 0) {
            toast.error("Enter a valid non-negative amount");
            return;
        }
        if (!selectedCategory) {
            toast.error("Pick a category");
            return;
        }
        if (isOther && !resolvedCategory) {
            toast.error("Enter a custom category");
            return;
        }
        const payload = {
            description: description.trim(),
            amount: numericAmount,
            category: resolvedCategory,
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
                <Select
                    value={selectedCategory}
                    onValueChange={(v) => {
                        setSelectedCategory(v);
                        if (v !== "Other") setCustomCategory("");
                    }}
                >
                    <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="Pick a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {presets.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isOther ? (
                    <Input
                        id="custom-category"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter your category"
                        autoFocus
                        required
                        maxLength={100}
                    />
                ) : null}
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
