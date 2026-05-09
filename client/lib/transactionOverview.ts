import mongoose, { type Model, type PipelineStage, type Types } from "mongoose";
import {
    bucketGroupStages,
    emptySeries,
    rangeWindow,
    type DashboardRange,
    type SeriesRow,
} from "@/lib/bucketSeries";

interface TransactionShape {
    description: string;
    amount: number;
    category: string;
    date: Date;
    type: string;
    userId: Types.ObjectId;
}

export interface OverviewResult {
    range: DashboardRange;
    total: number;
    count: number;
    byCategory: Array<{ category: string; total: number; count: number }>;
    byMonth: Array<{ month: string; total: number; count: number }>;
    byBucket: SeriesRow[];
    recent: Array<{
        id: string;
        description: string;
        amount: number;
        category: string;
        date: Date;
    }>;
}

interface BucketAgg {
    _id: string;
    total: number;
    count: number;
}

const RECENT_LIMIT = 5;
const MONTHS_BACK = 12;

export async function buildOverview<T extends TransactionShape>(
    Model: Model<T>,
    userId: string,
    range: DashboardRange = "month"
): Promise<OverviewResult> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const twelveMonthsAgo = new Date(
        now.getFullYear(),
        now.getMonth() - (MONTHS_BACK - 1),
        1
    );
    const window = rangeWindow(now, range);

    const bucketStages: PipelineStage[] = bucketGroupStages(window, {
        withCount: true,
    });

    const [totalsAgg, byCategoryAgg, byMonthAgg, byBucketAgg, recentDocs] =
        await Promise.all([
            Model.aggregate([
                { $match: { userId: userObjectId } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
            Model.aggregate([
                { $match: { userId: userObjectId } },
                {
                    $group: {
                        _id: "$category",
                        total: { $sum: "$amount" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { total: -1 } },
            ]),
            Model.aggregate([
                {
                    $match: {
                        userId: userObjectId,
                        date: { $gte: twelveMonthsAgo },
                    },
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$date" },
                            month: { $month: "$date" },
                        },
                        total: { $sum: "$amount" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
            ]),
            Model.aggregate<BucketAgg>([
                { $match: { userId: userObjectId } },
                ...bucketStages,
            ]),
            Model.find({ userId: userObjectId })
                .sort({ date: -1, _id: -1 })
                .limit(RECENT_LIMIT)
                .lean(),
        ]);

    const totals = totalsAgg[0] as { total?: number; count?: number } | undefined;

    const byBucketMap = new Map<string, { total: number; count: number }>();
    for (const row of byBucketAgg) {
        byBucketMap.set(row._id, {
            total: Number(row.total) || 0,
            count: Number(row.count) || 0,
        });
    }
    const byBucket = emptySeries(window).map((row) => {
        const hit = byBucketMap.get(row.key);
        return hit ? { ...row, total: hit.total, count: hit.count } : row;
    });

    return {
        range,
        total: totals?.total ?? 0,
        count: totals?.count ?? 0,
        byCategory: byCategoryAgg.map((row) => ({
            category: String(row._id ?? "Uncategorized"),
            total: Number(row.total) || 0,
            count: Number(row.count) || 0,
        })),
        byMonth: byMonthAgg.map((row) => {
            const year = row._id.year as number;
            const month = String(row._id.month as number).padStart(2, "0");
            return {
                month: `${year}-${month}`,
                total: Number(row.total) || 0,
                count: Number(row.count) || 0,
            };
        }),
        byBucket,
        recent: recentDocs.map((d) => ({
            id: String(d._id),
            description: d.description,
            amount: d.amount,
            category: d.category,
            date: d.date,
        })),
    };
}
