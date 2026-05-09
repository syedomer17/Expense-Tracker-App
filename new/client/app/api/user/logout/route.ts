import { NextResponse } from "next/server";
import RefreshToken from "@/models/refreshTokenModel";
import { ConnectDB } from "@/lib/db";
import { hashRefreshToken } from "@/utils/token";
import { clearAuthCookies, REFRESH_TOKEN_COOKIE } from "@/lib/cookies";
import { readCookie } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const refreshRaw = readCookie(request, REFRESH_TOKEN_COOKIE);
        if (refreshRaw) {
            await ConnectDB();
            const tokenHash = hashRefreshToken(refreshRaw);
            await RefreshToken.updateOne(
                { tokenHash, revokedAt: null },
                { $set: { revokedAt: new Date() } }
            );
        }
    } catch (error) {
        console.error("[logout] error:", error);
    }

    const response = NextResponse.json({ message: "Logged out" });
    clearAuthCookies(response);
    return response;
}
