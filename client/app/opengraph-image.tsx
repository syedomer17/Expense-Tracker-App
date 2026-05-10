import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#fafaf9",
                    backgroundImage:
                        "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                    color: "#0a0a0a",
                    padding: "72px",
                    fontFamily: "ui-sans-serif, system-ui, sans-serif",
                }}
            >
                <div
                    style={{
                        fontSize: 28,
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                    }}
                >
                    {siteConfig.name}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div
                        style={{
                            fontSize: 88,
                            fontWeight: 500,
                            lineHeight: 1.02,
                            letterSpacing: "-0.045em",
                            maxWidth: 1000,
                            display: "flex",
                            flexWrap: "wrap",
                        }}
                    >
                        A quieter way to&nbsp;
                        <span
                            style={{
                                color: "#71717a",
                                fontStyle: "italic",
                            }}
                        >
                            track
                        </span>
                        &nbsp;your money.
                    </div>
                    <div
                        style={{
                            fontSize: 26,
                            color: "#52525b",
                            maxWidth: 880,
                            lineHeight: 1.4,
                        }}
                    >
                        {siteConfig.description}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 20,
                        color: "#71717a",
                        borderTop: "1px solid rgba(0,0,0,0.08)",
                        paddingTop: 22,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 999,
                                background: "#10b981",
                            }}
                        />
                        <span>{siteConfig.tagline}</span>
                    </div>
                    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                        {siteConfig.url.replace(/^https?:\/\//, "")}
                    </div>
                </div>
            </div>
        ),
        size
    );
}
