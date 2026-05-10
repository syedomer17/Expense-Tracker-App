import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Quote } from "lucide-react";
import { siteConfig } from "@/lib/site";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[1.05fr_1fr]">
            <aside className="relative hidden overflow-hidden bg-zinc-950 p-10 text-zinc-100 lg:flex lg:flex-col">
                <DotGridBackdrop />

                <div className="relative flex h-full flex-col">
                    <Link
                        href="/"
                        className="font-display text-xl font-medium tracking-tight"
                    >
                        {siteConfig.name}
                    </Link>

                    <div className="mt-auto space-y-8">
                        <div className="space-y-4">
                            <h2 className="font-display max-w-md text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
                                A quieter way to{" "}
                                <em className="not-italic font-display italic text-zinc-400">
                                    track
                                </em>{" "}
                                your money.
                            </h2>
                            <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
                                Capture every income and expense. Watch your savings rate climb.
                                No spreadsheets, no clutter — just clarity.
                            </p>
                        </div>

                        <DashboardPeek />

                        <figure className="flex max-w-md gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <Quote className="size-4 shrink-0 text-zinc-500" />
                            <blockquote className="space-y-2">
                                <p className="text-sm leading-relaxed text-zinc-200">
                                    &ldquo;The first money app I&apos;ve actually kept open.
                                    Calm, fast, and it gets out of the way.&rdquo;
                                </p>
                                <figcaption className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                                    Beta user · Two months in
                                </figcaption>
                            </blockquote>
                        </figure>
                    </div>

                    <div className="mt-10 flex items-center justify-between text-[11px] text-zinc-500">
                        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
                        <div className="flex items-center gap-4">
                            <Link href="/" className="hover:text-zinc-200">
                                Home
                            </Link>
                            <Link href="/login" className="hover:text-zinc-200">
                                Sign in
                            </Link>
                            <Link href="/register" className="hover:text-zinc-200">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="relative flex items-center justify-center bg-background p-6 sm:p-10">
                <Link
                    href="/"
                    className="absolute left-6 top-6 font-display text-base font-medium tracking-tight text-foreground sm:left-10 sm:top-10 lg:hidden"
                >
                    {siteConfig.name}
                </Link>
                <div className="w-full max-w-sm">{children}</div>
            </div>
        </div>
    );
}

function DotGridBackdrop() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        >
            <div
                className="absolute inset-0 opacity-[0.18]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)",
                    backgroundSize: "22px 22px",
                }}
            />
        </div>
    );
}

function DashboardPeek() {
    return (
        <div className="relative max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    Savings rate · this month
                </p>
                <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                    +3.2%
                </span>
            </div>
            <p className="font-display mt-2 text-4xl font-normal tracking-tight tabular-nums">
                24.6<span className="text-zinc-500">%</span>
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full rounded-full bg-emerald-400/90"
                    style={{ width: "62%" }}
                />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                        <ArrowDownRight className="size-3" />
                        <span className="font-mono text-[10px] uppercase tracking-wider">
                            In
                        </span>
                    </div>
                    <p className="mt-1 font-mono tabular-nums text-zinc-100">$8,420</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                        <ArrowUpRight className="size-3" />
                        <span className="font-mono text-[10px] uppercase tracking-wider">
                            Out
                        </span>
                    </div>
                    <p className="mt-1 font-mono tabular-nums text-zinc-100">$6,348</p>
                </div>
            </div>
        </div>
    );
}
