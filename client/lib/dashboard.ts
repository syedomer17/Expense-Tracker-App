import mongoose, { Types, type PipelineStage } from "mongoose";
import Income from "@/models/incomeModel";
import Expense from "@/models/expenseModel";
import {
    addDays,
    addMonths,
    buildBucketIdExpression,
    formatBucketKey,
    formatBucketLabel,
    rangeWindow,
    type BucketWindow,
    type DashboardRange,
} from "@/lib/bucketSeries";

export {
    DASHBOARD_RANGES,
    isDashboardRange,
    type DashboardRange,
} from "@/lib/bucketSeries";

const MONTHS_BACK = 12;
const TOP_CATEGORIES = 20;
const RECENT_LIMIT = 25;

export interface CategoryRow {
    category: string;
    total: number;
    count: number;
}

export interface MonthRow {
    month: string;
    income: number;
    expense: number;
    balance: number;
}

export interface BucketRow {
    /** ISO key for the bucket: YYYY-MM-DD (day/week start) or YYYY-MM (month) */
    key: string;
    /** Human label for the chart x-axis */
    label: string;
    income: number;
    expense: number;
    balance: number;
}

export interface RecentRow {
    id: string;
    type: "income" | "expense";
    description: string;
    amount: number;
    category: string;
    date: Date;
}

export type SavingsRateLabel =
    | "Excellent"
    | "Good"
    | "Needs improvement"
    | "Critical";

export interface DashboardSummary {
    totalBalance: number;
    totalBalanceMonthDelta: number;
    monthlyIncome: number;
    monthlyIncomeChangePct: number | null;
    monthlyExpense: number;
    monthlyExpenseChangePct: number | null;
    savingsRate: number;
    savingsRateLabel: SavingsRateLabel;
}

export interface DashboardResult {
    range: DashboardRange;
    summary: DashboardSummary;
    totals: {
        income: number;
        expense: number;
        balance: number;
        incomeCount: number;
        expenseCount: number;
    };
    currentMonth: {
        income: number;
        expense: number;
        balance: number;
        incomeCount: number;
        expenseCount: number;
    };
    previousMonth: {
        income: number;
        expense: number;
        balance: number;
    };
    byMonth: MonthRow[];
    byBucket: BucketRow[];
    topIncomeCategories: CategoryRow[];
    topExpenseCategories: CategoryRow[];
    recent: RecentRow[];
}

interface FacetTotals {
    total?: number;
    count?: number;
}

interface FacetCategory {
    _id: string | null;
    total: number;
    count: number;
}

interface FacetMonth {
    _id: { year: number; month: number };
    total: number;
}

interface FacetBucket {
    _id: string; // already a formatted key built in the pipeline
    total: number;
}

interface FacetResult {
    totals: FacetTotals[];
    currentMonth: FacetTotals[];
    previousMonth: FacetTotals[];
    byCategory: FacetCategory[];
    byMonth: FacetMonth[];
    byBucket: FacetBucket[];
}

interface RecentDoc {
    _id: Types.ObjectId;
    description: string;
    amount: number;
    category: string;
    date: Date;
}

function buildFacetPipeline(
    twelveMonthsAgo: Date,
    startOfMonth: Date,
    startOfPreviousMonth: Date,
    bucketWindow: BucketWindow
): PipelineStage[] {
    return [
        {
            $facet: {
                totals: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$amount" },
                            count: { $sum: 1 },
                        },
                    },
                ],
                currentMonth: [
                    { $match: { date: { $gte: startOfMonth } } },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$amount" },
                            count: { $sum: 1 },
                        },
                    },
                ],
                previousMonth: [
                    {
                        $match: {
                            date: { $gte: startOfPreviousMonth, $lt: startOfMonth },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$amount" },
                            count: { $sum: 1 },
                        },
                    },
                ],
                byCategory: [
                    {
                        $group: {
                            _id: "$category",
                            total: { $sum: "$amount" },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { total: -1 } },
                    { $limit: TOP_CATEGORIES },
                ],
                byMonth: [
                    { $match: { date: { $gte: twelveMonthsAgo } } },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$date" },
                                month: { $month: "$date" },
                            },
                            total: { $sum: "$amount" },
                        },
                    },
                ],
                byBucket: [
                    { $match: { date: { $gte: bucketWindow.start } } },
                    {
                        $group: {
                            _id: buildBucketIdExpression(bucketWindow.bucketUnit),
                            total: { $sum: "$amount" },
                        },
                    },
                ],
            },
        },
    ];
}

