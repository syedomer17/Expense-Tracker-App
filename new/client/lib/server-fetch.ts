import { cookies, headers } from "next/headers";

function buildBaseUrl(): string {
    const env =
        process.env.NEXT_PUBLIC_APP_URL ??
        process.env.APP_URL ??
        process.env.VERCEL_URL;
    if (env) {
        return env.startsWith("http") ? env : `https://${env}`;
    }
    return "";
}

async function resolveOrigin(): Promise<string> {
    const fromEnv = buildBaseUrl();
    if (fromEnv) return fromEnv;
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    return host ? `${proto}://${host}` : "http://localhost:3000";
}

export async function serverFetch<T = unknown>(
    path: string,
    init: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null }> {
    const origin = await resolveOrigin();
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    const url = path.startsWith("http") ? path : `${origin}${path}`;
    const response = await fetch(url, {
        ...init,
        headers: {
            ...(init.headers ?? {}),
            cookie: cookieHeader,
        },
        cache: "no-store",
    });
    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? ((await response.json().catch(() => null)) as T | null) : null;
    return { ok: response.ok, status: response.status, data };
}
