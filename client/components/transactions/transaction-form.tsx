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
import { formatCurrency, formatDateInput } from "@/lib/format";

export type PaymentMethod = "upi" | "cash" | "both";

export interface TransactionFormValue {
    description: string;
    amount: number;
    category: string;
    date: string;
    paymentMethod: PaymentMethod;
    upiAmount: number;
    cashAmount: number;
}

export interface TransactionRecord {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    paymentMethod?: PaymentMethod;
    upiAmount?: number;
    cashAmount?: number;
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

    const initialPaymentMethod: PaymentMethod = initial?.paymentMethod ?? "cash";
    const initialUpi = initial?.upiAmount;
    const initialCash = initial?.cashAmount;
    const initialSingleAmount = (() => {
        if (initial?.amount === undefined) return "";
        if (initialPaymentMethod === "upi") {
            return String(initialUpi ?? initial.amount);
        }
        return String(initialCash ?? initial.amount);
    })();

    const [description, setDescription] = React.useState(initial?.description ?? "");
    const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(
        initialPaymentMethod
    );
    const [amount, setAmount] = React.useState(initialSingleAmount);
    const [upiAmount, setUpiAmount] = React.useState(
        initialUpi !== undefined ? String(initialUpi) : ""
    );
    const [cashAmount, setCashAmount] = React.useState(
        initialCash !== undefined ? String(initialCash) : ""
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
    const isSplit = paymentMethod === "both";
    const splitTotal =
        (Number(upiAmount) || 0) + (Number(cashAmount) || 0);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        let upi = 0;
        let cash = 0;
        if (paymentMethod === "both") {
            upi = Number(upiAmount);
            cash = Number(cashAmount);
            if (!Number.isFinite(upi) || upi <= 0) {
                toast.error("Enter a valid UPI amount");
                return;
            }
            if (!Number.isFinite(cash) || cash <= 0) {
                toast.error("Enter a valid cash amount");
                return;
            }
        } else {
            const single = Number(amount);
            if (!Number.isFinite(single) || single <= 0) {
                toast.error("Enter a valid amount");
                return;
            }
            if (paymentMethod === "upi") upi = single;
            else cash = single;
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
            amount: upi + cash,
            category: resolvedCategory,
            date: new Date(date).toISOString(),
            paymentMethod,
            upiAmount: upi,
            cashAmount: cash,
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
                    <Label htmlFor="paymentMethod">Paid via</Label>
                    <Select
                        value={paymentMethod}
                        onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                    >
                        <SelectTrigger id="paymentMethod" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="both">Both (UPI + Cash)</SelectItem>
                        </SelectContent>
                    </Select>
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
            {isSplit ? (
                <div className="space-y-1.5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="upiAmount">UPI amount</Label>
                            <Input
                                id="upiAmount"
                                inputMode="decimal"
                                type="number"
                                min="0"
                                step="0.01"
                                value={upiAmount}
                                onChange={(e) => setUpiAmount(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="cashAmount">Cash amount</Label>
                            <Input
                                id="cashAmount"
                                inputMode="decimal"
                                type="number"
                                min="0"
                                step="0.01"
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums">
                        Total: {formatCurrency(splitTotal)}
                    </p>
                </div>
            ) : (
                <div className="space-y-1.5">
                    <Label htmlFor="amount">
                        {paymentMethod === "upi" ? "UPI amount" : "Cash amount"}
                    </Label>
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
            )}
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
