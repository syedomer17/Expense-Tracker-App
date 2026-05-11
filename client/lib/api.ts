export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = "ApiError";
    }
}

type FetchOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
    json?: boolean;
    skipAuthRetry?: boolean;
};

const REFRESH_PATH = "/api/user/refresh";
let refreshInFlight: Promise<boolean> | null = null;

function isRefreshablePath(path: string): boolean {
    if (typeof window === "undefined") return false;
    if (path === REFRESH_PATH || path.startsWith(REFRESH_PATH + "?")) return false;
    if (path === "/api/user/login" || path === "/api/user/logout") return false;
    return true;
}

async function refreshAccessToken(): Promise<boolean> {
    if (refreshInFlight) return refreshInFlight;
    refreshInFlight = (async () => {
        try {
            const r = await fetch(REFRESH_PATH, {
                method: "POST",
                credentials: "include",
                cache: "no-store",
            });
            return r.ok;
        } catch {
            return false;
        } finally {
            refreshInFlight = null;
        }
    })();
    return refreshInFlight;
}

export async function apiFetch<T = unknown>(
    path: string,
    options: FetchOptions = {}
): Promise<T> {
    const { body, headers, json = true, skipAuthRetry, ...rest } = options;
    const init: RequestInit = {
        ...rest,
        headers: {
            ...(json && body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...(headers ?? {}),
        },
        credentials: "include",
    };
    if (body !== undefined) {
        init.body = json ? JSON.stringify(body) : (body as BodyInit);
    }

    let response = await fetch(path, init);

    if (response.status === 401 && !skipAuthRetry && isRefreshablePath(path)) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            response = await fetch(path, init);
        }
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
        const message =
            (payload && typeof payload === "object" && "message" in payload
                ? String((payload as { message: unknown }).message)
                : null) || response.statusText || "Request failed";
        throw new ApiError(message, response.status);
    }

    return (payload ?? ({} as T)) as T;
}

export const api = {
    get: <T = unknown>(path: string) =>
        apiFetch<T>(path, { method: "GET", cache: "no-store" }),
    post: <T = unknown>(path: string, body?: unknown) =>
        apiFetch<T>(path, { method: "POST", body }),
    patch: <T = unknown>(path: string, body?: unknown) =>
        apiFetch<T>(path, { method: "PATCH", body }),
    put: <T = unknown>(path: string, body?: unknown) =>
        apiFetch<T>(path, { method: "PUT", body }),
    delete: <T = unknown>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
