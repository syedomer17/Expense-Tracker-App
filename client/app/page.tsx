import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    Check,
    Download,
    FileSpreadsheet,
    LineChart,
    Lock,
    PiggyBank,
    Sparkles,
    Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
    title: {
        absolute: `${siteConfig.name} — ${siteConfig.tagline}`,
    },
    description: siteConfig.description,
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        url: "/",
        title: `${siteConfig.name} — ${siteConfig.tagline}`,
        description: siteConfig.description,
    },
    twitter: {
        card: "summary_large_image",
        title: `${siteConfig.name} — ${siteConfig.tagline}`,
        description: siteConfig.description,
    },
};

const FEATURES = [
    {
        icon: LineChart,
        title: "Calm, useful charts",
        body: "Stacked area trends and clean category breakdowns. No gimmicks — just the numbers you actually look at.",
    },
    {
        icon: Target,
        title: "Goals that nudge, never nag",
        body: "Set a savings target, watch progress quietly accrue, get a single email the moment you hit it.",
    },
    {
        icon: FileSpreadsheet,
        title: "Excel export, one click",
        body: "Need a record for taxes or a partner? Download a clean .xlsx that respects your filters.",
    },
    {
        icon: Lock,
        title: "Yours alone",
        body: "Hashed passwords, OTP recovery, auth-gated APIs. No tracking pixels. No sharing. No dark patterns.",
    },
];

const STEPS = [
    {
        n: "01",
        title: "Capture in seconds",
        body: "Add an expense or income with a category, amount, and a quick note. The keyboard works the way you expect.",
    },
    {
        n: "02",
        title: "Watch the picture form",
        body: "Trends, top categories, and your savings rate update live. The dashboard stays calm — even when your month doesn't.",
    },
    {
        n: "03",
        title: "Hit your goals",
        body: "Pick a savings target, fund a wishlist item, or set a monthly cap. Get notified when something matters.",
    },
];

const FAQ = [
    {
        q: "Is my data private?",
        a: "Your records are scoped to your account. Passwords are bcrypt-hashed, sessions are httpOnly, and APIs are auth-gated. There are no third-party trackers.",
    },
    {
        q: "Do I need to install anything?",
        a: "No. Ledger runs in any modern browser. You can also install it as a PWA on your phone for one-tap access.",
    },
    {
        q: "Can I export my data?",
        a: "Yes. Both expenses and incomes export to .xlsx with the same filters you have applied on screen.",
    },
    {
        q: "How much does it cost?",
        a: "Ledger is free while in beta. We will never sell your data, and any future paid tier will be optional.",
    },
];

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <SiteHeader />

            <main className="flex-1">
                <Hero />
                <TrustBand />
                <ProductPreview />
                <Features />
                <HowItWorks />
                <Faq />
                <FinalCta />
            </main>

            <SiteFooter />
        </div>
    );
}

