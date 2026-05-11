import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/cookies";

const PROTECTED_PREFIXES = [
    "/dashboard",
    "/expense",
    "/income",
    "/goals",
    "/wishlist",
    "/profile",
];

const AUTH_PREFIXES = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
];

function pathMatches(pathname: string, prefixes: readonly string[]): boolean {
    return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

async function tryRefresh(request: NextRequest): Promise<string[] | null> {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;
    try {
        const resp = await fetch(new URL("/api/user/refresh", request.url), {
            method: "POST",
            headers: { cookie: cookieHeader },
            cache: "no-store",
        });
        if (!resp.ok) return null;
        const setCookies = resp.headers.getSetCookie?.() ?? [];
        return setCookies.length ? setCookies : null;
    } catch {
        return null;
    }
}

function applyNewCookies(
    request: NextRequest,
    response: NextResponse,
    setCookies: readonly string[]
): void {
    for (const raw of setCookies) {
        response.headers.append("set-cookie", raw);
        const semicolon = raw.indexOf(";");
        const head = semicolon === -1 ? raw : raw.substring(0, semicolon);
        const eq = head.indexOf("=");
        if (eq <= 0) continue;
        const name = head.substring(0, eq).trim();
        const value = head.substring(eq + 1);
        if (name === ACCESS_TOKEN_COOKIE || name === REFRESH_TOKEN_COOKIE) {
            request.cookies.set(name, value);
        }
    }
}

function clearAuthCookiesOnResponse(response: NextResponse): void {
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    // Older deployments may have stored refresh at /api/user; clear that too.
    response.cookies.set({
        name: REFRESH_TOKEN_COOKIE,
        value: "",
        path: "/api/user",
        maxAge: 0,
    });
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const access = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    const refresh = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    const isProtected = pathMatches(pathname, PROTECTED_PREFIXES);
    const isAuth = pathMatches(pathname, AUTH_PREFIXES);
    const isHome = pathname === "/";

    if (access && (isAuth || isHome)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!access && refresh) {
        const setCookies = await tryRefresh(request);
        if (setCookies) {
            const response =
                isAuth || isHome
                    ? NextResponse.redirect(new URL("/dashboard", request.url))
                    : NextResponse.next({ request: { headers: request.headers } });
            applyNewCookies(request, response, setCookies);
            return response;
        }

        if (isProtected) {
            const response = NextResponse.redirect(new URL("/login", request.url));
            clearAuthCookiesOnResponse(response);
            return response;
        }

        const response = NextResponse.next();
        clearAuthCookiesOnResponse(response);
        return response;
    }

    if (isProtected && !access && !refresh) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|opengraph-image|icon|apple-icon|.*\\..*).*)",
    ],
};
