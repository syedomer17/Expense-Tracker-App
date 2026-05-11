# Expense Tracker App

A personal finance tracker built as a single Next.js 16 application — track daily expenses and incomes, set savings goals, manage a wishlist, and receive daily / weekly / monthly email digests. Authentication supports email/password (with OTP verification + JWT refresh tokens) as well as Google and GitHub OAuth.

Live: https://goals.syedomer.me

---

## Features

* Add / edit / delete expenses and incomes with categories and notes
* Filter by date range, category, and free-text search
* Dashboard with totals, top categories, and time-series charts
* Excel (`.xlsx`) export for both expenses and incomes
* Savings goals with progress tracking and email notifications on goal hit
* Wishlist with funding progress and completion notifications
* Email/password auth with OTP email verification and password reset flows
* Google and GitHub OAuth via NextAuth v5
* Short-lived JWT access tokens + httpOnly refresh tokens (rotation on use)
* Daily / weekly / monthly digest emails via Vercel Cron
* Mobile-friendly responsive UI with light/dark themes

---

## Tech stack

* **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
* **Styling**: Tailwind CSS 4 + shadcn/ui + Radix primitives
* **Database**: MongoDB via Mongoose
* **Auth**: NextAuth v5 (Google + GitHub) + custom JWT/refresh-token flow with `bcryptjs` and `jsonwebtoken`
* **Email**: Nodemailer (SMTP)
* **Charts**: Recharts
* **Exports**: `xlsx` (SheetJS)
* **Scheduled jobs**: Vercel Cron (daily / weekly / monthly digest emails)
* **Hosting**: Vercel

---

## Repo structure

```
root
├─ client/                    # Next.js 16 app (the entire application)
│  ├─ app/
│  │  ├─ (app)/               # Authenticated app routes
│  │  ├─ (auth)/               # Login / register / verify / reset flows
│  │  └─ api/                 # Route handlers
│  │     ├─ auth/             # NextAuth + bridge routes
│  │     ├─ cron/             # Daily / weekly / monthly digests
│  │     ├─ dashboard/        # Dashboard summary
│  │     ├─ expense/          # CRUD + overview + xlsx export
│  │     ├─ income/           # CRUD + overview + xlsx export
│  │     ├─ goals/            # Savings goals + progress
│  │     ├─ wishlist/         # Wishlist items
│  │     └─ user/             # Profile, password, OTP, refresh
│  ├─ components/             # UI components (shadcn/ui + custom)
│  ├─ lib/                    # DB, mailer, digests, helpers
│  ├─ models/                 # Mongoose schemas
│  ├─ utils/                  # Token helpers, date ranges
│  ├─ auth.ts                 # NextAuth config
│  ├─ vercel.json             # Cron schedules
│  ├─ .env.example
│  └─ package.json
├─ LICENSE
└─ README.md
```

---

## Getting started

Prerequisites: Node.js 20+, pnpm (recommended) or npm, and a MongoDB Atlas cluster (or any MongoDB instance).

### 1) Clone and install

```bash
git clone <repo-url>
cd Expense-Tracker-App/client
pnpm install      # or: npm install
```

### 2) Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

See **Environment variables** below for the full list.

### 3) Run the dev server

```bash
pnpm dev          # or: npm run dev
```

Open http://localhost:3000.

### 4) Production build

```bash
pnpm build && pnpm start
```

---

## Environment variables

