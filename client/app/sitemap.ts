import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const base = siteConfig.url;

    return [
        {
            url: `${base}/`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 1,
        },
        {
            url: `${base}/login`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.6,
        },
        {
            url: `${base}/register`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.7,
        },
    ];
}
