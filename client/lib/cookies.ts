import type { NextResponse } from "next/server";
import {
    ACCESS_TOKEN_MAX_AGE_SECONDS,
    REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/utils/token";

const isProd = () => process.env.NODE_ENV === "production";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";
const REFRESH_COOKIE_PATH = "/api/user";

export function setAccessTokenCookie(response: NextResponse, token: string): void {
    response.cookies.set(ACCESS_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: isProd(),
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });
}

export function setRefreshTokenCookie(response: NextResponse, token: string): void {
    response.cookies.set(REFRESH_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: isProd(),
        sameSite: "strict",
        path: REFRESH_COOKIE_PATH,
        maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
}

export function clearAuthCookies(response: NextResponse): void {
    response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
        httpOnly: true,
        secure: isProd(),
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
        httpOnly: true,
        secure: isProd(),
        sameSite: "strict",
        path: REFRESH_COOKIE_PATH,
        maxAge: 0,
    });
}
