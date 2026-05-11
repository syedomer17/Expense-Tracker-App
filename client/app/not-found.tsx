import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
    title: "Page not found",
    description:
        "The page you are looking for has moved, been renamed, or never existed.",
    robots: { index: false, follow: false },
};

const SUGGESTIONS = [
    { href: "/dashboard", label: "Dashboard", hint: "Your monthly snapshot" },
    { href: "/expense", label: "Expenses", hint: "Capture an outflow" },
    { href: "/income", label: "Income", hint: "Log a paycheck or gig" },
    { href: "/goals", label: "Goals", hint: "Track a savings target" },
];

export default function NotFound() {
    return (
        <div className="relative flex min-h-[100dvh] flex-col bg-background text-foreground">
            <GridBackdrop />

            <header className="relative z-10 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
                    <Link
                        href="/"
                        className="font-display text-lg font-medium tracking-tight"
                    >
                        {siteConfig.name}
                    </Link>
                    <nav className="flex items-center gap-1.5">
                        <Button asChild variant="ghost" size="sm" className="h-8">
                            <Link href="/login">Sign in</Link>
                        </Button>
                        <Button asChild size="sm" className="h-8">
                            <Link href="/dashboard">
                                Dashboard <ArrowRight className="size-3.5" />
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground shadow-[0_1px_0_0_oklch(1_0_0_/_0.6)_inset]">
                    <Compass className="size-3" aria-hidden />
                    <span>Error 404</span>
                    <span aria-hidden>·</span>
                    <span>Not found</span>
                </div>

                <h1
                    aria-label="404"
                    className="font-display mt-6 select-none text-[7rem] font-normal leading-none tracking-tighter tabular-nums sm:text-[10rem]"
                >
                    4
                    <em className="not-italic font-display italic text-muted-foreground">
                        0
                    </em>
                    4
                </h1>

                <h2 className="font-display mt-4 max-w-xl text-3xl font-normal leading-[1.1] tracking-tight sm:text-4xl">
                    This page{" "}
                    <em className="not-italic font-display italic text-muted-foreground">
                        slipped
                    </em>{" "}
                    through the ledger.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                    The link may be broken, the page may have moved, or it never
                    existed. No harm done &mdash; let&apos;s get you back on track.
                </p>

                <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row">
                    <Button asChild size="lg" className="h-11 px-5">
                        <Link href="/">
                            <ArrowLeft className="size-4" />
                            Back to home
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-11 px-5">
                        <Link href="/dashboard">
                            Open dashboard <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>

                <div className="mt-14 w-full max-w-2xl">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Try one of these instead
                    </p>
                    <ul className="mt-3 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-2">
                        {SUGGESTIONS.map((s) => (
                            <li key={s.href}>
                                <Link
                                    href={s.href}
                                    className="group flex items-center justify-between gap-4 bg-background px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground">
                                            {s.label}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {s.hint}
                                        </p>
                                    </div>
                                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>

            <footer className="relative z-10 border-t border-border/60 bg-background/60">
                <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:px-6">
                    <span>
                        &copy; {new Date().getFullYear()} {siteConfig.name}
                    </span>
                    <span>Status &middot; 404</span>
                </div>
            </footer>
        </div>
    );
}

function GridBackdrop() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"
        >
            <div
                className="absolute inset-0 opacity-[0.5] dark:opacity-[0.22]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, oklch(0 0 0 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, oklch(0 0 0 / 0.06) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                }}
            />
            <div
                className="absolute inset-0 hidden opacity-[0.18] dark:block"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, oklch(1 0 0 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.08) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                }}
            />
        </div>
    );
}
