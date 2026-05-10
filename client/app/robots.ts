import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/login", "/register"],
                disallow: [
                    "/api/",
                    "/dashboard",
                    "/expense",
                    "/income",
                    "/goals",
                    "/wishlist",
                    "/profile",
                    "/forgot-password",
                    "/reset-password",
                    "/verify-email",
                ],
            },
        ],
        sitemap: `${siteConfig.url}/sitemap.xml`,
        host: siteConfig.url,
    };
}
