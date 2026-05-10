import { NextResponse } from "next/server";
import User from "@/models/userModel";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;
        const { userId } = auth;

        await ConnectDB();

        const user = await User.findById(userId).lean();
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl ?? null,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("[me] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
