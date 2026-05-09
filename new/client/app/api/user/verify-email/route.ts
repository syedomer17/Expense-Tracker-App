import { NextResponse } from "next/server";
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

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") {
            return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
        }

        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const code = typeof body.code === "string" ? body.code.trim() : "";

        if (!email || !code) {
            return NextResponse.json(
                { message: "Email and code are required" },
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

        await ConnectDB();

        const consumed = await consumeOtp({ email, purpose: "EMAIL_VERIFICATION", code });
        if (!consumed.ok) {
            return NextResponse.json({ message: consumed.message }, { status: consumed.status });
        }

        const user = await User.findById(consumed.userId);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (!user.emailVerified) {
            user.emailVerified = true;
            await user.save({ validateModifiedOnly: true });
        }

        const accessToken = generateAccessToken(String(user._id));
        const { raw: refreshRaw, hash: refreshHash } = generateRefreshToken();
        await RefreshToken.create({
            userId: user._id,
            tokenHash: refreshHash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000),
        });

        const response = NextResponse.json({
            message: "Email verified",
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
        console.error("[verify-email] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
