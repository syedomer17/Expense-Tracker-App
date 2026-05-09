import { NextResponse } from "next/server";
import RefreshToken from "@/models/refreshTokenModel";
import { ConnectDB } from "@/lib/db";
import {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/utils/token";
import {
    setAccessTokenCookie,
    setRefreshTokenCookie,
    clearAuthCookies,
    REFRESH_TOKEN_COOKIE,
} from "@/lib/cookies";
import { readCookie } from "@/lib/auth";

function unauthorized() {
    const response = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    clearAuthCookies(response);
    return response;
}

export async function POST(request: Request) {
    try {
        const refreshRaw = readCookie(request, REFRESH_TOKEN_COOKIE);
        if (!refreshRaw) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await ConnectDB();

        const tokenHash = hashRefreshToken(refreshRaw);
        const stored = await RefreshToken.findOne({ tokenHash });
        if (!stored) {
            return unauthorized();
        }

        if (stored.revokedAt) {
            await RefreshToken.updateMany(
                { userId: stored.userId, revokedAt: null },
                { $set: { revokedAt: new Date() } }
            );
            return unauthorized();
        }

        if (stored.expiresAt.getTime() <= Date.now()) {
            return unauthorized();
        }

        const newAccessToken = generateAccessToken(String(stored.userId));
        const { raw: newRefreshRaw, hash: newRefreshHash } = generateRefreshToken();

        await RefreshToken.create({
            userId: stored.userId,
            tokenHash: newRefreshHash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000),
        });

        stored.revokedAt = new Date();
        stored.replacedByHash = newRefreshHash;
        await stored.save();

        const response = NextResponse.json({ message: "Token refreshed" });
        setAccessTokenCookie(response, newAccessToken);
        setRefreshTokenCookie(response, newRefreshRaw);
        return response;
    } catch (error) {
        console.error("[refresh] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
