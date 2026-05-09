import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";
import Wishlist, { type IWishlistItem, type WishlistPriority } from "@/models/wishlistModel";
import Income from "@/models/incomeModel";
import Expense from "@/models/expenseModel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIORITIES: WishlistPriority[] = ["low", "medium", "high"];

function serialize(doc: IWishlistItem & { _id: mongoose.Types.ObjectId }) {
    const target = doc.targetAmount;
    const saved = doc.savedAmount;
    const remaining = Math.max(0, target - saved);
    const percent = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
    return {
        id: String(doc._id),
        name: doc.name,
        targetAmount: target,
        savedAmount: saved,
        remaining,
        percent,
        targetDate: doc.targetDate ? doc.targetDate.toISOString() : null,
        priority: doc.priority,
        notes: doc.notes,
        completed: !!doc.completedAt,
        completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
        createdAt: doc.createdAt.toISOString(),
    };
}

async function lifetimeTotals(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const [incomeAgg, expenseAgg] = await Promise.all([
        Income.aggregate<{ total: number }>([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Expense.aggregate<{ total: number }>([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
    ]);
    const income = Number(incomeAgg[0]?.total ?? 0);
    const expense = Number(expenseAgg[0]?.total ?? 0);
    return { income, expense, balance: income - expense };
}

export async function GET(request: Request) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;
        await ConnectDB();

        const items = await Wishlist.find({ userId: auth.userId })
            .sort({ completedAt: 1, priority: -1, createdAt: -1 })
            .lean();

        const totals = await lifetimeTotals(auth.userId);
        const committed = items
            .filter((i) => !i.completedAt)
            .reduce((sum, i) => sum + (i.savedAmount || 0), 0);
        const free = totals.balance - committed;

        return NextResponse.json({
            items: items.map(serialize),
            summary: {
                income: totals.income,
                expense: totals.expense,
                balance: totals.balance,
                committed,
                free,
            },
        });
    } catch (error) {
        console.error("[wishlist] GET error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

interface CreateBody {
    name?: unknown;
    targetAmount?: unknown;
    savedAmount?: unknown;
    targetDate?: unknown;
    priority?: unknown;
    notes?: unknown;
}

export async function POST(request: Request) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;

        const body = (await request.json().catch(() => ({}))) as CreateBody;

        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }
        if (name.length > 120) {
            return NextResponse.json({ message: "Name is too long" }, { status: 400 });
        }

        const targetAmount = Number(body.targetAmount);
        if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
            return NextResponse.json(
                { message: "targetAmount must be a positive number" },
                { status: 400 }
            );
        }

        const savedAmount = body.savedAmount === undefined ? 0 : Number(body.savedAmount);
        if (!Number.isFinite(savedAmount) || savedAmount < 0) {
            return NextResponse.json(
                { message: "savedAmount must be non-negative" },
                { status: 400 }
            );
        }

        let targetDate: Date | null = null;
        if (body.targetDate) {
            const d = new Date(String(body.targetDate));
            if (Number.isNaN(d.getTime())) {
                return NextResponse.json(
                    { message: "targetDate is invalid" },
                    { status: 400 }
                );
            }
            targetDate = d;
        }

        const priority: WishlistPriority = PRIORITIES.includes(
            body.priority as WishlistPriority
        )
            ? (body.priority as WishlistPriority)
            : "medium";

        const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : "";

        await ConnectDB();
        const completedAt = savedAmount >= targetAmount ? new Date() : null;
        const item = await Wishlist.create({
            userId: auth.userId,
            name,
            targetAmount,
            savedAmount,
            targetDate,
            priority,
            notes,
            completedAt,
        });

        return NextResponse.json({ item: serialize(item.toObject()) }, { status: 201 });
    } catch (error) {
        console.error("[wishlist] POST error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
