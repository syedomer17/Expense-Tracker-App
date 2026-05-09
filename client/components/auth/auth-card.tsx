import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-2">
                <CardTitle className="font-display text-3xl font-normal leading-tight">
                    {title}
                </CardTitle>
                {description ? (
                    <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                        {description}
                    </CardDescription>
                ) : null}
            </CardHeader>
            <CardContent className="space-y-4">{children}</CardContent>
            {footer ? (
                <div className="border-t border-border/60 px-6 py-3 text-center text-xs text-muted-foreground">
                    {footer}
                </div>
            ) : null}
        </Card>
    );
}
