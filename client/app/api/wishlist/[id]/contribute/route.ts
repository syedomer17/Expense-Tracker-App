import { NextResponse } from "next/server";
import mongoose, { isValidObjectId } from "mongoose";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";
import Wishlist, { type IWishlistItem } from "@/models/wishlistModel";
import User from "@/models/userModel";
import { appUrlFromRequest, sendWishlistCompletedEmail } from "@/lib/digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ id: string }> };

const NOT_FOUND = NextResponse.json({ message: "Not found" }, { status: 404 });

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

export async function POST(request: Request, ctx: RouteCtx) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;

        const { id } = await ctx.params;
        if (!isValidObjectId(id)) return NOT_FOUND;

        const body = (await request.json().catch(() => ({}))) as {
            amount?: unknown;
        };
        const amount = Number(body.amount);
        if (!Number.isFinite(amount) || amount === 0) {
            return NextResponse.json(
                { message: "amount must be a non-zero number" },
                { status: 400 }
            );
        }

        await ConnectDB();

        const current = await Wishlist.findOne({
            _id: id,
            userId: auth.userId,
        }).lean();
        if (!current) return NOT_FOUND;

        const nextSaved = Math.max(0, (current.savedAmount || 0) + amount);
        const justCompleted =
            !current.completedAt && nextSaved >= current.targetAmount;

        const setOps: Record<string, unknown> = { savedAmount: nextSaved };
        if (justCompleted) setOps.completedAt = new Date();
        if (!justCompleted && current.completedAt && nextSaved < current.targetAmount) {
            // user reduced contribution back below target — re-open the item
            setOps.completedAt = null;
            setOps.completionEmailSentAt = null;
        }

        const updated = await Wishlist.findOneAndUpdate(
            { _id: id, userId: auth.userId },
            { $set: setOps },
            { new: true, runValidators: true }
        ).lean();
        if (!updated) return NOT_FOUND;

        if (justCompleted) {
            // atomic claim — only send the completion email once per item
            const claim = await Wishlist.updateOne(
                { _id: id, userId: auth.userId, completionEmailSentAt: null },
                { $set: { completionEmailSentAt: new Date() } }
            );
            if (claim.modifiedCount === 1) {
                try {
                    const user = await User.findById(auth.userId)
                        .select("name email")
                        .lean();
                    if (user?.email) {
                        await sendWishlistCompletedEmail({
                            to: user.email,
                            appUrl: appUrlFromRequest(request),
                            name: user.name?.split(" ")[0] ?? "there",
                            itemName: updated.name,
                            targetAmount: updated.targetAmount,
                            savedAmount: updated.savedAmount,
                        });
                    }
                } catch (err) {
                    console.error("[wishlist.contribute] email error:", err);
                }
            }
        }

        return NextResponse.json({ item: serialize(updated) });
    } catch (error) {
        console.error("[wishlist.contribute] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
