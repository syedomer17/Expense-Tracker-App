import jwt from "jsonwebtoken";
import crypto from "crypto";

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not defined in environment variables`);
    }
    return value;
}

const JWT_SECRET: string = requireEnv("JWT_SECRET");

export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS });
}

export function verifyAccessToken(token: string): { userId: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId?: unknown };
        if (typeof decoded.userId !== "string") return null;
        return { userId: decoded.userId };
    } catch {
        return null;
    }
}

export function generateRefreshToken(): { raw: string; hash: string } {
    const raw = crypto.randomBytes(48).toString("base64url");
    return { raw, hash: hashRefreshToken(raw) };
}

export function hashRefreshToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}
