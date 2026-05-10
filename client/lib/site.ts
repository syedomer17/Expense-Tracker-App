function resolveSiteUrl(): string {
    const explicit =
        process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
    if (explicit) {
        return explicit.replace(/\/$/, "");
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return "http://localhost:3000";
}

export const siteConfig = {
    name: "Ledger",
    tagline: "Premium Expense Tracker",
    description:
        "Beautifully simple personal finance tracking. Capture income, watch expenses, set savings goals, and grow your savings rate — all in one calm, focused app.",
    author: "Syed Omer Ali",
    twitterHandle: "@syedomer",
    url: resolveSiteUrl(),
} as const;

export type SiteConfig = typeof siteConfig;
