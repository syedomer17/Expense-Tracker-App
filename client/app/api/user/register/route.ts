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

const BCRYPT_SALT_ROUNDS = 12;

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") {
            return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
        }

        const name = typeof body.name === "string" ? body.name.trim() : "";
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password : "";

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Name, email and password are required" },
                { status: 400 }
            );
        }
        if (name.length < 2 || name.length > 100) {
            return NextResponse.json(
                { message: "Name must be between 2 and 100 characters" },
                { status: 400 }
            );
        }
        if (!validator.isEmail(email)) {
            return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
        }
        if (password.length < 8 || password.length > 128) {
            return NextResponse.json(
                { message: "Password must be between 8 and 128 characters" },
                { status: 400 }
            );
        }

        await ConnectDB();

        const existing = await User.findOne({ email }).lean();
        if (existing) {
            return NextResponse.json({ message: "Email already in use" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const user = await User.create({ name, email, password: hashedPassword });

        const accessToken = generateAccessToken(String(user._id));
        const { raw: refreshRaw, hash: refreshHash } = generateRefreshToken();
        await RefreshToken.create({
            userId: user._id,
            tokenHash: refreshHash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000),
        });

        const response = NextResponse.json(
            {
                message: "Registered successfully",
                user: {
                    id: String(user._id),
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 201 }
        );
        setAccessTokenCookie(response, accessToken);
        setRefreshTokenCookie(response, refreshRaw);
        return response;
    } catch (error) {
        if (error instanceof Error && (error as { code?: number }).code === 11000) {
            return NextResponse.json({ message: "Email already in use" }, { status: 409 });
        }
        console.error("[register] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
