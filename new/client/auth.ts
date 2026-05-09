import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import User from "@/models/userModel";
import { ConnectDB } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
    secret: process.env.AUTH_SECRET,
    session: { strategy: "jwt" },
    providers: [Google, GitHub],
    callbacks: {
        async signIn({ user }) {
            const email = user.email?.toLowerCase().trim();
            if (!email) return false;

            await ConnectDB();
            const existing = await User.findOne({ email });
            if (existing) {
                if (!existing.emailVerified) {
                    existing.emailVerified = true;
                    await existing.save({ validateModifiedOnly: true });
                }
                return true;
            }

            const fallbackName =
                (user.name && user.name.trim()) || email.split("@")[0] || "User";
            await User.create({
                name: fallbackName.slice(0, 100),
                email,
                emailVerified: true,
            });
            return true;
        },
        async jwt({ token }) {
            if (!token.userId && token.email) {
                await ConnectDB();
                const dbUser = await User.findOne({
                    email: String(token.email).toLowerCase(),
                })
                    .select("_id")
                    .lean();
                if (dbUser) {
                    token.userId = String(dbUser._id);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token.userId && session.user) {
                (session.user as { id?: string }).id = String(token.userId);
            }
            return session;
        },
    },
});
