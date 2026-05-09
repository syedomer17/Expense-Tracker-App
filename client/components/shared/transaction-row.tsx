"use client";

import * as React from "react";
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";

export interface TransactionRowItem {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string | Date;
    type: "income" | "expense";
}

interface TransactionRowProps {
    transaction: TransactionRowItem;
    onEdit?: (t: TransactionRowItem) => void;
    onDelete?: (t: TransactionRowItem) => void;
    showActions?: boolean;
    className?: string;
}

export function TransactionRow({
    transaction,
    onEdit,
    onDelete,
    showActions = true,
    className,
}: TransactionRowProps) {
    const isIncome = transaction.type === "income";

    return (
        <div
            className={cn(
                "group flex items-center gap-3 rounded-lg border border-transparent px-3 py-3 transition hover:border-border/60 hover:bg-muted/40",
                className
            )}
        >
            <Avatar
                className={cn(
                    "size-9 rounded-xl",
                    isIncome
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}
            >
                <AvatarFallback className="bg-transparent">
                    {isIncome ? (
                        <ArrowDownLeft className="size-4" />
                    ) : (
                        <ArrowUpRight className="size-4" />
                    )}
                </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                        {transaction.description}
                    </p>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="rounded-md px-1.5 py-0 text-[10px]">
                        {transaction.category}
                    </Badge>
                    <span aria-hidden>•</span>
                    <span className="tabular-nums">{formatDate(transaction.date)}</span>
                </div>
            </div>

            <div
                className={cn(
                    "shrink-0 text-right text-sm font-semibold tabular-nums",
                    isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                )}
            >
                {isIncome ? "+" : "−"}
                {formatCurrency(transaction.amount)}
            </div>

            {showActions && (onEdit || onDelete) ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="More options"
                            className="opacity-0 transition group-hover:opacity-100 data-[state=open]:opacity-100"
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {onEdit ? (
                            <DropdownMenuItem onClick={() => onEdit(transaction)}>
                                Edit
                            </DropdownMenuItem>
                        ) : null}
                        {onEdit && onDelete ? <DropdownMenuSeparator /> : null}
                        {onDelete ? (
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete(transaction)}
                            >
                                Delete
                            </DropdownMenuItem>
                        ) : null}
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : null}
        </div>
    );
}
