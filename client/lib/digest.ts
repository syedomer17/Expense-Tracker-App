import { format } from "date-fns";
import { sendEmail } from "@/lib/mailer";
import type { ProgressSummary } from "@/lib/savings";

function fmtUsd(n: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(n);
}

function paceLine(p: ProgressSummary): string {
    if (p.pace === "no-target") return "No target set yet.";
    if (p.pace === "ahead") return `Goal hit — ${fmtUsd(p.totals.savings - p.target)} over target.`;
    if (p.pace === "on-track") return `On track — ${fmtUsd(Math.abs(p.paceDelta))} ahead of pace.`;
    return `Behind pace by ${fmtUsd(Math.abs(p.paceDelta))}.`;
}

interface RenderArgs {
    appUrl: string;
    name: string;
    period: "day" | "week" | "month";
    progress: ProgressSummary;
    streak?: number;
}

function shell(args: { title: string; preheader: string; body: string; appUrl: string }): string {
    return `<!DOCTYPE html>
<html><body style="margin:0;padding:24px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#18181b;">
  <span style="display:none!important;opacity:0;color:transparent;">${args.preheader}</span>
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
    ${args.body}
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0 16px;" />
    <p style="margin:0;color:#71717a;font-size:12px;line-height:1.5;">
      You're getting this because email digests are on.
      <a href="${args.appUrl}/goals" style="color:#3f3f46;">Manage in Goals →</a>
    </p>
  </div>
</body></html>`;
}

function statRow(label: string, value: string): string {
    return `<tr>
        <td style="padding:8px 0;color:#71717a;font-size:13px;">${label}</td>
        <td style="padding:8px 0;text-align:right;font-size:14px;font-weight:600;font-variant-numeric:tabular-nums;">${value}</td>
      </tr>`;
}

function progressBar(percent: number | null): string {
    if (percent === null) return "";
    const clamped = Math.max(0, Math.min(120, percent));
    const fill = Math.min(100, clamped);
    const color = percent >= 100 ? "#10b981" : percent >= 75 ? "#0ea5e9" : "#f59e0b";
    return `<div style="margin:16px 0 4px;background:#f4f4f5;border-radius:6px;height:8px;overflow:hidden;">
        <div style="width:${fill}%;height:100%;background:${color};"></div>
      </div>
      <p style="margin:0;color:#71717a;font-size:12px;">${percent.toFixed(0)}% of target</p>`;
}

function renderDigestBody(a: RenderArgs): { subject: string; html: string; text: string } {
    const heading =
        a.period === "day"
            ? "Today's pace"
            : a.period === "week"
                ? "Your week in review"
                : "Your month in review";

    const subject = `${heading} · saved ${fmtUsd(a.progress.totals.savings)}`;

    const streakLine =
        a.streak && a.streak > 1
            ? `<p style="margin:16px 0 0;font-size:13px;color:#10b981;">${a.streak}-${a.period} streak — keep it going.</p>`
            : "";

    const body = `
    <p style="margin:0;color:#71717a;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;">${a.progress.window.label}</p>
    <h2 style="margin:6px 0 0;font-size:22px;font-weight:600;">${heading}</h2>
    <p style="margin:8px 0 0;color:#3f3f46;font-size:15px;line-height:1.5;">Hi ${a.name}, here's your snapshot.</p>

    <div style="margin:24px 0;padding:20px;border:1px solid #e4e4e7;border-radius:10px;">
      <p style="margin:0;color:#71717a;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;">Saved</p>
      <p style="margin:4px 0 0;font-size:32px;font-weight:700;font-variant-numeric:tabular-nums;">${fmtUsd(a.progress.totals.savings)}</p>
      ${a.progress.target > 0 ? `<p style="margin:4px 0 0;color:#52525b;font-size:13px;">Target: ${fmtUsd(a.progress.target)}</p>` : ""}
      ${progressBar(a.progress.percent)}
      <p style="margin:12px 0 0;color:#3f3f46;font-size:13px;">${paceLine(a.progress)}</p>
      ${streakLine}
    </div>

    <table style="width:100%;border-collapse:collapse;">
      ${statRow("Income", fmtUsd(a.progress.totals.income))}
      ${statRow("Expenses", fmtUsd(a.progress.totals.expense))}
      ${statRow("Net savings", fmtUsd(a.progress.totals.savings))}
    </table>

    <p style="margin:24px 0 0;">
      <a href="${a.appUrl}/dashboard" style="display:inline-block;padding:10px 16px;background:#18181b;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Open dashboard</a>
    </p>`;

    const text = `${heading} (${a.progress.window.label})

Saved: ${fmtUsd(a.progress.totals.savings)}${a.progress.target > 0 ? ` of ${fmtUsd(a.progress.target)} target` : ""}
${paceLine(a.progress)}
${a.streak && a.streak > 1 ? `Streak: ${a.streak} ${a.period}s\n` : ""}
Income: ${fmtUsd(a.progress.totals.income)}
Expenses: ${fmtUsd(a.progress.totals.expense)}
Net: ${fmtUsd(a.progress.totals.savings)}

${a.appUrl}/dashboard
Manage email digests: ${a.appUrl}/goals
`;

    return {
        subject,
        text,
        html: shell({
            title: heading,
            preheader: `${fmtUsd(a.progress.totals.savings)} saved · ${format(new Date(a.progress.window.start), "MMM d")}`,
            body,
            appUrl: a.appUrl,
        }),
    };
}

