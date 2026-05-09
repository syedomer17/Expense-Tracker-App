import { NextResponse } from "next/server";
import Income from "@/models/incomeModel";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";
import {
    parseCreatePayload,
    serializeTransaction,
} from "@/lib/transactionValidation";
import { appUrlFromRequest, checkAndNotifyGoalHit } from "@/lib/goalNotify";

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
        const income = await Income.create({ ...parsed.data, userId });

        void checkAndNotifyGoalHit(userId, appUrlFromRequest(request)).catch(
            (err) => console.error("[income.add] goal-hit check:", err)
        );

        return NextResponse.json(
            { income: serializeTransaction(income) },
            { status: 201 }
        );
    } catch (error) {
        console.error("[income.add] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
