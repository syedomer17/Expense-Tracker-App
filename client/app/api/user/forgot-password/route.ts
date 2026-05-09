import { NextResponse } from "next/server";
import validator from "validator";
import User from "@/models/userModel";
import { ConnectDB } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

const GENERIC_RESPONSE = NextResponse.json({
    message: "If an account with that email exists, a reset code has been sent.",
});

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") {
            return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
        }

        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        if (!email || !validator.isEmail(email)) {
            return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
        }

        await ConnectDB();
        const user = await User.findOne({ email }).select("_id email").lean();
        if (!user) {
            return GENERIC_RESPONSE;
        }

        const otpResult = await issueOtp({
            userId: user._id,
            email: user.email,
            purpose: "PASSWORD_RESET",
        });

        if (!otpResult.ok) {
            if (otpResult.status === 429) return GENERIC_RESPONSE;
            return NextResponse.json(
                { message: otpResult.message },
                { status: otpResult.status }
            );
        }

        try {
            await sendOtpEmail({
                to: user.email,
                code: otpResult.code,
                purpose: "PASSWORD_RESET",
            });
        } catch (error) {
            console.error("[forgot-password] failed to send email:", error);
        }

        return GENERIC_RESPONSE;
    } catch (error) {
        console.error("[forgot-password] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
