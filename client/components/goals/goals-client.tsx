"use client";

import * as React from "react";
import { FilterX, Flame, Loader2, Mail, Target } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { api, ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type HistoryCount = 6 | 12 | 24;
type HistoryStatus = "all" | "hit" | "missed";

const HISTORY_COUNT_OPTIONS: { id: HistoryCount; label: string }[] = [
    { id: 6, label: "6" },
    { id: 12, label: "12" },
    { id: 24, label: "24" },
];

const HISTORY_STATUS_OPTIONS: { id: HistoryStatus; label: string }[] = [
    { id: "all", label: "All" },
    { id: "hit", label: "Hit" },
    { id: "missed", label: "Missed" },
];

interface ProgressSummary {
    window: { period: "day" | "week" | "month"; start: string; end: string; label: string };
    totals: { income: number; expense: number; savings: number };
    target: number;
    percent: number | null;
    pace: "ahead" | "on-track" | "behind" | "no-target";
    paceDelta: number;
    daysElapsed: number;
    daysTotal: number;
}

interface ProgressResponse {
    week: ProgressSummary;
    month: ProgressSummary;
    today: ProgressSummary;
    streaks: { week: number; month: number };
    history: {
        week: Array<{ key: string; label: string; savings: number; target: number; hit: boolean }>;
        month: Array<{ key: string; label: string; savings: number; target: number; hit: boolean }>;
    };
}

interface GoalSettings {
    weeklyTarget: number;
    monthlyTarget: number;
    email: { daily: boolean; weekly: boolean; monthly: boolean };
}

export function GoalsClient() {
    const [settings, setSettings] = React.useState<GoalSettings | null>(null);
    const [progress, setProgress] = React.useState<ProgressResponse | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [historyLoading, setHistoryLoading] = React.useState(false);
    const [savingTargets, setSavingTargets] = React.useState(false);
    const [weeklyInput, setWeeklyInput] = React.useState("");
    const [monthlyInput, setMonthlyInput] = React.useState("");

    const [historyCount, setHistoryCount] = React.useState<HistoryCount>(6);
    const [historyStatus, setHistoryStatus] = React.useState<HistoryStatus>("all");
    const filtersDirty = historyCount !== 6 || historyStatus !== "all";

    const fetchProgress = React.useCallback(
        async (count: HistoryCount, opts: { background?: boolean } = {}) => {
            if (opts.background) setHistoryLoading(true);
            try {
                const p = await api.get<ProgressResponse>(
                    `/api/goals/progress?historyCount=${count}`
                );
                setProgress(p);
            } catch (err) {
                if (err instanceof ApiError) toast.error(err.message);
                else toast.error("Could not load progress");
            } finally {
                if (opts.background) setHistoryLoading(false);
            }
        },
        []
    );

    const refresh = React.useCallback(async () => {
        try {
            const [s, p] = await Promise.all([
                api.get<{ goal: GoalSettings }>("/api/goals"),
                api.get<ProgressResponse>(`/api/goals/progress?historyCount=${historyCount}`),
            ]);
            setSettings(s.goal);
            setProgress(p);
            setWeeklyInput(String(s.goal.weeklyTarget || ""));
            setMonthlyInput(String(s.goal.monthlyTarget || ""));
        } catch (err) {
            if (err instanceof ApiError) toast.error(err.message);
            else toast.error("Could not load goals");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        refresh();
    }, [refresh]);

    React.useEffect(() => {
        if (loading) return;
        fetchProgress(historyCount, { background: true });
    }, [historyCount, loading, fetchProgress]);

    function clearFilters() {
        setHistoryCount(6);
        setHistoryStatus("all");
    }

    const targetsDirty = settings
        ? Number(weeklyInput || 0) !== settings.weeklyTarget ||
          Number(monthlyInput || 0) !== settings.monthlyTarget
        : false;

    async function saveTargets(e: React.FormEvent) {
        e.preventDefault();
        const w = Number(weeklyInput || 0);
        const m = Number(monthlyInput || 0);
        if (!Number.isFinite(w) || w < 0 || !Number.isFinite(m) || m < 0) {
            toast.error("Enter valid non-negative numbers");
            return;
        }
        setSavingTargets(true);
        try {
            const res = await api.put<{ goal: GoalSettings }>("/api/goals", {
                weeklyTarget: w,
                monthlyTarget: m,
            });
            setSettings(res.goal);
            toast.success("Targets saved");
            await fetchProgress(historyCount);
        } catch (err) {
            if (err instanceof ApiError) toast.error(err.message);
            else toast.error("Could not save");
        } finally {
            setSavingTargets(false);
        }
    }

    async function toggleEmail(key: "daily" | "weekly" | "monthly", value: boolean) {
        if (!settings) return;
        const previous = settings.email[key];
        setSettings({ ...settings, email: { ...settings.email, [key]: value } });
        try {
            await api.put("/api/goals", { email: { [key]: value } });
        } catch (err) {
            setSettings((s) =>
                s ? { ...s, email: { ...s.email, [key]: previous } } : s
            );
            toast.error(err instanceof ApiError ? err.message : "Could not update");
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                eyebrow="Savings"
                title="Goals"
                description="Set weekly and monthly savings targets. We'll email you a recap so you stay on pace."
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ProgressCard
                    label="This week"
                    progress={progress?.week}
                    streak={progress?.streaks.week}
                    loading={loading}
                />
                <ProgressCard
                    label="This month"
                    progress={progress?.month}
                    streak={progress?.streaks.month}
                    loading={loading}
                />
            </div>

            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                        <Target className="size-4" /> Set your targets
                    </CardTitle>
                    <CardDescription>
                        Savings is calculated as income minus expenses for the period.
                    </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <form
                        onSubmit={saveTargets}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                    >
                        <div className="space-y-1.5">
                            <Label htmlFor="weeklyTarget">Weekly target</Label>
                            <Input
                                id="weeklyTarget"
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="1"
                                value={weeklyInput}
                                onChange={(e) => setWeeklyInput(e.target.value)}
                                placeholder="0"
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="monthlyTarget">Monthly target</Label>
                            <Input
                                id="monthlyTarget"
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="1"
                                value={monthlyInput}
                                onChange={(e) => setMonthlyInput(e.target.value)}
                                placeholder="0"
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" disabled={!targetsDirty || savingTargets}>
                            {savingTargets ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : null}
                            {savingTargets ? "Saving…" : "Save targets"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                        <Mail className="size-4" /> Email digests
                    </CardTitle>
                    <CardDescription>
                        Get progress recaps in your inbox. We pick a tone, not a tone deafness.
                    </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <div className="space-y-3">
                        <EmailToggle
                            label="Weekly digest"
                            hint="Every Monday — last week's savings, pace, and streak."
                            checked={settings?.email.weekly ?? false}
                            disabled={loading}
                            onChange={(v) => toggleEmail("weekly", v)}
                        />
                        <EmailToggle
                            label="Monthly recap"
                            hint="On the 1st — a calmer summary of the month behind you."
                            checked={settings?.email.monthly ?? false}
                            disabled={loading}
                            onChange={(v) => toggleEmail("monthly", v)}
                        />
                        <EmailToggle
                            label="Daily nudge"
                            hint="A short morning prompt with week-to-date pace. Off by default."
                            checked={settings?.email.daily ?? false}
                            disabled={loading}
                            onChange={(v) => toggleEmail("daily", v)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/60">
                <CardHeader className="gap-3">
                    <div className="flex flex-col gap-1">
                        <CardTitle className="text-base font-medium">
                            History · last {historyCount} periods
                        </CardTitle>
                        <CardDescription>
                            Showing {progress?.history.week?.length ?? 0} weekly and{" "}
                            {progress?.history.month?.length ?? 0} monthly rows. Filled
                            bars hit the target.
                            {filtersDirty ? " · filters applied" : ""}
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Periods</p>
                            <SegmentedToggle
                                options={HISTORY_COUNT_OPTIONS}
                                value={historyCount}
                                onChange={setHistoryCount}
                            />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Status</p>
                            <SegmentedToggle
                                options={HISTORY_STATUS_OPTIONS}
                                value={historyStatus}
                                onChange={setHistoryStatus}
                            />
                        </div>
                        {filtersDirty ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-muted-foreground"
                            >
                                <FilterX className="size-3.5" /> Clear filters
                            </Button>
                        ) : null}
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
                    <HistoryBars
                        label="Weekly"
                        rows={progress?.history.week}
                        status={historyStatus}
                        loading={loading || historyLoading}
                    />
                    <HistoryBars
                        label="Monthly"
                        rows={progress?.history.month}
                        status={historyStatus}
                        loading={loading || historyLoading}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

function ProgressCard({
    label,
    progress,
    streak,
    loading,
}: {
    label: string;
    progress?: ProgressSummary;
    streak?: number;
    loading: boolean;
}) {
    if (loading || !progress) {
        return (
            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {label}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-40" />
                </CardContent>
            </Card>
        );
    }

    const pct = progress.percent ?? 0;
    const display = Math.max(0, Math.min(100, pct));
    const paceLabel =
        progress.pace === "no-target"
            ? "Set a target to see pace"
            : progress.pace === "ahead"
                ? `Goal hit · ${formatCurrency(progress.totals.savings - progress.target)} over`
                : progress.pace === "on-track"
                    ? `On track · ${formatCurrency(Math.abs(progress.paceDelta))} ahead of pace`
                    : `Behind pace by ${formatCurrency(Math.abs(progress.paceDelta))}`;
    const paceTone =
        progress.pace === "ahead"
            ? "text-emerald-600 dark:text-emerald-500"
            : progress.pace === "on-track"
                ? "text-foreground"
                : progress.pace === "behind"
                    ? "text-amber-600 dark:text-amber-500"
                    : "text-muted-foreground";

    return (
        <Card className="border-border/60">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {label}
                    </CardTitle>
                    {streak && streak > 1 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-500">
                            <Flame className="size-3" /> {streak} streak
                        </span>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display text-3xl font-normal tabular-nums">
                        {formatCurrency(progress.totals.savings)}
                    </p>
                    {progress.target > 0 ? (
                        <p className="text-sm text-muted-foreground tabular-nums">
                            of {formatCurrency(progress.target)}
                        </p>
                    ) : null}
                </div>
                <Progress value={display} />
                <p className={`text-sm ${paceTone}`}>{paceLabel}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                    Income {formatCurrency(progress.totals.income)} · Expenses{" "}
                    {formatCurrency(progress.totals.expense)}
                </p>
            </CardContent>
        </Card>
    );
}

function EmailToggle({
    label,
    hint,
    checked,
    disabled,
    onChange,
}: {
    label: string;
    hint: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-3 transition hover:bg-muted/40">
            <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={(v) => onChange(!!v)}
                className="mt-0.5"
            />
            <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium leading-tight">{label}</p>
                <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
        </label>
    );
}

function SegmentedToggle<T extends string | number>({
    options,
    value,
    onChange,
}: {
    options: { id: T; label: string }[];
    value: T;
    onChange: (next: T) => void;
}) {
    return (
        <div className="inline-flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
            {options.map((opt) => {
                const active = value === opt.id;
                return (
                    <button
                        key={String(opt.id)}
                        type="button"
                        onClick={() => onChange(opt.id)}
                        aria-pressed={active}
                        className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-medium transition",
                            active
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

function HistoryBars({
    label,
    rows,
    status,
    loading,
}: {
    label: string;
    rows?: Array<{ key: string; label: string; savings: number; target: number; hit: boolean }>;
    status: HistoryStatus;
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    const filtered =
        status === "all"
            ? rows ?? []
            : (rows ?? []).filter((r) => (status === "hit" ? r.hit : !r.hit));

    if (!filtered.length) {
        return (
            <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>
                <p className="text-sm text-muted-foreground">
                    {rows && rows.length
                        ? `No ${status === "hit" ? "wins" : "misses"} in this range.`
                        : "No history yet."}
                </p>
            </div>
        );
    }

    const fallbackMax = Math.max(
        ...filtered.map((r) => Math.max(r.savings, r.target)),
        1
    );

    return (
        <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label}
            </p>
            <ul className="space-y-2.5">
                {filtered.map((r) => {
                    const hasTarget = r.target > 0;
                    const ratio = hasTarget
                        ? r.savings / r.target
                        : r.savings / fallbackMax;
                    const widthPct = Math.max(
                        0,
                        Math.min(100, Math.round(ratio * 100))
                    );
                    const fillTone = r.hit
                        ? "bg-emerald-500"
                        : r.savings > 0
                            ? "bg-foreground/60"
                            : "bg-muted-foreground/20";
                    return (
                        <li key={r.key} className="space-y-1">
                            <div className="flex items-baseline justify-between gap-3 text-xs">
                                <span className="font-medium text-foreground">
                                    {r.label}
                                </span>
                                <span className="tabular-nums text-muted-foreground">
                                    {formatCurrency(r.savings)}
                                    {hasTarget
                                        ? ` / ${formatCurrency(r.target)}`
                                        : ""}
                                </span>
                            </div>
                            <div
                                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={hasTarget ? 100 : undefined}
                                aria-valuenow={hasTarget ? widthPct : undefined}
                                aria-label={`${r.label} savings progress`}
                            >
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all",
                                        fillTone
                                    )}
                                    style={{ width: `${widthPct}%` }}
                                />
                            </div>
                            {hasTarget ? (
                                <p
                                    className={cn(
                                        "text-[11px] tabular-nums",
                                        r.hit
                                            ? "text-emerald-600 dark:text-emerald-500"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {r.hit
                                        ? `Hit · ${widthPct}% of target`
                                        : `${widthPct}% of target`}
                                </p>
                            ) : (
                                <p className="text-[11px] text-muted-foreground">
                                    No target set
                                </p>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
