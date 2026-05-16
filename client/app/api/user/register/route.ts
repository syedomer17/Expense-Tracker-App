import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import validator from "validator";
import User from "@/models/userModel";
import { ConnectDB } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

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

        const otpResult = await issueOtp({
            userId: user._id,
            email: user.email,
            purpose: "EMAIL_VERIFICATION",
        });

        if (!otpResult.ok) {
            return NextResponse.json(
                { message: otpResult.message },
                { status: otpResult.status }
            );
        }

        try {
            await sendOtpEmail({
                to: user.email,
                code: otpResult.code,
                purpose: "EMAIL_VERIFICATION",
            });
        } catch (error) {
            console.error("[register] failed to send verification email:", error);
            return NextResponse.json(
                {
                    message:
                        "Account created, but we could not send the verification code. Please use resend verification.",
                    user: {
                        id: String(user._id),
                        name: user.name,
                        email: user.email,
                        emailVerified: false,
                    },
                },
                { status: 201 }
            );
        }

        return NextResponse.json(
            {
                message: "Registered successfully. Verify your email to continue.",
                user: {
                    id: String(user._id),
                    name: user.name,
                    email: user.email,
                    emailVerified: false,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Error && (error as { code?: number }).code === 11000) {
            return NextResponse.json({ message: "Email already in use" }, { status: 409 });
        }
        console.error("[register] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
