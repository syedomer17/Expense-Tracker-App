import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { verifyAccessToken } from "@/utils/token";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookies";

export function readCookie(request: Request, name: string): string | null {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;
    for (const part of cookieHeader.split(";")) {
        const [rawName, ...rest] = part.split("=");
        if (rawName?.trim() === name) {
            return decodeURIComponent(rest.join("=").trim());
        }
    }
    return null;
}

export function getAuthUserId(request: Request): string | null {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7).trim();
        if (token) {
            const payload = verifyAccessToken(token);
            if (payload) return payload.userId;
        }
    }

    const cookieToken = readCookie(request, ACCESS_TOKEN_COOKIE);
    if (cookieToken) {
        const payload = verifyAccessToken(cookieToken);
        if (payload) return payload.userId;
    }

    return null;
}

export type AuthSuccess = { userId: string };
export type AuthResult = AuthSuccess | NextResponse;

export function requireAuth(request: Request): AuthResult {
    const userId = getAuthUserId(request);
    if (!userId || !isValidObjectId(userId)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return { userId };
}

export function isAuthFailure(result: AuthResult): result is NextResponse {
    return result instanceof NextResponse;
}
