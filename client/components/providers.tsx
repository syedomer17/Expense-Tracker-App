"use client";

import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <TooltipProvider delayDuration={200}>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        className:
                            "!bg-popover !text-popover-foreground !border !border-border/60 !shadow-lg",
                        success: { iconTheme: { primary: "#10b981", secondary: "white" } },
                        error: { iconTheme: { primary: "#ef4444", secondary: "white" } },
                    }}
                />
            </TooltipProvider>
        </ThemeProvider>
    );
}
