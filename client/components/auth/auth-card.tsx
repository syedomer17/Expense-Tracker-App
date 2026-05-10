import * as React from "react";

interface AuthCardProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    eyebrow?: React.ReactNode;
}

export function AuthCard({
    title,
    description,
    children,
    footer,
    eyebrow,
}: AuthCardProps) {
    return (
        <div className="space-y-7">
            <header className="space-y-3">
                {eyebrow ? (
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {eyebrow}
                    </p>
                ) : null}
                <h1 className="font-display text-[2.4rem] font-normal leading-[1.05] tracking-tight sm:text-[2.6rem]">
                    {title}
                </h1>
                {description ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </header>

            <div className="space-y-4">{children}</div>

            {footer ? (
                <div className="border-t border-border/60 pt-5 text-center text-xs text-muted-foreground">
                    {footer}
                </div>
            ) : null}
        </div>
    );
}
