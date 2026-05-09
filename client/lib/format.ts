export function formatCurrency(value: number, currency = "USD"): string {
    if (!Number.isFinite(value)) return "—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(value);
}

export function formatCompact(value: number): string {
    if (!Number.isFinite(value)) return "—";
    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}

export function formatDate(value: string | Date): string {
    const d = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatDateInput(value: string | Date): string {
    const d = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split("-");
    if (!year || !month) return monthKey;
    const d = new Date(Number(year), Number(month) - 1, 1);
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function formatPercent(value: number | null): string {
    if (value === null || !Number.isFinite(value)) return "—";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
}

export function initials(name: string | null | undefined): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}
