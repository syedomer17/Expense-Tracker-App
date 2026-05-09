import { NextResponse } from "next/server";
import Expense from "@/models/expenseModel";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";
import {
    parseCreatePayload,
    serializeTransaction,
} from "@/lib/transactionValidation";

export async function POST(request: Request) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;
        const { userId } = auth;

        const body = await request.json().catch(() => null);
        const parsed = parseCreatePayload(body);
        if (!parsed.ok) {
            return NextResponse.json({ message: parsed.message }, { status: 400 });
        }

        await ConnectDB();
        const expense = await Expense.create({ ...parsed.data, userId });

        return NextResponse.json(
            { expense: serializeTransaction(expense) },
            { status: 201 }
        );
    } catch (error) {
        console.error("[expense.add] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
