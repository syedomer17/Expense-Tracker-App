import crypto from "crypto";
import type { Types } from "mongoose";
import Otp, { type OtpPurpose } from "@/models/otpModel";

export const OTP_EXPIRY_MS = 10 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_LENGTH = 6;

export type IssueResult =
    | { ok: true; code: string }
    | { ok: false; message: string; status: number };

export type ConsumeResult =
    | { ok: true; userId: Types.ObjectId }
    | { ok: false; message: string; status: number };

export function generateOtpCode(): string {
    const max = 10 ** OTP_LENGTH;
    return crypto.randomInt(0, max).toString().padStart(OTP_LENGTH, "0");
}

export function hashOtpCode(code: string): string {
    return crypto.createHash("sha256").update(code).digest("hex");
}

export async function issueOtp(params: {
    userId: Types.ObjectId;
    email: string;
    purpose: OtpPurpose;
}): Promise<IssueResult> {
    const recent = await Otp.findOne({
        email: params.email,
        purpose: params.purpose,
        consumedAt: null,
        createdAt: { $gt: new Date(Date.now() - OTP_RESEND_COOLDOWN_MS) },
    })
        .sort({ createdAt: -1 })
        .lean();

    if (recent) {
        return {
            ok: false,
            message: "Please wait before requesting another code",
            status: 429,
        };
    }

    await Otp.updateMany(
        { email: params.email, purpose: params.purpose, consumedAt: null },
        { $set: { consumedAt: new Date() } }
    );

    const code = generateOtpCode();
    await Otp.create({
        userId: params.userId,
        email: params.email,
        purpose: params.purpose,
        codeHash: hashOtpCode(code),
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    });

    return { ok: true, code };
}

export async function consumeOtp(params: {
    email: string;
    purpose: OtpPurpose;
    code: string;
}): Promise<ConsumeResult> {
    const otp = await Otp.findOne({
        email: params.email,
        purpose: params.purpose,
        consumedAt: null,
    }).sort({ createdAt: -1 });

    if (!otp) {
        return { ok: false, message: "Invalid or expired code", status: 400 };
    }
    if (otp.expiresAt.getTime() < Date.now()) {
        return { ok: false, message: "Code expired", status: 400 };
    }
    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
        otp.consumedAt = new Date();
        await otp.save();
        return {
            ok: false,
            message: "Too many attempts. Request a new code.",
            status: 429,
        };
    }

    const expected = hashOtpCode(params.code);
    const matches =
        expected.length === otp.codeHash.length &&
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(otp.codeHash));

    if (!matches) {
        otp.attempts += 1;
        if (otp.attempts >= OTP_MAX_ATTEMPTS) {
            otp.consumedAt = new Date();
        }
        await otp.save();
        return { ok: false, message: "Invalid or expired code", status: 400 };
    }

    otp.consumedAt = new Date();
    await otp.save();
    return { ok: true, userId: otp.userId };
}
