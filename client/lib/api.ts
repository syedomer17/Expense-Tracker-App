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
};

export async function apiFetch<T = unknown>(
    path: string,
    options: FetchOptions = {}
): Promise<T> {
    const { body, headers, json = true, ...rest } = options;
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

    const response = await fetch(path, init);
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
