import type { Metadata } from "next";
import { WishlistClient } from "@/components/wishlist/wishlist-client";

export const metadata: Metadata = {
    title: "Wishlist",
    description:
        "Plan and fund the things you want next. Track funding progress per item and celebrate completions.",
    alternates: { canonical: "/wishlist" },
    robots: { index: false, follow: false },
};

export default function WishlistPage() {
    return <WishlistClient />;
}
