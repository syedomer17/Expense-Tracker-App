import * as XLSX from "xlsx";
import type { Types } from "mongoose";
import getDateRange, { isDateRange } from "@/utils/dateRange";

export const MAX_EXPORT_ROWS = 50_000;
export const XLSX_CONTENT_TYPE =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

interface TransactionLike {
    _id: Types.ObjectId;
    description: string;
    amount: number;
    category: string;
    date: Date;
    type: string;
    createdAt: Date;
    updatedAt: Date;
}

export function buildTransactionXlsx(
    items: TransactionLike[],
    sheetName: string
): Buffer {
    const rows = items.map((t) => ({
        ID: String(t._id),
        Description: t.description,
        Amount: t.amount,
        Category: t.category,
        Date: t.date,
        Type: t.type,
        CreatedAt: t.createdAt,
        UpdatedAt: t.updatedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, {
        cellDates: true,
    });

    worksheet["!cols"] = [
        { wch: 26 }, // ID
        { wch: 40 }, // Description
        { wch: 14 }, // Amount
        { wch: 20 }, // Category
        { wch: 20 }, // Date
        { wch: 10 }, // Type
        { wch: 20 }, // CreatedAt
        { wch: 20 }, // UpdatedAt
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export type ExportFilterResult =
    | { ok: true; filter: Record<string, unknown> }
    | { ok: false; message: string };

export function buildExportFilter(searchParams: URLSearchParams): ExportFilterResult {
    const filter: Record<string, unknown> = {};

    const category = searchParams.get("category");
    if (category && category.trim()) filter.category = category.trim();

    const range = searchParams.get("range");
    if (range !== null) {
        if (!isDateRange(range)) {
            return {
                ok: false,
                message: "range must be one of: daily, weekly, monthly, yearly",
            };
        }
        const { start, end } = getDateRange(range);
        filter.date = { $gte: start, $lte: end };
        return { ok: true, filter };
    }

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

    return { ok: true, filter };
}

export function exportFilename(prefix: string): string {
    const stamp = new Date().toISOString().slice(0, 10);
    return `${prefix}-${stamp}.xlsx`;
}
