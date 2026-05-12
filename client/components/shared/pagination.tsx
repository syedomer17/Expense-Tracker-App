"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
    className?: string;
    siblingCount?: number;
}

function buildPageList(page: number, totalPages: number, siblings: number): (number | "ellipsis")[] {
    if (totalPages <= 1) return [1];
    const range: (number | "ellipsis")[] = [];
    const first = 1;
    const last = totalPages;
    const start = Math.max(first + 1, page - siblings);
    const end = Math.min(last - 1, page + siblings);

    range.push(first);
    if (start > first + 1) range.push("ellipsis");
    for (let i = start; i <= end; i++) range.push(i);
    if (end < last - 1) range.push("ellipsis");
    if (last > first) range.push(last);
    return range;
}

export function Pagination({
    page,
    totalPages,
    onPageChange,
    disabled = false,
    className,
    siblingCount = 1,
}: PaginationProps) {
    const pages = buildPageList(page, totalPages, siblingCount);
    const prevDisabled = disabled || page <= 1;
    const nextDisabled = disabled || page >= totalPages;

    return (
        <nav
            aria-label="Pagination"
            className={cn(
                "flex flex-wrap items-center justify-between gap-2 px-3 pt-3",
                className
            )}
        >
            <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2"
                    disabled={prevDisabled}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="size-3.5" />
                    <span className="hidden sm:inline">Previous</span>
                </Button>
                <div className="flex items-center gap-1">
                    {pages.map((p, idx) =>
                        p === "ellipsis" ? (
                            <span
                                key={`e-${idx}`}
                                className="px-1 text-xs text-muted-foreground"
                                aria-hidden="true"
                            >
                                …
                            </span>
                        ) : (
                            <Button
                                key={p}
                                variant={p === page ? "default" : "outline"}
                                size="sm"
                                className="h-8 min-w-8 px-2 text-xs tabular-nums"
                                disabled={disabled}
                                onClick={() => onPageChange(p)}
                                aria-current={p === page ? "page" : undefined}
                                aria-label={`Page ${p}`}
                            >
                                {p}
                            </Button>
                        )
                    )}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2"
                    disabled={nextDisabled}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Next page"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="size-3.5" />
                </Button>
            </div>
        </nav>
    );
}
