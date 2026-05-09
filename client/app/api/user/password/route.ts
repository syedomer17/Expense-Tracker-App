import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/userModel";
import RefreshToken from "@/models/refreshTokenModel";
import { ConnectDB } from "@/lib/db";
import { requireAuth, isAuthFailure } from "@/lib/auth";
import {
    generateAccessToken,
    generateRefreshToken,
    REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/utils/token";
import { setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/cookies";

const BCRYPT_SALT_ROUNDS = 12;

export async function POST(request: Request) {
    try {
        const auth = requireAuth(request);
        if (isAuthFailure(auth)) return auth;
        const { userId } = auth;

        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") {
            return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
        }

        const currentPassword =
            typeof body.currentPassword === "string" ? body.currentPassword : "";
        const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

        if (!newPassword) {
            return NextResponse.json(
                { message: "newPassword is required" },
                { status: 400 }
            );
        }
        if (newPassword.length < 8 || newPassword.length > 128) {
            return NextResponse.json(
                { message: "Password must be between 8 and 128 characters" },
                { status: 400 }
            );
        }

        await ConnectDB();

        const user = await User.findById(userId).select("+password");
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.password) {
            if (!currentPassword) {
                return NextResponse.json(
                    { message: "currentPassword is required" },
                    { status: 400 }
                );
            }
            if (newPassword === currentPassword) {
                return NextResponse.json(
                    { message: "New password must be different from current password" },
                    { status: 400 }
                );
            }
            const matches = await bcrypt.compare(currentPassword, user.password);
            if (!matches) {
                return NextResponse.json(
                    { message: "Current password is incorrect" },
                    { status: 401 }
                );
            }
        }

        user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
        await user.save({ validateModifiedOnly: true });

        await RefreshToken.updateMany(
            { userId: user._id, revokedAt: null },
            { $set: { revokedAt: new Date() } }
        );

        const newAccessToken = generateAccessToken(String(user._id));
        const { raw: newRefreshRaw, hash: newRefreshHash } = generateRefreshToken();
        await RefreshToken.create({
            userId: user._id,
            tokenHash: newRefreshHash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000),
        });

        const response = NextResponse.json({ message: "Password changed successfully" });
        setAccessTokenCookie(response, newAccessToken);
        setRefreshTokenCookie(response, newRefreshRaw);
        return response;
    } catch (error) {
        console.error("[password] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
