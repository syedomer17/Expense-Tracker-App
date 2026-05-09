import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Sparkles } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[1.05fr_1fr]">
            <div className="relative hidden overflow-hidden bg-zinc-950 p-10 text-zinc-100 lg:block">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                >
                    <div className="absolute -top-40 -left-20 size-[36rem] rounded-full bg-violet-600/30 blur-3xl" />
                    <div className="absolute bottom-[-10rem] right-[-6rem] size-[34rem] rounded-full bg-fuchsia-500/20 blur-3xl" />
                    <div
                        className="absolute inset-0 opacity-[0.05]"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)",
                            backgroundSize: "24px 24px",
                        }}
                    />
                </div>

                <div className="relative flex h-full flex-col">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/10">
                            <Sparkles className="size-4" />
                        </div>
                        <div className="leading-tight">
                            <div className="text-sm font-semibold tracking-tight">Ledger</div>
                            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                                Premium tracker
                            </div>
                        </div>
                    </Link>

                    <div className="mt-auto space-y-8">
                        <div className="space-y-4">
                            <h2 className="font-display max-w-md text-4xl font-normal leading-[1.1] sm:text-5xl">
                                Quiet, confident control over{" "}
                                <em className="not-italic bg-gradient-to-br from-violet-300 via-fuchsia-300 to-rose-200 bg-clip-text text-transparent">
                                    your money.
                                </em>
                            </h2>
                            <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
                                Capture every income and expense. Watch your savings rate climb.
                                No spreadsheets, no clutter — just clarity.
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-violet-500/15 via-fuchsia-500/15 to-rose-500/15 blur-2xl" />
                            <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                                        Savings rate
                                    </p>
                                    <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                                        Excellent
                                    </span>
                                </div>
                                <p className="mt-2 font-display text-4xl font-normal tabular-nums">
                                    24.6%
                                </p>
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-violet-400 to-fuchsia-400"
                                        style={{ width: "62%" }}
                                    />
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                                        <div className="flex items-center gap-1.5 text-emerald-300">
                                            <ArrowDownLeft className="size-3" />
                                            <span className="text-[10px] uppercase tracking-wider">
                                                In
                                            </span>
                                        </div>
                                        <p className="mt-1 font-mono tabular-nums text-zinc-100">
                                            $8,420
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                                        <div className="flex items-center gap-1.5 text-rose-300">
                                            <ArrowUpRight className="size-3" />
                                            <span className="text-[10px] uppercase tracking-wider">
                                                Out
                                            </span>
                                        </div>
                                        <p className="mt-1 font-mono tabular-nums text-zinc-100">
                                            $6,348
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center bg-background p-6 sm:p-10">
                <div className="w-full max-w-sm">{children}</div>
            </div>
        </div>
    );
}
