import nodemailer, { type Transporter } from "nodemailer";
import type { OtpPurpose } from "@/models/otpModel";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
    if (cachedTransporter) return cachedTransporter;

    const host = process.env.SMTP_HOST;
    const portRaw = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error(
            "SMTP_HOST, SMTP_USER, and SMTP_PASS must be set in environment variables"
        );
    }

    const port = portRaw ? parseInt(portRaw, 10) : 587;
    if (!Number.isFinite(port)) {
        throw new Error("SMTP_PORT must be a number");
    }

    cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });

    return cachedTransporter;
}

export async function sendEmail(params: {
    to: string;
    subject: string;
    text: string;
    html: string;
}): Promise<void> {
    const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
    if (!from) {
        throw new Error("SMTP_FROM or SMTP_USER must be set");
    }

    await getTransporter().sendMail({
        from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
    });
}

export async function sendOtpEmail(params: {
    to: string;
    code: string;
    purpose: OtpPurpose;
}): Promise<void> {
    const isVerification = params.purpose === "EMAIL_VERIFICATION";
    const subject = isVerification ? "Verify your email" : "Reset your password";
    const action = isVerification
        ? "verify your email address"
        : "reset your password";

    const text = `Your code to ${action} is: ${params.code}\n\nThis code expires in 10 minutes. If you didn't request this, ignore this email.`;

    const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
    <h2 style="margin:0 0 16px;color:#18181b;">${subject}</h2>
    <p style="margin:0 0 24px;color:#3f3f46;font-size:15px;line-height:1.5;">Use this code to ${action}:</p>
    <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:20px;background:#f4f4f5;text-align:center;border-radius:8px;color:#18181b;font-family:monospace;">${params.code}</div>
    <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.5;">This code expires in 10 minutes.</p>
    <p style="margin:8px 0 0;color:#71717a;font-size:13px;line-height:1.5;">If you didn't request this, you can safely ignore this email.</p>
  </div>
</body>
</html>`;

    await sendEmail({
        to: params.to,
        subject,
        text,
        html,
    });
}
