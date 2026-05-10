import type { Types } from "mongoose";

export type PaymentMethod = "upi" | "cash" | "both";

export interface TransactionInput {
    description: string;
    amount: number;
    category: string;
    date: Date;
    paymentMethod?: PaymentMethod;
    upiAmount?: number;
    cashAmount?: number;
}

export type ParseResult<T> =
    | { ok: true; data: T }
    | { ok: false; message: string };

const MAX_DESCRIPTION = 500;
const MAX_CATEGORY = 100;
const MAX_AMOUNT = 1_000_000_000;

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === "object" && !Array.isArray(value);
}

function parseDescription(value: unknown): ParseResult<string> {
    if (typeof value !== "string") {
        return { ok: false, message: "description must be a string" };
    }
    const trimmed = value.trim();
    if (!trimmed) return { ok: false, message: "description is required" };
    if (trimmed.length > MAX_DESCRIPTION) {
        return { ok: false, message: `description must be at most ${MAX_DESCRIPTION} characters` };
    }
    return { ok: true, data: trimmed };
}

function parseAmount(value: unknown): ParseResult<number> {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return { ok: false, message: "amount must be a finite number" };
    }
    if (value < 0) return { ok: false, message: "amount must be non-negative" };
    if (value > MAX_AMOUNT) return { ok: false, message: "amount is too large" };
    return { ok: true, data: value };
}

function parseCategory(value: unknown): ParseResult<string> {
    if (typeof value !== "string") {
        return { ok: false, message: "category must be a string" };
    }
    const trimmed = value.trim();
    if (!trimmed) return { ok: false, message: "category is required" };
    if (trimmed.length > MAX_CATEGORY) {
        return { ok: false, message: `category must be at most ${MAX_CATEGORY} characters` };
    }
    return { ok: true, data: trimmed };
}

function parsePaymentMethod(value: unknown): ParseResult<PaymentMethod> {
    if (value !== "upi" && value !== "cash" && value !== "both") {
        return { ok: false, message: "paymentMethod must be 'upi', 'cash', or 'both'" };
    }
    return { ok: true, data: value };
}

function parseSplitAmount(value: unknown, field: string): ParseResult<number> {
    if (value === undefined || value === null || value === "") {
        return { ok: true, data: 0 };
    }
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return { ok: false, message: `${field} must be a finite number` };
    }
    if (value < 0) return { ok: false, message: `${field} must be non-negative` };
    if (value > MAX_AMOUNT) return { ok: false, message: `${field} is too large` };
    return { ok: true, data: value };
}

interface PaymentSplit {
    paymentMethod: PaymentMethod;
    upiAmount: number;
    cashAmount: number;
    amount: number;
}

function parsePaymentSplit(body: Record<string, unknown>): ParseResult<PaymentSplit> {
    const method = parsePaymentMethod(body.paymentMethod);
    if (!method.ok) return method;
    const upi = parseSplitAmount(body.upiAmount, "upiAmount");
    if (!upi.ok) return upi;
    const cash = parseSplitAmount(body.cashAmount, "cashAmount");
    if (!cash.ok) return cash;

    if (method.data === "upi" && (upi.data <= 0 || cash.data !== 0)) {
        return { ok: false, message: "UPI entries need upiAmount > 0 and cashAmount = 0" };
    }
    if (method.data === "cash" && (cash.data <= 0 || upi.data !== 0)) {
        return { ok: false, message: "Cash entries need cashAmount > 0 and upiAmount = 0" };
    }
    if (method.data === "both" && (upi.data <= 0 || cash.data <= 0)) {
        return { ok: false, message: "Both entries need upiAmount > 0 and cashAmount > 0" };
    }

    const total = upi.data + cash.data;
    if (total > MAX_AMOUNT) return { ok: false, message: "amount is too large" };

    return {
        ok: true,
        data: {
            paymentMethod: method.data,
            upiAmount: upi.data,
            cashAmount: cash.data,
            amount: total,
        },
    };
}

