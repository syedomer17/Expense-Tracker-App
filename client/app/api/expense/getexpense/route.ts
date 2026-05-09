import { NextResponse } from "next/server";
import Expense from "@/models/expenseModel";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";
import {
    parseListQuery,
    serializeTransaction,
} from "@/lib/transactionValidation";

export async function GET(request: Request) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;
        const { userId } = auth;

        const { searchParams } = new URL(request.url);
        const { page, limit, skip, filter } = parseListQuery(searchParams);

        await ConnectDB();
        const query = { ...filter, userId };

        const [items, total] = await Promise.all([
            Expense.find(query)
                .sort({ date: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Expense.countDocuments(query),
        ]);

        return NextResponse.json({
            items: items.map(serializeTransaction),
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        });
    } catch (error) {
        console.error("[expense.get] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
