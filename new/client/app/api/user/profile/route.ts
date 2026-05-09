import { NextResponse } from "next/server";
import validator from "validator";
import User from "@/models/userModel";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";

export async function PATCH(request: Request) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;
        const { userId } = auth;

        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") {
            return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
        }

        const updates: { name?: string; email?: string } = {};

        if (body.name !== undefined) {
            if (typeof body.name !== "string") {
                return NextResponse.json({ message: "Name must be a string" }, { status: 400 });
            }
            const name = body.name.trim();
            if (name.length < 2 || name.length > 100) {
                return NextResponse.json(
                    { message: "Name must be between 2 and 100 characters" },
                    { status: 400 }
                );
            }
            updates.name = name;
        }

        if (body.email !== undefined) {
            if (typeof body.email !== "string") {
                return NextResponse.json({ message: "Email must be a string" }, { status: 400 });
            }
            const email = body.email.trim().toLowerCase();
            if (!validator.isEmail(email)) {
                return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
            }
            updates.email = email;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ message: "No fields to update" }, { status: 400 });
        }

        await ConnectDB();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (updates.email && updates.email !== user.email) {
            const conflict = await User.findOne({ email: updates.email })
                .select("_id")
                .lean();
            if (conflict && String(conflict._id) !== userId) {
                return NextResponse.json({ message: "Email already in use" }, { status: 409 });
            }
        }

        if (updates.name !== undefined) user.name = updates.name;
        if (updates.email !== undefined) user.email = updates.email;

        try {
            await user.save({ validateModifiedOnly: true });
        } catch (error) {
            if (error instanceof Error && (error as { code?: number }).code === 11000) {
                return NextResponse.json({ message: "Email already in use" }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json({
            message: "Profile updated successfully",
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("[profile] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