export async function sendDigestEmail(args: RenderArgs & { to: string }) {
    const { subject, html, text } = renderDigestBody(args);
    await sendEmail({ to: args.to, subject, html, text });
}

interface GoalHitArgs {
    to: string;
    appUrl: string;
    name: string;
    period: "week" | "month";
    progress: ProgressSummary;
    streak?: number;
}

function renderGoalHitBody(a: GoalHitArgs): { subject: string; html: string; text: string } {
    const periodLabel = a.period === "week" ? "weekly" : "monthly";
    const heading = `You hit your ${periodLabel} goal! 🎉`;
    const subject = `Congrats — ${periodLabel} goal hit (${fmtUsd(a.progress.totals.savings)} saved)`;
    const over = a.progress.totals.savings - a.progress.target;

    const streakLine =
        a.streak && a.streak > 1
            ? `<p style="margin:16px 0 0;font-size:13px;color:#10b981;">${a.streak}-${a.period} streak — keep it going.</p>`
            : "";

    const body = `
    <p style="margin:0;color:#10b981;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;">${a.progress.window.label}</p>
    <h2 style="margin:6px 0 0;font-size:22px;font-weight:600;">${heading}</h2>
    <p style="margin:8px 0 0;color:#3f3f46;font-size:15px;line-height:1.5;">Nice work, ${a.name}. You crossed your ${periodLabel} savings target${over > 0 ? ` by ${fmtUsd(over)}` : ""}.</p>

    <div style="margin:24px 0;padding:20px;border:1px solid #d1fae5;background:#ecfdf5;border-radius:10px;">
      <p style="margin:0;color:#047857;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;">Saved</p>
      <p style="margin:4px 0 0;font-size:32px;font-weight:700;font-variant-numeric:tabular-nums;color:#065f46;">${fmtUsd(a.progress.totals.savings)}</p>
      <p style="margin:4px 0 0;color:#047857;font-size:13px;">Target: ${fmtUsd(a.progress.target)}</p>
      ${progressBar(a.progress.percent)}
      ${streakLine}
    </div>

    <table style="width:100%;border-collapse:collapse;">
      ${statRow("Income", fmtUsd(a.progress.totals.income))}
      ${statRow("Expenses", fmtUsd(a.progress.totals.expense))}
      ${statRow("Net savings", fmtUsd(a.progress.totals.savings))}
    </table>

    <p style="margin:24px 0 0;">
      <a href="${a.appUrl}/goals" style="display:inline-block;padding:10px 16px;background:#10b981;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">See your progress</a>
    </p>`;

    const text = `${heading} (${a.progress.window.label})

You crossed your ${periodLabel} savings target${over > 0 ? ` by ${fmtUsd(over)}` : ""}.

Saved: ${fmtUsd(a.progress.totals.savings)} of ${fmtUsd(a.progress.target)} target
${a.streak && a.streak > 1 ? `Streak: ${a.streak} ${a.period}s\n` : ""}
Income: ${fmtUsd(a.progress.totals.income)}
Expenses: ${fmtUsd(a.progress.totals.expense)}
Net: ${fmtUsd(a.progress.totals.savings)}

${a.appUrl}/goals
`;

    return {
        subject,
        text,
        html: shell({
            title: heading,
            preheader: `${fmtUsd(a.progress.totals.savings)} saved · target hit`,
            body,
            appUrl: a.appUrl,
        }),
    };
}

