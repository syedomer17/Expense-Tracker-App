import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
    eyebrow?: React.ReactNode;
}

export function PageHeader({
    title,
    description,
    actions,
    className,
    eyebrow,
}: PageHeaderProps) {
    return (
        <header
            className={cn(
                "flex flex-col gap-3 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
                className
            )}
        >
            <div className="space-y-1.5">
                {eyebrow ? (
                    <div className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                        {eyebrow}
                    </div>
                ) : null}
                <h1 className="font-display text-3xl font-normal leading-tight text-foreground sm:text-4xl">
                    {title}
                </h1>
                {description ? (
                    <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
                ) : null}
            </div>
            {actions ? (
                <div className="flex flex-wrap items-center gap-2">{actions}</div>
            ) : null}
        </header>
    );
}
