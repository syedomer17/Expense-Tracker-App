import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/30 px-6 py-12 text-center",
                className
            )}
        >
            {icon ? (
                <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    {icon}
                </div>
            ) : null}
            <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                {description ? (
                    <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
            {action ? <div className="pt-1">{action}</div> : null}
        </div>
    );
}
