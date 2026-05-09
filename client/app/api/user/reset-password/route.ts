import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import validator from "validator";
import User from "@/models/userModel";
import RefreshToken from "@/models/refreshTokenModel";
import { ConnectDB } from "@/lib/db";
import { consumeOtp, OTP_LENGTH } from "@/lib/otp";
import {
    generateAccessToken,
    generateRefreshToken,
    REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/utils/token";
import { setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/cookies";

const BCRYPT_SALT_ROUNDS = 12;

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") {
            return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
        }

        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const code = typeof body.code === "string" ? body.code.trim() : "";
        const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

        if (!email || !code || !newPassword) {
            return NextResponse.json(
                { message: "email, code and newPassword are required" },
                { status: 400 }
            );
        }
        if (!validator.isEmail(email)) {
            return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
        }
        if (!/^\d+$/.test(code) || code.length !== OTP_LENGTH) {
            return NextResponse.json(
                { message: `Code must be a ${OTP_LENGTH}-digit number` },
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

        const consumed = await consumeOtp({ email, purpose: "PASSWORD_RESET", code });
        if (!consumed.ok) {
            return NextResponse.json({ message: consumed.message }, { status: consumed.status });
        }

        const user = await User.findById(consumed.userId).select("+password");
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
        if (!user.emailVerified) user.emailVerified = true;
        await user.save({ validateModifiedOnly: true });

        await RefreshToken.updateMany(
            { userId: user._id, revokedAt: null },
            { $set: { revokedAt: new Date() } }
        );

        const accessToken = generateAccessToken(String(user._id));
        const { raw: refreshRaw, hash: refreshHash } = generateRefreshToken();
        await RefreshToken.create({
            userId: user._id,
            tokenHash: refreshHash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000),
        });

        const response = NextResponse.json({
            message: "Password reset successfully",
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
            },
        });
        setAccessTokenCookie(response, accessToken);
        setRefreshTokenCookie(response, refreshRaw);
        return response;
    } catch (error) {
        console.error("[reset-password] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