export async function sendGoalHitEmail(args: GoalHitArgs) {
    const { subject, html, text } = renderGoalHitBody(args);
    await sendEmail({ to: args.to, subject, html, text });
}

interface WishlistCompletedArgs {
    to: string;
    appUrl: string;
    name: string;
    itemName: string;
    targetAmount: number;
    savedAmount: number;
}

export async function sendWishlistCompletedEmail(args: WishlistCompletedArgs) {
    const heading = `You've fully funded "${args.itemName}" 🎉`;
    const subject = `Saved up for ${args.itemName} — ${fmtUsd(args.savedAmount)}`;
    const over = args.savedAmount - args.targetAmount;

    const body = `
    <p style="margin:0;color:#10b981;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;">Wishlist</p>
    <h2 style="margin:6px 0 0;font-size:22px;font-weight:600;">${heading}</h2>
    <p style="margin:8px 0 0;color:#3f3f46;font-size:15px;line-height:1.5;">Nice work, ${args.name}. You've put aside enough to cover this purchase${over > 0 ? ` — and then some (${fmtUsd(over)} extra)` : ""}.</p>

    <div style="margin:24px 0;padding:20px;border:1px solid #d1fae5;background:#ecfdf5;border-radius:10px;">
      <p style="margin:0;color:#047857;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;">Saved</p>
      <p style="margin:4px 0 0;font-size:32px;font-weight:700;font-variant-numeric:tabular-nums;color:#065f46;">${fmtUsd(args.savedAmount)}</p>
      <p style="margin:4px 0 0;color:#047857;font-size:13px;">Goal: ${fmtUsd(args.targetAmount)}</p>
      <div style="margin:16px 0 0;background:#d1fae5;border-radius:6px;height:8px;overflow:hidden;">
        <div style="width:100%;height:100%;background:#10b981;"></div>
      </div>
    </div>

    <p style="margin:24px 0 0;">
      <a href="${args.appUrl}/wishlist" style="display:inline-block;padding:10px 16px;background:#10b981;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Open wishlist</a>
    </p>`;

    const text = `${heading}

You've put aside ${fmtUsd(args.savedAmount)} of your ${fmtUsd(args.targetAmount)} goal for ${args.itemName}.${over > 0 ? ` That's ${fmtUsd(over)} over.` : ""}

${args.appUrl}/wishlist
`;

    await sendEmail({
        to: args.to,
        subject,
        text,
        html: shell({
            title: heading,
            preheader: `${fmtUsd(args.savedAmount)} saved · ${args.itemName} fully funded`,
            body,
            appUrl: args.appUrl,
        }),
    });
}

export function appUrlFromRequest(request: Request): string {
    const fromEnv = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
    if (fromEnv) return fromEnv.replace(/\/$/, "");
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return host ? `${proto}://${host}` : "";
}

export function isAuthorizedCron(request: Request): boolean {
    const expected = process.env.CRON_SECRET;
    if (!expected) return false;
    const header = request.headers.get("authorization");
    if (header === `Bearer ${expected}`) return true;
    const url = new URL(request.url);
    return url.searchParams.get("secret") === expected;
}
