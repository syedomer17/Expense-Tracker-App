import Link from "next/link";
import {
    ArrowRight,
    BarChart3,
    Download,
    PiggyBank,
    ShieldCheck,
    Sparkles,
    Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
    {
        icon: BarChart3,
        title: "Beautiful insights",
        body: "Stacked area charts, top-category breakdowns, and a savings rate that updates as you go.",
    },
    {
        icon: PiggyBank,
        title: "Built around savings",
        body: "Every interaction is designed to nudge your savings rate up — calmly, never noisily.",
    },
    {
        icon: Download,
        title: "Export to Excel",
        body: "Need a record? One click downloads a clean .xlsx with the filters you applied.",
    },
    {
        icon: ShieldCheck,
        title: "Yours alone",
        body: "Auth-gated APIs, hashed passwords, OTP-based recovery. No tracking, no sharing.",
    },
];

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
                            <Sparkles className="size-4" />
                        </div>
                        <span className="text-sm font-semibold tracking-tight">Ledger</span>
                    </Link>
                    <nav className="flex items-center gap-1">
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/login">Sign in</Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/register">Get started</Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <section className="relative overflow-hidden border-b border-border/60">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"
                    >
                        <div className="absolute -top-32 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-rose-500/20 blur-3xl" />
                    </div>

                    <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
                        <Badge
                            variant="secondary"
                            className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium"
                        >
                            <Sparkles className="size-3" />
                            Premium expense tracker
                        </Badge>
                        <h1 className="mt-5 max-w-3xl font-display text-5xl font-normal leading-[1.05] sm:text-6xl md:text-7xl">
                            Quiet, confident control over{" "}
                            <em className="not-italic bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 bg-clip-text text-transparent">
                                your money.
                            </em>
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                            Track income, watch expenses, and grow your savings rate — all in one
                            beautifully simple app.
                        </p>
                        <div className="mt-7 flex flex-col items-center gap-2 sm:flex-row">
                            <Button asChild size="lg" className="h-11 px-5">
                                <Link href="/register">
                                    Get started free <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-11 px-5">
                                <Link href="/login">I already have an account</Link>
                            </Button>
                        </div>

                        <div className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { label: "Avg. savings rate", value: "23%" },
                                { label: "Categories", value: "Unlimited" },
                                { label: "Export", value: "Excel" },
                                { label: "Setup", value: "<1 min" },
                            ].map((s) => (
                                <Card key={s.label} className="border-border/60">
                                    <CardContent className="p-4 text-left">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                            {s.label}
                                        </p>
                                        <p className="mt-1 text-lg font-semibold tracking-tight">
                                            {s.value}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
                    <div className="mb-10 max-w-2xl">
                        <h2 className="font-display text-3xl font-normal leading-tight sm:text-4xl">
                            Everything you need to know about your money — nothing you don&apos;t.
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            Each feature is built to surface what matters and stay out of your way
                            otherwise.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map((f) => {
                            const Icon = f.icon;
                            return (
                                <Card key={f.title} className="border-border/60">
                                    <CardContent className="space-y-3 p-5">
                                        <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground">
                                            <Icon className="size-4" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-semibold">{f.title}</h3>
                                            <p className="text-sm text-muted-foreground">{f.body}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                <section className="border-t border-border/60 bg-muted/30">
                    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                        <Card className="overflow-hidden border-border/60">
                            <div className="grid grid-cols-1 items-center gap-6 p-8 lg:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                                        <Wallet className="size-5" />
                                    </div>
                                    <h3 className="font-display text-3xl font-normal leading-tight sm:text-4xl">
                                        Start tracking in 60 seconds.
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Sign up, drop in your first expense, and watch the picture
                                        come together. No credit card required.
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <Button asChild size="lg">
                                            <Link href="/register">
                                                Create your account <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" size="lg">
                                            <Link href="/login">Sign in</Link>
                                        </Button>
                                    </div>
                                </div>
                                <div className="relative hidden lg:block">
                                    <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-500/15 via-fuchsia-500/15 to-rose-500/15 blur-2xl" />
                                    <Card className="relative border-border/60">
                                        <CardContent className="p-5">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                                        Savings rate
                                                    </p>
                                                    <Badge variant="secondary">Excellent</Badge>
                                                </div>
                                                <p className="text-3xl font-semibold tracking-tight tabular-nums">
                                                    24.6%
                                                </p>
                                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-violet-500"
                                                        style={{ width: "62%" }}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    +3.2% vs last month
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </Card>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border/60">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
                    <p>© {new Date().getFullYear()} Ledger. Crafted with care.</p>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="hover:text-foreground">
                            Sign in
                        </Link>
                        <span aria-hidden>·</span>
                        <Link href="/register" className="hover:text-foreground">
                            Sign up
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