All variables live in `client/.env`. A template is provided at `client/.env.example`.

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Signs the app's own short-lived access tokens |
| `SMTP_HOST` | yes | SMTP host for OTP / digest / notification emails |
| `SMTP_PORT` | yes | SMTP port (`465` for TLS, `587` for STARTTLS) |
| `SMTP_USER` | yes | SMTP username |
| `SMTP_PASS` | yes | SMTP password / app password |
| `SMTP_FROM` | no | Display name for outgoing email; defaults to `SMTP_USER` |
| `AUTH_SECRET` | yes | NextAuth session secret |
| `AUTH_GOOGLE_ID` | yes (for Google) | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | yes (for Google) | Google OAuth client secret |
| `AUTH_GITHUB_ID` | yes (for GitHub) | GitHub OAuth app ID |
| `AUTH_GITHUB_SECRET` | yes (for GitHub) | GitHub OAuth app secret |
| `NEXTAUTH_URL` | yes (prod) | Public URL of the deployed app |
| `CRON_SECRET` | yes (for cron) | Bearer token Vercel sends to `/api/cron/*` |
| `NEXT_PUBLIC_APP_URL` | recommended | Public app URL — used by digest emails to build absolute links |
| `APP_URL` | optional | Server-only fallback for `NEXT_PUBLIC_APP_URL` |

`NODE_ENV` and `VERCEL_URL` are runtime-provided and do not need to be set manually.

---

## Key API routes

All routes live under `client/app/api/` and are relative to the app's origin.

### Auth & user

* `POST /api/user/register` — create account, sends OTP email
* `POST /api/user/verify-email` — verify email with OTP
* `POST /api/user/resend-verification` — resend verification OTP
* `POST /api/user/login` — sets access + refresh cookies
* `POST /api/user/logout` — clears cookies, revokes refresh token
* `POST /api/user/refresh` — rotates access + refresh tokens
* `POST /api/user/forgot-password` — sends reset OTP
* `POST /api/user/reset-password` — reset password with OTP
* `GET /api/user/me` — current user profile
* `PATCH /api/user/profile` — update name / email
* `POST /api/user/password` — change password
* `GET|POST /api/auth/[...nextauth]` — NextAuth (Google / GitHub)

### Expenses & incomes

* `GET /api/expense/getexpense` — list / filter
* `POST /api/expense/addexpense`
* `PUT /api/expense/updateexpense/:id`
* `DELETE /api/expense/deleteexpense/:id`
* `GET /api/expense/overview` — aggregated metrics
* `GET /api/expense/downloadexcel` — `.xlsx` export
* (Same shape under `/api/income/...`)

### Dashboard, goals, wishlist

* `GET /api/dashboard` — combined summary
* `GET|PUT /api/goals` — savings goal settings
* `GET /api/goals/progress` — progress + history
* `GET|POST /api/wishlist` — list / create wishlist items
* `PATCH|DELETE /api/wishlist/:id` — update / delete item

### Cron (require `Authorization: Bearer ${CRON_SECRET}`)

* `GET /api/cron/daily-digest` — daily summary email
* `GET /api/cron/weekly-digest` — weekly summary email
* `GET /api/cron/monthly-digest` — monthly summary email

Cron schedules are declared in `client/vercel.json`.

---

## Authentication flow

* **Email/password**: registration creates an unverified user and sends an OTP email. After verifying, login issues a short-lived JWT access token (15 min) and an httpOnly refresh token (7 days). `/api/user/refresh` rotates both.
* **OAuth**: Google and GitHub via NextAuth v5. On first sign-in, a verified user is created automatically (no OTP needed since the provider already verified the email).
* Both flows resolve to a single `User` document keyed by lowercased email.

---

## Deployment

The app is designed for Vercel:

1. Import the repo into Vercel (point the project at the `client/` directory).
2. Add every variable from `.env.example` to the Vercel project settings.
3. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production URL.
4. Vercel automatically picks up the cron schedules from `client/vercel.json` and sends `Authorization: Bearer ${CRON_SECRET}` on each invocation.

---

## Roadmap

* CSV export alongside Excel
* Recurring expense reminders
* Budget alerts (threshold notifications)
* Shared spaces (family / team budgets)
* Receipt image upload + OCR

---

## Contributing

Issues and PRs are welcome. For larger changes, open an issue first to discuss the approach.

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Contact

Built by Syed Omer Ali. Reach out via the repo issues page.
