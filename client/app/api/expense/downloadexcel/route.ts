import { NextResponse } from "next/server";
import Expense from "@/models/expenseModel";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";
import {
    buildTransactionXlsx,
    buildExportFilter,
    exportFilename,
    MAX_EXPORT_ROWS,
    XLSX_CONTENT_TYPE,
} from "@/lib/transactionExport";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;
        const { userId } = auth;

        const { searchParams } = new URL(request.url);
        const filterResult = buildExportFilter(searchParams);
        if (!filterResult.ok) {
            return NextResponse.json({ message: filterResult.message }, { status: 400 });
        }

        await ConnectDB();
        const items = await Expense.find({ ...filterResult.filter, userId })
            .sort({ date: -1, _id: -1 })
            .limit(MAX_EXPORT_ROWS)
            .lean();

        const buffer = buildTransactionXlsx(items, "Expense");
        const filename = exportFilename("expense");

        return new Response(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type": XLSX_CONTENT_TYPE,
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": String(buffer.byteLength),
                "Cache-Control": "private, no-store",
            },
        });
    } catch (error) {
        console.error("[expense.downloadexcel] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
