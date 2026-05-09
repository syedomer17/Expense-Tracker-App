import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import Expense from "@/models/expenseModel";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";
import {
    parseUpdatePayload,
    serializeTransaction,
} from "@/lib/transactionValidation";
import { appUrlFromRequest, checkAndNotifyGoalHit } from "@/lib/goalNotify";

type RouteCtx = { params: Promise<{ id: string }> };

const NOT_FOUND = NextResponse.json({ message: "Not found" }, { status: 404 });

export async function PATCH(request: Request, ctx: RouteCtx) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;
        const { userId } = auth;

        const { id } = await ctx.params;
        if (!isValidObjectId(id)) return NOT_FOUND;

        const body = await request.json().catch(() => null);
        const parsed = parseUpdatePayload(body);
        if (!parsed.ok) {
            return NextResponse.json({ message: parsed.message }, { status: 400 });
        }

        await ConnectDB();
        const expense = await Expense.findOneAndUpdate(
            { _id: id, userId },
            { $set: parsed.data },
            { new: true, runValidators: true }
        ).lean();
        if (!expense) return NOT_FOUND;

        void checkAndNotifyGoalHit(userId, appUrlFromRequest(request)).catch(
            (err) => console.error("[expense.update] goal-hit check:", err)
        );

        return NextResponse.json({ expense: serializeTransaction(expense) });
    } catch (error) {
        console.error("[expense.update] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