function parseDate(value: unknown): ParseResult<Date> {
    if (typeof value !== "string" && !(value instanceof Date)) {
        return { ok: false, message: "date must be an ISO string or Date" };
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return { ok: false, message: "date is invalid" };
    }
    return { ok: true, data: date };
}

export function parseCreatePayload(body: unknown): ParseResult<TransactionInput> {
    if (!isPlainObject(body)) return { ok: false, message: "Invalid JSON body" };

    const description = parseDescription(body.description);
    if (!description.ok) return description;
    const category = parseCategory(body.category);
    if (!category.ok) return category;
    const date = parseDate(body.date);
    if (!date.ok) return date;

    if (body.paymentMethod !== undefined) {
        const split = parsePaymentSplit(body);
        if (!split.ok) return split;
        return {
            ok: true,
            data: {
                description: description.data,
                amount: split.data.amount,
                category: category.data,
                date: date.data,
                paymentMethod: split.data.paymentMethod,
                upiAmount: split.data.upiAmount,
                cashAmount: split.data.cashAmount,
            },
        };
    }

    const amount = parseAmount(body.amount);
    if (!amount.ok) return amount;

    return {
        ok: true,
        data: {
            description: description.data,
            amount: amount.data,
            category: category.data,
            date: date.data,
        },
    };
}

export function parseUpdatePayload(body: unknown): ParseResult<Partial<TransactionInput>> {
    if (!isPlainObject(body)) return { ok: false, message: "Invalid JSON body" };

    const updates: Partial<TransactionInput> = {};

    if (body.description !== undefined) {
        const r = parseDescription(body.description);
        if (!r.ok) return r;
        updates.description = r.data;
    }
    if (body.category !== undefined) {
        const r = parseCategory(body.category);
        if (!r.ok) return r;
        updates.category = r.data;
    }
    if (body.date !== undefined) {
        const r = parseDate(body.date);
        if (!r.ok) return r;
        updates.date = r.data;
    }

    if (body.paymentMethod !== undefined) {
        const split = parsePaymentSplit(body);
        if (!split.ok) return split;
        updates.paymentMethod = split.data.paymentMethod;
        updates.upiAmount = split.data.upiAmount;
        updates.cashAmount = split.data.cashAmount;
        updates.amount = split.data.amount;
    } else if (body.amount !== undefined) {
        const r = parseAmount(body.amount);
        if (!r.ok) return r;
        updates.amount = r.data;
    }

    if (Object.keys(updates).length === 0) {
        return { ok: false, message: "No fields to update" };
    }
    return { ok: true, data: updates };
}

export interface ListQuery {
    page: number;
    limit: number;
    skip: number;
    filter: Record<string, unknown>;
}

export function parseListQuery(searchParams: URLSearchParams): ListQuery {
    const pageRaw = parseInt(searchParams.get("page") ?? "1", 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

    const limitRaw = parseInt(searchParams.get("limit") ?? "20", 10);
    const limit = Math.min(100, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 20));

    const filter: Record<string, unknown> = {};

    const category = searchParams.get("category");
    if (category && category.trim()) filter.category = category.trim();

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const dateFilter: Record<string, Date> = {};
    if (from) {
        const d = new Date(from);
        if (!Number.isNaN(d.getTime())) dateFilter.$gte = d;
    }
    if (to) {
        const d = new Date(to);
        if (!Number.isNaN(d.getTime())) dateFilter.$lte = d;
    }
    if (Object.keys(dateFilter).length) filter.date = dateFilter;

    return { page, limit, skip: (page - 1) * limit, filter };
}

interface TransactionLike {
    _id: Types.ObjectId;
    description: string;
    amount: number;
    category: string;
    date: Date;
    type: string;
    paymentMethod?: PaymentMethod;
    upiAmount?: number;
    cashAmount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export function serializeTransaction(t: TransactionLike) {
    return {
        id: String(t._id),
        description: t.description,
        amount: t.amount,
        category: t.category,
        date: t.date,
        type: t.type,
        paymentMethod: t.paymentMethod,
        upiAmount: t.upiAmount,
        cashAmount: t.cashAmount,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
    };
}
