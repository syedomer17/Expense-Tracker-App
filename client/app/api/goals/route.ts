import { NextResponse } from "next/server";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";
import Goal from "@/models/goalModel";

interface PutBody {
    weeklyTarget?: number;
    monthlyTarget?: number;
    email?: { daily?: boolean; weekly?: boolean; monthly?: boolean };
}

function serialize(doc: { weeklyTarget: number; monthlyTarget: number; email: { daily: boolean; weekly: boolean; monthly: boolean } }) {
    return {
        weeklyTarget: doc.weeklyTarget ?? 0,
        monthlyTarget: doc.monthlyTarget ?? 0,
        email: {
            daily: !!doc.email?.daily,
            weekly: !!doc.email?.weekly,
            monthly: !!doc.email?.monthly,
        },
    };
}

export async function GET(request: Request) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;
        await ConnectDB();
        const goal =
            (await Goal.findOne({ userId: auth.userId }).lean()) ??
            (await Goal.create({ userId: auth.userId })).toObject();
        return NextResponse.json({ goal: serialize(goal) });
    } catch (error) {
        console.error("[goals] GET error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;

        const body = (await request.json().catch(() => ({}))) as PutBody;
        const update: Record<string, unknown> = {};

        if (body.weeklyTarget !== undefined) {
            const n = Number(body.weeklyTarget);
            if (!Number.isFinite(n) || n < 0) {
                return NextResponse.json(
                    { message: "weeklyTarget must be a non-negative number" },
                    { status: 400 }
                );
            }
            update.weeklyTarget = n;
        }
        if (body.monthlyTarget !== undefined) {
            const n = Number(body.monthlyTarget);
            if (!Number.isFinite(n) || n < 0) {
                return NextResponse.json(
                    { message: "monthlyTarget must be a non-negative number" },
                    { status: 400 }
                );
            }
            update.monthlyTarget = n;
        }
        if (body.email) {
            if (typeof body.email.daily === "boolean") update["email.daily"] = body.email.daily;
            if (typeof body.email.weekly === "boolean") update["email.weekly"] = body.email.weekly;
            if (typeof body.email.monthly === "boolean") update["email.monthly"] = body.email.monthly;
        }

        await ConnectDB();
        const goal = await Goal.findOneAndUpdate(
            { userId: auth.userId },
            { $set: update, $setOnInsert: { userId: auth.userId } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();

        return NextResponse.json({ goal: serialize(goal!) });
    } catch (error) {
        console.error("[goals] PUT error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
