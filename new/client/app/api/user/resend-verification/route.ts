import { NextResponse } from "next/server";
import validator from "validator";
import User from "@/models/userModel";
import { ConnectDB } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

const GENERIC_RESPONSE = NextResponse.json({
    message: "If your account exists and is unverified, a code has been sent.",
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
        const user = await User.findOne({ email }).select("_id email emailVerified").lean();

        if (!user || user.emailVerified) {
            return GENERIC_RESPONSE;
        }

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
            console.error("[resend-verification] failed to send email:", error);
            return NextResponse.json(
                { message: "Failed to send verification email" },
                { status: 502 }
            );
        }

        return GENERIC_RESPONSE;
    } catch (error) {
        console.error("[resend-verification] error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
