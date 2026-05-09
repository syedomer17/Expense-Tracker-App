import { NextResponse } from "next/server";
import mongoose, { isValidObjectId } from "mongoose";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";
import Wishlist, { type IWishlistItem, type WishlistPriority } from "@/models/wishlistModel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIORITIES: WishlistPriority[] = ["low", "medium", "high"];
const NOT_FOUND = NextResponse.json({ message: "Not found" }, { status: 404 });

type RouteCtx = { params: Promise<{ id: string }> };

function serialize(doc: IWishlistItem & { _id: mongoose.Types.ObjectId }) {
    const target = doc.targetAmount;
    const saved = doc.savedAmount;
    const percent = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
    return {
        id: String(doc._id),
        name: doc.name,
        targetAmount: target,
        savedAmount: saved,
        remaining: Math.max(0, target - saved),
        percent,
        targetDate: doc.targetDate ? doc.targetDate.toISOString() : null,
        priority: doc.priority,
        notes: doc.notes,
        completed: !!doc.completedAt,
        completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
        createdAt: doc.createdAt.toISOString(),
    };
}

interface PatchBody {
    name?: unknown;
    targetAmount?: unknown;
    savedAmount?: unknown;
    targetDate?: unknown;
    priority?: unknown;
    notes?: unknown;
}

export async function PATCH(request: Request, ctx: RouteCtx) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;

        const { id } = await ctx.params;
        if (!isValidObjectId(id)) return NOT_FOUND;

        const body = (await request.json().catch(() => ({}))) as PatchBody;
        const update: Record<string, unknown> = {};

        if (body.name !== undefined) {
            const name = typeof body.name === "string" ? body.name.trim() : "";
            if (!name || name.length > 120) {
                return NextResponse.json(
                    { message: "Name must be 1–120 characters" },
                    { status: 400 }
                );
            }
            update.name = name;
        }
        if (body.targetAmount !== undefined) {
            const n = Number(body.targetAmount);
            if (!Number.isFinite(n) || n <= 0) {
                return NextResponse.json(
                    { message: "targetAmount must be positive" },
                    { status: 400 }
                );
            }
            update.targetAmount = n;
        }
        if (body.savedAmount !== undefined) {
            const n = Number(body.savedAmount);
            if (!Number.isFinite(n) || n < 0) {
                return NextResponse.json(
                    { message: "savedAmount must be non-negative" },
                    { status: 400 }
                );
            }
            update.savedAmount = n;
        }
        if (body.targetDate !== undefined) {
            if (body.targetDate === null || body.targetDate === "") {
                update.targetDate = null;
            } else {
                const d = new Date(String(body.targetDate));
                if (Number.isNaN(d.getTime())) {
                    return NextResponse.json(
                        { message: "targetDate is invalid" },
                        { status: 400 }
                    );
                }
                update.targetDate = d;
            }
        }
        if (body.priority !== undefined) {
            if (!PRIORITIES.includes(body.priority as WishlistPriority)) {
                return NextResponse.json(
                    { message: "priority must be low, medium, or high" },
                    { status: 400 }
                );
            }
            update.priority = body.priority;
        }
        if (body.notes !== undefined) {
            update.notes =
                typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : "";
        }

        await ConnectDB();
        const item = await Wishlist.findOneAndUpdate(
            { _id: id, userId: auth.userId },
            { $set: update },
            { new: true, runValidators: true }
        ).lean();
        if (!item) return NOT_FOUND;

        return NextResponse.json({ item: serialize(item) });
    } catch (error) {
        console.error("[wishlist] PATCH error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, ctx: RouteCtx) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;

        const { id } = await ctx.params;
        if (!isValidObjectId(id)) return NOT_FOUND;

        await ConnectDB();
        const result = await Wishlist.findOneAndDelete({
            _id: id,
            userId: auth.userId,
        })
            .select("_id")
            .lean();
        if (!result) return NOT_FOUND;

        return NextResponse.json({ message: "Deleted", id: String(result._id) });
    } catch (error) {
        console.error("[wishlist] DELETE error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
