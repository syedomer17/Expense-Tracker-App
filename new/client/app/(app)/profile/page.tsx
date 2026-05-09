import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { serverFetch } from "@/lib/server-fetch";
import { initials, formatDate } from "@/lib/format";

export const metadata = { title: "Profile — Ledger" };
export const dynamic = "force-dynamic";

interface MeResponse {
    user: {
        id: string;
        name?: string | null;
        email: string;
        createdAt?: string;
    };
}

export default async function ProfilePage() {
    const { ok, data } = await serverFetch<MeResponse>("/api/user/me");
    if (!ok || !data) redirect("/login");
    const user = data.user;
    const displayName =
        (user.name && user.name.trim()) || user.email.split("@")[0] || "Account";

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                eyebrow="Account"
                title="Your profile"
                description="Update your details, manage your password, and keep your account secure."
            />

            <Card className="overflow-hidden border-border/60">
                <div className="h-24 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500" />
                <CardContent className="-mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-end gap-4">
                        <Avatar className="size-20 ring-4 ring-background">
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-semibold text-white">
                                {initials(displayName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5 pb-1">
                            <h2 className="text-lg font-semibold tracking-tight">{displayName}</h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    {user.createdAt ? (
                        <p className="text-xs text-muted-foreground">
                            Member since {formatDate(user.createdAt)}
                        </p>
                    ) : null}
                </CardContent>
            </Card>

            <Tabs defaultValue="account" className="w-full">
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="mt-4">
                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="text-base">Account details</CardTitle>
                            <CardDescription>
                                Update the name and email associated with your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProfileForm
                                initial={{ name: user.name ?? "", email: user.email }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="mt-4">
                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="text-base">Change password</CardTitle>
                            <CardDescription>
                                Use a strong password you&apos;re not using anywhere else.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PasswordForm />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
