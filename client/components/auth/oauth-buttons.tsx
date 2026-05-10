import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

const REDIRECT_TO = "/api/auth/bridge?next=/dashboard";

function GitHubIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.92.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.95 10.95 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.13v3.16c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
    );
}

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1Z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.28-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
            />
            <path
                fill="#FBBC05"
                d="M5.85 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.35-2.1V7.07H2.18a11 11 0 0 0 0 9.86l3.67-2.84Z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.16-3.16C17.45 2.13 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.67 2.84C6.72 7.31 9.14 5.38 12 5.38Z"
            />
        </svg>
    );
}

export function OAuthButtons() {
    return (
        <div className="grid grid-cols-2 gap-2">
            <form
                action={async () => {
                    "use server";
                    await signIn("google", { redirectTo: REDIRECT_TO });
                }}
            >
                <Button
                    type="submit"
                    variant="outline"
                    size="lg"
                    className="h-11 w-full gap-2 text-sm font-medium"
                >
                    <GoogleIcon className="size-4" />
                    Google
                </Button>
            </form>
            <form
                action={async () => {
                    "use server";
                    await signIn("github", { redirectTo: REDIRECT_TO });
                }}
            >
                <Button
                    type="submit"
                    variant="outline"
                    size="lg"
                    className="h-11 w-full gap-2 text-sm font-medium"
                >
                    <GitHubIcon className="size-4" />
                    GitHub
                </Button>
            </form>
        </div>
    );
}

export function AuthDivider({ label = "or continue with email" }: { label?: string }) {
    return (
        <div className="relative my-1 flex items-center">
            <div className="flex-1 border-t border-border/60" />
            <span className="font-mono px-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {label}
            </span>
            <div className="flex-1 border-t border-border/60" />
        </div>
    );
}
