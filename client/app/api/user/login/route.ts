import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import validator from "validator";
import User from "@/models/userModel";
import RefreshToken from "@/models/refreshTokenModel";
import { ConnectDB } from "@/lib/db";
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
        const password = typeof body.password === "string" ? body.password : "";

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }
        if (!validator.isEmail(email)) {
            return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
        }

        await ConnectDB();

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        if (!user.password) {
            return NextResponse.json(
                {
                    message:
                        "This account was created with a social provider. Sign in with Google or GitHub.",
                },
                { status: 401 }
            );
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        if (!user.emailVerified) {
            return NextResponse.json(
                {
                    message:
                        "Email not verified. Check your inbox for the verification code or request a new one.",
                    emailVerified: false,
                },
                { status: 403 }
            );
        }

        const accessToken = generateAccessToken(String(user._id));
        const { raw: refreshRaw, hash: refreshHash } = generateRefreshToken();
        await RefreshToken.create({
            userId: user._id,
            tokenHash: refreshHash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000),
        });

        const response = NextResponse.json({
            message: "Logged in successfully",
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
            },
        });
        setAccessTokenCookie(response, accessToken);
        setRefreshTokenCookie(response, refreshRaw);
        return response;
    } catch (error) {
        console.error("[login] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