function SiteHeader() {
    return (
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link
                    href="/"
                    className="font-display text-lg font-medium tracking-tight"
                >
                    {siteConfig.name}
                </Link>

                <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
                    <Link href="#features" className="transition-colors hover:text-foreground">
                        Features
                    </Link>
                    <Link href="#how" className="transition-colors hover:text-foreground">
                        How it works
                    </Link>
                    <Link href="#faq" className="transition-colors hover:text-foreground">
                        FAQ
                    </Link>
                </nav>

                <div className="flex items-center gap-1.5">
                    <Button asChild variant="ghost" size="sm" className="h-8">
                        <Link href="/login">Sign in</Link>
                    </Button>
                    <Button asChild size="sm" className="h-8">
                        <Link href="/register">
                            Get started <ArrowRight className="size-3.5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}

function Hero() {
    return (
        <section className="relative overflow-hidden border-b border-border/60">
            <GridBackdrop />

            <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-20">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground shadow-[0_1px_0_0_oklch(1_0_0_/_0.6)_inset]">
                    <span className="relative flex size-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="font-medium text-foreground">In beta</span>
                    <span aria-hidden>·</span>
                    <span>Free while we&apos;re building</span>
                </div>

                <h1 className="font-display mt-6 max-w-3xl text-5xl font-normal leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
                    A quieter way to{" "}
                    <em className="not-italic font-display italic text-muted-foreground">
                        understand
                    </em>{" "}
                    your money.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Ledger is a calm, focused expense tracker. Capture income and expenses,
                    watch your savings rate climb, and hit your goals — without the noise.
                </p>

                <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row">
                    <Button asChild size="lg" className="h-11 px-5">
                        <Link href="/register">
                            Get started — it&apos;s free <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-11 px-5">
                        <Link href="/login">I have an account</Link>
                    </Button>
                </div>

                <p className="mt-5 text-xs text-muted-foreground">
                    No credit card. No tracking pixels. Sign in with email, Google, or GitHub.
                </p>
            </div>
        </section>
    );
}

function TrustBand() {
    const stats = [
        { label: "Avg. savings rate", value: "23.4%", trend: "+3.2% MoM" },
        { label: "Median setup", value: "47s", trend: "First entry" },
        { label: "Categories", value: "Unlimited", trend: "Custom + presets" },
        { label: "Export", value: "Excel", trend: "Filtered .xlsx" },
    ];
    return (
        <section
            aria-label="At a glance"
            className="border-b border-border/60 bg-muted/30"
        >
            <div className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-y divide-border/60 px-4 sm:grid-cols-4 sm:divide-x sm:divide-y-0 sm:px-6">
                {stats.map((s, i) => (
                    <div
                        key={s.label}
                        className={`flex flex-col gap-1 py-6 ${i % 2 === 1 ? "border-l border-border/60 sm:border-l-0" : ""} ${i >= 2 ? "border-t border-border/60 sm:border-t-0" : ""} sm:px-6`}
                    >
                        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            {s.label}
                        </p>
                        <p className="font-display text-2xl font-normal tracking-tight tabular-nums sm:text-3xl">
                            {s.value}
                        </p>
                        <p className="text-xs text-muted-foreground">{s.trend}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function ProductPreview() {
    return (
        <section className="border-b border-border/60">
            <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
                <div className="mb-10 max-w-2xl">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Product
                    </p>
                    <h2 className="font-display mt-2 text-3xl font-normal leading-tight tracking-tight sm:text-4xl">
                        Built around the numbers you actually check.
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        A live snapshot of your finances. Nothing more, nothing less.
                    </p>
                </div>

                <div className="relative">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -inset-x-8 -bottom-8 -top-4 -z-10 rounded-[2rem] bg-gradient-to-b from-transparent via-muted/40 to-transparent"
                    />
                    <DashboardMockup />
                </div>
            </div>
        </section>
    );
}

function DashboardMockup() {
    return (
        <Card className="overflow-hidden border-border/70 bg-background/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex size-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <div className="flex size-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <div className="flex size-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                </div>
                <div className="rounded-md border border-border/60 bg-muted/50 px-2 py-1 text-[11px] text-muted-foreground tabular-nums">
                    ledger.app/dashboard
                </div>
                <div className="w-12" />
            </div>

            <div className="grid grid-cols-1 gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="hidden border-r border-border/60 p-4 lg:block">
                    <div className="px-2 py-2 font-display text-base font-medium tracking-tight">
                        {siteConfig.name}
                    </div>
                    <Separator className="my-3" />
                    <nav className="space-y-1 text-sm">
                        {[
                            { label: "Dashboard", icon: BarChart3, active: true },
                            { label: "Expenses", icon: ArrowUpRight },
                            { label: "Income", icon: ArrowDownRight },
                            { label: "Goals", icon: Target },
                            { label: "Wishlist", icon: PiggyBank },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.label}
                                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 ${item.active
                                        ? "bg-foreground/[0.04] text-foreground dark:bg-foreground/[0.06]"
                                        : "text-muted-foreground"
                                        }`}
                                >
                                    <Icon className="size-3.5" />
                                    <span>{item.label}</span>
                                </div>
                            );
                        })}
                    </nav>
                </aside>

                <div className="space-y-5 p-5 sm:p-6">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                This month
                            </p>
                            <h3 className="font-display mt-1 text-2xl font-normal tracking-tight">
                                Hello, Alex.
                            </h3>
                        </div>
                        <div className="flex gap-1">
                            {(["W", "M", "Q", "Y"] as const).map((r, i) => (
                                <div
                                    key={r}
                                    className={`rounded-md border px-2.5 py-1 text-xs ${i === 1
                                        ? "border-foreground/80 bg-foreground text-background"
                                        : "border-border/60 text-muted-foreground"
                                        }`}
                                >
                                    {r}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <StatTile
                            label="Income"
                            value="$8,420.00"
                            delta="+4.1%"
                            tone="positive"
                        />
                        <StatTile
                            label="Expenses"
                            value="$6,348.20"
                            delta="−2.0%"
                            tone="neutral"
                        />
                        <StatTile
                            label="Savings rate"
                            value="24.6%"
                            delta="+3.2%"
                            tone="accent"
                        />
                    </div>

                    <Card className="border-border/60">
                        <CardContent className="p-5">
                            <div className="mb-3 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        Net flow · last 12 weeks
                                    </p>
                                    <p className="font-display mt-1 text-xl font-normal tracking-tight tabular-nums">
                                        +$1,872
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                    <LegendDot className="bg-foreground" /> Income
                                    <LegendDot className="bg-zinc-300 dark:bg-zinc-700" /> Expense
                                </div>
                            </div>
                            <NetFlowChart />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Card className="border-border/60">
                            <CardContent className="p-5">
                                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                    Top categories
                                </p>
                                <ul className="mt-3 space-y-2.5">
                                    {[
                                        { name: "Rent", amount: "$1,950", pct: 78 },
                                        { name: "Groceries", amount: "$612", pct: 38 },
                                        { name: "Transit", amount: "$184", pct: 22 },
                                        { name: "Subscriptions", amount: "$98", pct: 14 },
                                    ].map((c) => (
                                        <li key={c.name} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-foreground">{c.name}</span>
                                                <span className="text-muted-foreground tabular-nums">
                                                    {c.amount}
                                                </span>
                                            </div>
                                            <div className="h-1 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-foreground/85"
                                                    style={{ width: `${c.pct}%` }}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60">
                            <CardContent className="p-5">
                                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                    Goal · Emergency fund
                                </p>
                                <p className="font-display mt-1 text-xl font-normal tracking-tight tabular-nums">
                                    $4,920{" "}
                                    <span className="text-sm text-muted-foreground">
                                        / $6,000
                                    </span>
                                </p>
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-emerald-500/90"
                                        style={{ width: "82%" }}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    On track to hit by July 14.
                                </p>

                                <Separator className="my-4" />

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            This week
                                        </span>
                                        <span className="tabular-nums text-emerald-600 dark:text-emerald-500">
                                            +$214
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            30-day pace
                                        </span>
                                        <span className="tabular-nums">$924 / mo</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function StatTile({
    label,
    value,
    delta,
    tone,
}: {
    label: string;
    value: string;
    delta: string;
    tone: "positive" | "neutral" | "accent";
}) {
    const deltaClass =
        tone === "positive"
            ? "text-emerald-600 dark:text-emerald-500"
            : tone === "accent"
                ? "text-foreground"
                : "text-muted-foreground";
    return (
        <Card className="border-border/60">
            <CardContent className="space-y-1.5 p-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                </p>
                <p className="font-display text-2xl font-normal tracking-tight tabular-nums">
                    {value}
                </p>
                <p className={`text-xs tabular-nums ${deltaClass}`}>
                    {delta} vs last period
                </p>
            </CardContent>
        </Card>
    );
}

function NetFlowChart() {
    const income = [42, 38, 45, 51, 48, 55, 60, 58, 62, 65, 70, 68];
    const expense = [30, 28, 35, 33, 38, 40, 42, 41, 44, 43, 46, 48];
    const max = 80;
    const w = 600;
    const h = 110;
    const step = w / (income.length - 1);

    const toPath = (data: number[]) =>
        data
            .map((v, i) => {
                const x = i * step;
                const y = h - (v / max) * h;
                return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");

    const toArea = (data: number[]) =>
        `${toPath(data)} L${w},${h} L0,${h} Z`;

    return (
        <svg
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
            className="block h-28 w-full"
        >
            <defs>
                <linearGradient id="nf-income" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="nf-expense" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.07" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
            </defs>
            <g className="text-foreground">
                <path d={toArea(income)} fill="url(#nf-income)" />
                <path
                    d={toPath(income)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </g>
            <g className="text-muted-foreground">
                <path d={toArea(expense)} fill="url(#nf-expense)" />
                <path
                    d={toPath(expense)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeDasharray="3 3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </g>
        </svg>
    );
}

function LegendDot({ className }: { className: string }) {
    return <span className={`inline-block size-1.5 rounded-full ${className}`} />;
}

function Features() {
    return (
        <section
            id="features"
            aria-label="Features"
            className="border-b border-border/60"
        >
            <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
                <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            Why Ledger
                        </p>
                        <h2 className="font-display mt-2 text-3xl font-normal leading-tight tracking-tight sm:text-4xl">
                            Everything that matters. Nothing that doesn&apos;t.
                        </h2>
                    </div>
                    <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                        Designed to surface what&apos;s useful and stay quietly out of the way
                        when it isn&apos;t.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map((f) => {
                        const Icon = f.icon;
                        return (
                            <div
                                key={f.title}
                                className="flex flex-col gap-3 bg-background p-6"
                            >
                                <div className="flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-foreground">
                                    <Icon className="size-4" />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-sm font-semibold tracking-tight">
                                        {f.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {f.body}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                        {
                            icon: Sparkles,
                            label: "Light & dark themes",
                            body: "Every surface respects your system preference.",
                        },
                        {
                            icon: Download,
                            label: "Email digests",
                            body: "Daily, weekly, monthly — opt in to what you want.",
                        },
                        {
                            icon: Check,
                            label: "Keyboard-first",
                            body: "Add, filter, and navigate without leaving home row.",
                        },
                    ].map((p) => {
                        const Icon = p.icon;
                        return (
                            <div
                                key={p.label}
                                className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-4"
                            >
                                <Icon className="mt-0.5 size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">{p.label}</p>
                                    <p className="text-xs text-muted-foreground">{p.body}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function HowItWorks() {
    return (
        <section
            id="how"
            aria-label="How it works"
            className="border-b border-border/60 bg-muted/30"
        >
            <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
                <div className="mb-12 max-w-2xl">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        How it works
                    </p>
                    <h2 className="font-display mt-2 text-3xl font-normal leading-tight tracking-tight sm:text-4xl">
                        Three steps. About a minute.
                    </h2>
                </div>

                <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 md:grid-cols-3">
                    {STEPS.map((s) => (
                        <li
                            key={s.n}
                            className="flex flex-col gap-3 bg-background p-7"
                        >
                            <span className="font-mono text-xs font-medium text-muted-foreground">
                                {s.n}
                            </span>
                            <h3 className="font-display text-xl font-normal tracking-tight">
                                {s.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {s.body}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

function Faq() {
    return (
        <section
            id="faq"
            aria-label="Frequently asked questions"
            className="border-b border-border/60"
        >
            <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
                <div className="mb-10 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Frequently asked
                    </p>
                    <h2 className="font-display mt-2 text-3xl font-normal leading-tight tracking-tight sm:text-4xl">
                        Short answers to fair questions.
                    </h2>
                </div>

                <dl className="divide-y divide-border/60 rounded-xl border border-border/60 bg-background">
                    {FAQ.map((item) => (
                        <details
                            key={item.q}
                            className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                                <dt>{item.q}</dt>
                                <span
                                    aria-hidden
                                    className="grid size-6 place-items-center rounded-full border border-border/60 text-muted-foreground transition-transform group-open:rotate-45"
                                >
                                    +
                                </span>
                            </summary>
                            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {item.a}
                            </dd>
                        </details>
                    ))}
                </dl>
            </div>
        </section>
    );
}

function FinalCta() {
    return (
        <section className="border-b border-border/60">
            <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
                <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-foreground px-8 py-14 text-background sm:px-12 sm:py-16">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-[0.06]"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                            backgroundSize: "22px 22px",
                            color: "white",
                        }}
                    />
                    <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
                        <div className="space-y-4">
                            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-background/60">
                                Start today
                            </p>
                            <h2 className="font-display max-w-xl text-3xl font-normal leading-[1.1] tracking-tight sm:text-4xl">
                                Take quiet, confident control of your money.
                            </h2>
                            <p className="max-w-md text-sm leading-relaxed text-background/70">
                                Sign up, drop in your first expense, and watch the picture come
                                together. Free while in beta.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                asChild
                                size="lg"
                                variant="secondary"
                                className="h-11 bg-background px-5 text-foreground hover:bg-background/90"
                            >
                                <Link href="/register">
                                    Create your account <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-11 border-background/20 bg-transparent px-5 text-background hover:bg-background/10 hover:text-background"
                            >
                                <Link href="/login">Sign in</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SiteFooter() {
    return (
        <footer>
            <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
                <div className="flex items-center gap-3">
                    <span className="font-display text-sm font-medium tracking-tight text-foreground">
                        {siteConfig.name}
                    </span>
                    <span>© {new Date().getFullYear()}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    <Link href="#features" className="hover:text-foreground">
                        Features
                    </Link>
                    <Link href="#how" className="hover:text-foreground">
                        How it works
                    </Link>
                    <Link href="#faq" className="hover:text-foreground">
                        FAQ
                    </Link>
                    <Link href="/login" className="hover:text-foreground">
                        Sign in
                    </Link>
                    <Link href="/register" className="hover:text-foreground">
                        Sign up
                    </Link>
                </div>
            </div>
        </footer>
    );
}

function GridBackdrop() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        >
            <div
                className="absolute inset-0 opacity-[0.5] dark:opacity-[0.25]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, oklch(0 0 0 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, oklch(0 0 0 / 0.06) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                }}
            />
        </div>
    );
}

