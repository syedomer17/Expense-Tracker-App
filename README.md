# Expense Tracker App (MERN)

A simple, fast, and personal Expense Tracker built with the MERN stack — created to track daily small expenses, upload receipts, and export reports. This repo contains a full-stack app (frontend + backend) with authentication, file upload, security middleware, and export features (CSV / PDF planned & PDF implemented).

---

## Features

* Add / edit / delete expenses and incomes
* Upload receipt images (Multer)
* Filter by date range and category
* Dashboard with total spend and top categories
* Authentication (JWT access + refresh tokens stored in httpOnly cookies)
* Password reset and email confirmation (Nodemailer)
* Basic analytics: monthly totals and category breakdown
* Rate limiting and security middleware
* PDF export: download all expenses & income as a single PDF with a click
* Mobile-friendly responsive UI + basic dark mode
* Small experiment with Node cluster + worker\_threads for report exports

---

## Tech stack

**Frontend**

* React (JavaScript)
* Tailwind CSS
* shadcn/ui

**Backend**

* Node.js + Express
* MongoDB (Mongoose)
* Multer (file uploads)
* Nodemailer (emails)
* jsonwebtoken (JWT)
* worker\_threads (export experiments)

---

## Repo structure (recommended)

```
root
├─ client/             # React frontend
│  ├─ public/
│  └─ src/
│     ├─ components/
│     ├─ pages/
│     └─ utils/
├─ server/             # Express backend
│  ├─ config/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ services/
│  └─ utils/
├─ .env.example
└─ README.md
```

---

## Getting started

> These instructions assume you have Node.js and npm/yarn installed.

### 1) Clone the repo

```bash
git clone <repo-url>
cd <repo-folder>
```

### 2) Backend setup

```bash
cd server
cp .env.example .env
# edit .env with your values
npm install
npm run dev    # or: npm run start (for production)
```

**Typical server scripts (package.json)**

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node dist/index.js",
    "build": "...",
    "test": "..."
  }
}
```

### 3) Frontend setup

```bash
cd ../client
npm install
npm run dev
# or `npm run build` + `npm run start` for production frontend
```

---

## Environment variables (.env.example)

```
# Server
PORT=3000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/expense-tracker?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=yourpassword
FROM_EMAIL=no-reply@example.com

# File uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5000000

# Other
CLIENT_URL=http://localhost:5173
```

Adjust values to your environment and never commit `.env` to Git.

---

## Key endpoints (example)

> All endpoints are relative to `http://localhost:3000` (or your `PORT`)

### Auth

* `POST /api/auth/register` — Register new user
* `POST /api/auth/login` — Login (sets httpOnly cookies)
* `POST /api/auth/logout` — Logout (clears cookies)
* `POST /api/auth/refresh` — Refresh access token
* `POST /api/auth/forgot-password` — Request password reset
* `POST /api/auth/reset-password` — Reset password

### Expenses

* `GET /api/expenses` — List expenses (query: from, to, category, page)
* `POST /api/expenses` — Create expense (supports `multipart/form-data` with receipt)
* `GET /api/expenses/:id` — Get single expense
* `PUT /api/expenses/:id` — Update expense
* `DELETE /api/expenses/:id` — Delete expense

### Exports

* `GET /api/exports/pdf?from=YYYY-MM-DD&to=YYYY-MM-DD` — Generate & download PDF of expenses & income
* `GET /api/exports/csv?from=...` — (planned) CSV export

### Other

* `GET /api/dashboard/summary` — Monthly totals, top categories

---

## PDF Download feature

The app supports generating a PDF that includes all expenses and incomes in a date range. The frontend provides a **Download** button which calls the backend export endpoint (`/api/exports/pdf`). The server prepares the PDF (using a library such as `pdfkit`, `puppeteer`, or `html-pdf`) and responds with a file attachment. The browser then downloads the PDF on click.

**Example server-side flow (pseudo)**

```js
// controller
export const downloadPdf = async (req, res) => {
  const { from, to } = req.query;
  const data = await Expense.find({ date: { $gte: from, $lte: to }, user: req.user.id });
  const pdfBuffer = await buildPdfFromData(data); // pdf generation util
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="expenses.pdf"');
  res.send(pdfBuffer);
};
```

**Frontend**: call the endpoint and trigger a download using `fetch` with `blob()` or an anchor link to the endpoint (if using cookies for auth, make sure to include credentials).

```js
// example (frontend)
const handleDownload = async () => {
  const res = await fetch(`/api/exports/pdf?from=${from}&to=${to}`, { credentials: 'include' });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'expenses.pdf';
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## Authentication flow

* Login returns a short-lived access token and a long-lived refresh token.
* Access token is sent as a Bearer token in `Authorization` headers for APIs OR the backend reads it from an httpOnly cookie.
* Refresh token is stored in httpOnly cookie; refresh endpoint rotates tokens.
* Protect routes with `authMiddleware` that verifies the access token and loads `req.user`.

---

## Database (simple models)

**User** (example)

```js
{
  _id,
  name,
  email,
  passwordHash,
  avatarUrl,
  createdAt
}
```

**Expense**

```js
{
  _id,
  user: ObjectId(ref: 'User'),
  amount: Number,
  type: 'expense' | 'income',
  category: String,
  tags: [String],
  note: String,
  date: Date,
  receiptUrl: String,
  createdAt: Date
}
```

---

## Security & production notes

* Use strong JWT secrets and rotate them when needed.
* Serve cookies with `httpOnly`, `secure` flags (secure in production with HTTPS), and proper `SameSite` policy.
* Enable rate limiting, helmet, and input validation (e.g., `express-validator` or `zod`).
* Store uploads in a cloud bucket (S3/GCS) for production instead of local disk.
* Use HTTPS for production; set `COOKIE_SECURE=true` and `COOKIE_DOMAIN` accordingly.

---

## Development tips

* Keep middleware small and focused — auth, validation, error handling, rate limiting.
* Write small utilities early (date helpers, number formatting) to avoid duplication.
* Use feature flags or env toggles for experimental multithreading or cluster setups.

---

## Roadmap / Planned features

* Recurring expense reminders
* Budget alerts (threshold-based notifications)
* Shared spaces (family/team budgets)
* Better analytics (weekly trends, burn rate)
* CSV/Excel export and scheduled exports

---

## Contributing

Contributions, feedback and suggestions are welcome! Create an issue or open a PR. If you want a code review, ping me and I’ll share the repo link.

---

## License

MIT — feel free to use and modify.

---

## Contact

If you'd like to try the app, test features, or collaborate — open an issue or reach out via your repo profile.

Happy building! 🚀