function asMonthKey(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, "0")}`;
}

function readTotals(rows: FacetTotals[]) {
    const r = rows[0];
    return {
        total: r?.total ?? 0,
        count: r?.count ?? 0,
    };
}

function mapCategories(rows: FacetCategory[]): CategoryRow[] {
    return rows.map((r) => ({
        category: r._id ?? "Uncategorized",
        total: Number(r.total) || 0,
        count: Number(r.count) || 0,
    }));
}

export async function buildDashboard(
    userId: string,
    range: DashboardRange = "month"
): Promise<DashboardResult> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
    );
    const twelveMonthsAgo = new Date(
        now.getFullYear(),
        now.getMonth() - (MONTHS_BACK - 1),
        1
    );
    const bucketWindow = rangeWindow(now, range);

    const matchStage: PipelineStage = { $match: { userId: userObjectId } };
    const facetPipeline = buildFacetPipeline(
        twelveMonthsAgo,
        startOfMonth,
        startOfPreviousMonth,
        bucketWindow
    );

    const [incomeAgg, expenseAgg, recentIncome, recentExpense] = await Promise.all([
        Income.aggregate<FacetResult>([matchStage, ...facetPipeline]),
        Expense.aggregate<FacetResult>([matchStage, ...facetPipeline]),
        Income.find({ userId: userObjectId })
            .sort({ date: -1, _id: -1 })
            .limit(RECENT_LIMIT)
            .lean<RecentDoc[]>(),
        Expense.find({ userId: userObjectId })
            .sort({ date: -1, _id: -1 })
            .limit(RECENT_LIMIT)
            .lean<RecentDoc[]>(),
    ]);

    const incomeFacet = incomeAgg[0] ?? {
        totals: [],
        currentMonth: [],
        previousMonth: [],
        byCategory: [],
        byMonth: [],
        byBucket: [],
    };
    const expenseFacet = expenseAgg[0] ?? {
        totals: [],
        currentMonth: [],
        previousMonth: [],
        byCategory: [],
        byMonth: [],
        byBucket: [],
    };

    const incomeTotals = readTotals(incomeFacet.totals);
    const expenseTotals = readTotals(expenseFacet.totals);
    const incomeCurrent = readTotals(incomeFacet.currentMonth);
    const expenseCurrent = readTotals(expenseFacet.currentMonth);
    const incomePrevious = readTotals(incomeFacet.previousMonth);
    const expensePrevious = readTotals(expenseFacet.previousMonth);

    const monthMap = new Map<
        string,
        { income: number; expense: number }
    >();
    for (let i = 0; i < MONTHS_BACK; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthMap.set(asMonthKey(d.getFullYear(), d.getMonth() + 1), {
            income: 0,
            expense: 0,
        });
    }
    for (const row of incomeFacet.byMonth) {
        const key = asMonthKey(row._id.year, row._id.month);
        const entry = monthMap.get(key);
        if (entry) entry.income = Number(row.total) || 0;
    }
    for (const row of expenseFacet.byMonth) {
        const key = asMonthKey(row._id.year, row._id.month);
        const entry = monthMap.get(key);
        if (entry) entry.expense = Number(row.total) || 0;
    }
    const byMonth: MonthRow[] = Array.from(monthMap.entries())
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([month, v]) => ({
            month,
            income: v.income,
            expense: v.expense,
            balance: v.income - v.expense,
        }));

    const byBucket = buildBucketSeries(
        bucketWindow,
        incomeFacet.byBucket,
        expenseFacet.byBucket
    );

    const recent: RecentRow[] = [
        ...recentIncome.map((d) => ({
            id: String(d._id),
            type: "income" as const,
            description: d.description,
            amount: d.amount,
            category: d.category,
            date: d.date,
        })),
        ...recentExpense.map((d) => ({
            id: String(d._id),
            type: "expense" as const,
            description: d.description,
            amount: d.amount,
            category: d.category,
            date: d.date,
        })),
    ]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, RECENT_LIMIT);

    const totalBalance = incomeTotals.total - expenseTotals.total;
    const monthlyBalance = incomeCurrent.total - expenseCurrent.total;
    const previousBalance = incomePrevious.total - expensePrevious.total;

    const summary: DashboardSummary = {
        totalBalance,
        totalBalanceMonthDelta: monthlyBalance,
        monthlyIncome: incomeCurrent.total,
        monthlyIncomeChangePct: percentChange(
            incomeCurrent.total,
            incomePrevious.total
        ),
        monthlyExpense: expenseCurrent.total,
        monthlyExpenseChangePct: percentChange(
            expenseCurrent.total,
            expensePrevious.total
        ),
        savingsRate: savingsRate(incomeCurrent.total, expenseCurrent.total),
        savingsRateLabel: savingsRateLabel(
            savingsRate(incomeCurrent.total, expenseCurrent.total)
        ),
    };

    return {
        range,
        summary,
        totals: {
            income: incomeTotals.total,
            expense: expenseTotals.total,
            balance: totalBalance,
            incomeCount: incomeTotals.count,
            expenseCount: expenseTotals.count,
        },
        currentMonth: {
            income: incomeCurrent.total,
            expense: expenseCurrent.total,
            balance: monthlyBalance,
            incomeCount: incomeCurrent.count,
            expenseCount: expenseCurrent.count,
        },
        previousMonth: {
            income: incomePrevious.total,
            expense: expensePrevious.total,
            balance: previousBalance,
        },
        byMonth,
        byBucket,
        topIncomeCategories: mapCategories(incomeFacet.byCategory),
        topExpenseCategories: mapCategories(expenseFacet.byCategory),
        recent,
    };
}

function buildBucketSeries(
    window: BucketWindow,
    incomeRows: FacetBucket[],
    expenseRows: FacetBucket[]
): BucketRow[] {
    const series: BucketRow[] = [];
    const bucketMap = new Map<string, { income: number; expense: number }>();

    for (let i = 0; i < window.buckets; i++) {
        const date =
            window.bucketUnit === "day"
                ? addDays(window.start, i)
                : window.bucketUnit === "week"
                    ? addDays(window.start, i * 7)
                    : addMonths(window.start, i);
        const key = formatBucketKey(date, window.bucketUnit);
        bucketMap.set(key, { income: 0, expense: 0 });
        series.push({
            key,
            label: formatBucketLabel(date, window.labelFormat),
            income: 0,
            expense: 0,
            balance: 0,
        });
    }

    for (const row of incomeRows) {
        const entry = bucketMap.get(row._id);
        if (entry) entry.income = Number(row.total) || 0;
    }
    for (const row of expenseRows) {
        const entry = bucketMap.get(row._id);
        if (entry) entry.expense = Number(row.total) || 0;
    }

    for (const row of series) {
        const v = bucketMap.get(row.key);
        if (!v) continue;
        row.income = v.income;
        row.expense = v.expense;
        row.balance = v.income - v.expense;
    }

    return series;
}

function percentChange(current: number, previous: number): number | null {
    if (previous === 0) {
        if (current === 0) return 0;
        return null;
    }
    const pct = ((current - previous) / previous) * 100;
    return Math.round(pct * 10) / 10;
}

function savingsRate(income: number, expense: number): number {
    if (income === 0) return 0;
    const rate = ((income - expense) / income) * 100;
    return Math.round(rate * 10) / 10;
}

function savingsRateLabel(rate: number): SavingsRateLabel {
    if (rate < 0) return "Critical";
    if (rate < 10) return "Needs improvement";
    if (rate < 20) return "Good";
    return "Excellent";
}
