import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import Expense from "@/models/expenseModel";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";

type RouteCtx = { params: Promise<{ id: string }> };

const NOT_FOUND = NextResponse.json({ message: "Not found" }, { status: 404 });

export async function DELETE(request: Request, ctx: RouteCtx) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;
        const { userId } = auth;

        const { id } = await ctx.params;
        if (!isValidObjectId(id)) return NOT_FOUND;

        await ConnectDB();
        const result = await Expense.findOneAndDelete({ _id: id, userId })
            .select("_id")
            .lean();
        if (!result) return NOT_FOUND;

        return NextResponse.json({ message: "Deleted", id: String(result._id) });
    } catch (error) {
        console.error("[expense.delete] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
