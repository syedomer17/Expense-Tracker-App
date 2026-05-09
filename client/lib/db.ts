import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var __mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.__mongooseCache ?? { conn: null, promise: null };
if (!globalThis.__mongooseCache) {
    globalThis.__mongooseCache = cached;
}

export async function ConnectDB(): Promise<typeof mongoose> {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI!, {
            bufferCommands: false,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}
