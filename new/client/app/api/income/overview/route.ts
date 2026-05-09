import { NextResponse } from "next/server";
import Income from "@/models/incomeModel";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";
import { buildOverview } from "@/lib/transactionOverview";
import { isDashboardRange } from "@/lib/bucketSeries";

export async function GET(request: Request) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;
        const { userId } = auth;

        const url = new URL(request.url);
        const rangeParam = url.searchParams.get("range");
        const range = isDashboardRange(rangeParam) ? rangeParam : "month";

        await ConnectDB();
        const overview = await buildOverview(Income, userId, range);

        return NextResponse.json({ overview });
    } catch (error) {
        console.error("[income.overview] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
