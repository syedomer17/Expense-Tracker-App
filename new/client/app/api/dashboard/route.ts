import { NextResponse } from "next/server";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";
import { buildDashboard, isDashboardRange } from "@/lib/dashboard";

export async function GET(request: Request) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;
        const { userId } = auth;

        const url = new URL(request.url);
        const rangeParam = url.searchParams.get("range");
        const range = isDashboardRange(rangeParam) ? rangeParam : "month";

        await ConnectDB();
        const dashboard = await buildDashboard(userId, range);

        return NextResponse.json({ dashboard });
    } catch (error) {
        console.error("[dashboard] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
