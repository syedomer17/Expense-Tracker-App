import { NextResponse } from "next/server";
import { auth } from "@/auth";
import User from "@/models/userModel";
import RefreshToken from "@/models/refreshTokenModel";
import { ConnectDB } from "@/lib/db";
import {
    generateAccessToken,
    generateRefreshToken,
    REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/utils/token";
import { setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/cookies";

function safeNextPath(raw: string | null): string {
    if (!raw) return "/";
    if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
    return raw;
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const next = safeNextPath(url.searchParams.get("next"));
        const loginUrl = new URL("/login", url.origin);

        const session = await auth();
        const email = session?.user?.email?.toLowerCase().trim();
        if (!email) {
            return NextResponse.redirect(loginUrl);
        }

        await ConnectDB();
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.redirect(loginUrl);
        }

        const accessToken = generateAccessToken(String(user._id));
        const { raw: refreshRaw, hash: refreshHash } = generateRefreshToken();
        await RefreshToken.create({
            userId: user._id,
            tokenHash: refreshHash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000),
        });

        const response = NextResponse.redirect(new URL(next, url.origin));
        setAccessTokenCookie(response, accessToken);
        setRefreshTokenCookie(response, refreshRaw);
        return response;
    } catch (error) {
        console.error("[auth.bridge] error:", error);
        const url = new URL(request.url);
        return NextResponse.redirect(new URL("/login?error=oauth", url.origin));
    }
}
