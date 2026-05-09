import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    UserCircle,
    type LucideIcon,
} from "lucide-react";

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    description?: string;
}

export const PRIMARY_NAV: NavItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Overview of your finances",
    },
    {
        label: "Income",
        href: "/income",
        icon: TrendingUp,
        description: "Track money coming in",
    },
    {
        label: "Expenses",
        href: "/expense",
        icon: TrendingDown,
        description: "Track money going out",
    },
    {
        label: "Profile",
        href: "/profile",
        icon: UserCircle,
        description: "Manage your account",
    },
];
