import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { serverFetch } from "@/lib/server-fetch";
import { initials, formatDate } from "@/lib/format";

export const metadata: Metadata = {
    title: "Profile",
    description:
        "Manage your account details, update your email, and change your password.",
    alternates: { canonical: "/profile" },
    robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

interface MeResponse {
    user: {
        id: string;
        name?: string | null;
        email: string;
        avatarUrl?: string | null;
        createdAt?: string;
        hasPassword?: boolean;
    };
}

export default async function ProfilePage() {
    const { ok, status, data } = await serverFetch<MeResponse>("/api/user/me");
    if (!ok && (status === 401 || status === 403)) redirect("/login");
    if (!data?.user) {
        throw new Error("Failed to load user profile");
    }
    const user = data.user;
    const displayName =
        (user.name && user.name.trim()) || user.email.split("@")[0] || "Account";
    const hasPassword = user.hasPassword !== false;

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                eyebrow="Account"
                title="Your profile"
                description="Manage your details and keep your account secure."
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <Card className="border-border/60">
                    <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
                        <Avatar className="size-20 ring-1 ring-border">
                            {user.avatarUrl ? (
                                <AvatarImage
                                    src={user.avatarUrl}
                                    alt={displayName}
                                    referrerPolicy="no-referrer"
                                />
                            ) : null}
                            <AvatarFallback className="bg-foreground text-2xl font-medium text-background">
                                {initials(displayName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h2 className="font-display text-xl font-normal leading-tight tracking-tight">
                                {displayName}
                            </h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </CardContent>
                    <Separator />
                    <CardContent className="space-y-3 py-5">
                        <DetailRow
                            icon={<Mail className="size-3.5" />}
                            label="Email"
                            value={user.email}
                        />
                        {user.createdAt ? (
                            <DetailRow
                                icon={<CalendarDays className="size-3.5" />}
                                label="Member since"
                                value={formatDate(user.createdAt)}
                            />
                        ) : null}
                        <DetailRow
                            icon={<ShieldCheck className="size-3.5" />}
                            label="Status"
                            value={<span className="text-emerald-600 dark:text-emerald-500">Active</span>}
                        />
                    </CardContent>
                </Card>

                <Tabs defaultValue="account" className="w-full">
                    <TabsList>
                        <TabsTrigger value="account">
                            <UserRound className="size-3.5" />
                            Account
                        </TabsTrigger>
                        {hasPassword ? (
                            <TabsTrigger value="security">
                                <KeyRound className="size-3.5" />
                                Security
                            </TabsTrigger>
                        ) : null}
                    </TabsList>

                    <TabsContent value="account" className="mt-4">
                        <Card className="border-border/60">
                            <CardHeader>
                                <CardTitle className="text-base font-medium">
                                    Account details
                                </CardTitle>
                                <CardDescription>
                                    Update the name and email associated with your account.
                                </CardDescription>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-6">
                                <ProfileForm
                                    initial={{ name: user.name ?? "", email: user.email }}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {hasPassword ? (
                        <TabsContent value="security" className="mt-4">
                            <Card className="border-border/60">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">
                                        Change password
                                    </CardTitle>
                                    <CardDescription>
                                        Use a strong password you&apos;re not using anywhere else.
                                    </CardDescription>
                                </CardHeader>
                                <Separator />
                                <CardContent className="pt-6">
                                    <PasswordForm />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ) : null}
                </Tabs>
            </div>
        </div>
    );
}

function DetailRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
                {icon}
                {label}
            </span>
            <span className="truncate text-right font-medium">{value}</span>
        </div>
    );
}
