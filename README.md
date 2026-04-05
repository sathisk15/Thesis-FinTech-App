# Thesis Fintech App

A full-stack banking/fintech web application built for thesis research on the **cumulative impact of performance and security optimizations**. The app is a realistic banking dashboard — accounts, transfers, payments, transactions, and analytics — used to measure and compare Lighthouse scores and Playwright E2E timings across three progressively-optimized implementation variants (V1 baseline → V2 performance → V3 security).

**Research question:** How do layered React performance techniques and backend security hardening affect Lighthouse scores and end-to-end interaction timings — individually and combined?

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
3. [Environment Setup](#3-environment-setup)
4. [Database Seeding](#4-database-seeding)
5. [Running the App](#5-running-the-app)
6. [Tech Stack](#6-tech-stack)
7. [Thesis Variants](#7-thesis-variants)
8. [Running Audits](#8-running-audits)
9. [Reports](#9-reports)
10. [API Endpoints](#10-api-endpoints)
11. [Project Structure](#11-project-structure)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | ES modules (`"type": "module"`) required |
| npm | bundled with Node | Used for all installs and scripts |
| Git | any | For cloning the repo |

No Docker. No external database. SQLite is bundled.

---

## 2. Installation

```bash
git clone <repo-url>
cd thesis-fintech-app

# Root — audit scripts, Playwright, Lighthouse, pipeline utilities
npm install

# Frontend — React app and its dependencies
npm install --prefix frontend

# Backend — Express API and its dependencies
npm install --prefix backend
```

After install, install Playwright browsers (one-time):

```bash
npx playwright install --config=playwright/playwright.config.js
```

---

## 3. Environment Setup

```bash
cp .env.example .env
```

The app reads all configuration from `.env`. The table below covers every variable.

> **Do not commit `.env`** — it contains credentials.

| Variable | Default | Description | Safe to change? |
|----------|---------|-------------|----------------|
| `SEED_DB_SEED` | `thesis-fintech-base-v1` | Deterministic seed key used to generate reproducible database content | **NO** — changing it invalidates all historical comparisons |
| `SEED_USER_EMAIL` | `sathis@gmail.com` | Email address for the seeded test user | Yes — also update `LIGHTHOUSE_EMAIL` and `PLAYWRIGHT_EMAIL` |
| `SEED_USER_PASSWORD` | `123` | Password for the seeded test user | Yes — also update `LIGHTHOUSE_PASSWORD` and `PLAYWRIGHT_PASSWORD` |
| `SEED_USER_FIRSTNAME` | `Sathiskumar` | First name stored in the seeded user row | Yes |
| `SEED_USER_LASTNAME` | `Ravichandran` | Last name stored in the seeded user row | Yes |
| `SEED_USER_CONTACT` | `+48 989876972` | Contact number stored in the seeded user row | Yes |
| `SEED_USER_COUNTRY` | `Poland` | Country stored in the seeded user row | Yes |
| `SEED_USER_CURRENCY` | `EUR` | Default currency for the seeded user | Yes |
| `DB_VERBOSE` | `false` | Set `true` to log every SQLite query to stdout | Yes |
| `LIGHTHOUSE_BASE_URL` | `http://localhost:5173` | Frontend URL that Lighthouse audits | Yes — must match where Vite is running |
| `LIGHTHOUSE_DEBUG_PORT` | `9222` | Chrome remote debugging port used by Puppeteer for auth | **Do not change** — hard-coded in Lighthouse runner |
| `LIGHTHOUSE_EMAIL` | `sathis@gmail.com` | Credentials Lighthouse uses to authenticate | Must match `SEED_USER_EMAIL` |
| `LIGHTHOUSE_PASSWORD` | `123` | Credentials Lighthouse uses to authenticate | Must match `SEED_USER_PASSWORD` |
| `LIGHTHOUSE_RUNS` | `1` | Number of Lighthouse runs per page (increase for statistical stability) | Yes |
| `LIGHTHOUSE_OUTPUT_FILE` | `performance_metrics.json` | Intermediate output filename (internal to the script) | Yes |
| `THESIS_VARIANT` | `base` | Labels which variant is being measured — appears in report filenames | Yes — `base`, `base-performance`, or `base-performance-security` |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:5173` | Frontend URL for Playwright tests | Yes — must match running app |
| `PLAYWRIGHT_EMAIL` | `sathis@gmail.com` | Credentials Playwright uses to log in | Must match `SEED_USER_EMAIL` |
| `PLAYWRIGHT_PASSWORD` | `123` | Credentials Playwright uses to log in | Must match `SEED_USER_PASSWORD` |
| `PLAYWRIGHT_REPEAT_EACH` | `1` | Test repetitions per spec (set to `3` or more for thesis runs) | Yes — more repetitions produce better `p95_ms` statistics |
| `PLAYWRIGHT_RESULTS_LABEL` | `base` | Prefix for report filenames (e.g. `base.auth.performance.json`) | Yes — typically set equal to `THESIS_VARIANT` |

---

## 4. Database Seeding

```bash
npm run seed:db
```

- Creates (or resets) `backend/db/banking_app.db` — a local SQLite file
- Creates the seeded user, multiple accounts with starting balances, and a large set of transactions
- **Deterministic:** the same `SEED_DB_SEED` key always produces identical data, ensuring reproducible audit results across machines and sessions
- Must re-run if:
  - You change `SEED_DB_SEED` (not recommended)
  - You change any `SEED_USER_*` variable
  - The database schema changes
  - You want to reset all transaction data to its original state

---

## 5. Running the App

```bash
npm run dev
```

Starts both servers concurrently:

| Service | URL | Notes |
|---------|-----|-------|
| Frontend (React + Vite) | `http://localhost:5173` | Hot module replacement enabled |
| Backend (Express API) | `http://localhost:4000/api` | Auto-restarts on change via Nodemon |

**Default login credentials:** `sathis@gmail.com` / `123`

Start each service individually if needed:

```bash
npm run client   # frontend only
npm run server   # backend only (Nodemon auto-restart)
```

---

## 6. Tech Stack

### Frontend (`frontend/`)

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19.2.0 | UI library |
| React Router | 7.13.0 | Client-side routing |
| Vite | 7.3.1 | Build tool and dev server |
| Tailwind CSS | 4.2.0 | Utility-first styling |
| Zustand | 5.0.11 | Global state management |
| Recharts | 3.7.0 | Charts and data visualization |
| Axios | 1.13.5 | HTTP client (configured instance in `frontend/src/api/axios.js`) |
| react-icons | 5.5.0 | Icon library |

### Backend (`backend/`)

| Library | Version | Purpose |
|---------|---------|---------|
| Express | 5.2.1 | HTTP server and routing |
| better-sqlite3 | 12.6.2 | Synchronous SQLite driver |
| jsonwebtoken | ^9.0.3 | JWT generation and verification |
| bcrypt | ^6.0.0 | Password hashing |
| cors | ^2.8.6 | Cross-origin request configuration |

### Auditing & Testing

| Tool | Version | Purpose |
|------|---------|---------|
| @playwright/test | ^1.58.2 | E2E performance timing tests |
| lighthouse | ^13.0.3 | Page performance scoring |
| puppeteer | ^24.38.0 | Chrome automation for Lighthouse auth |
| axios | ^1.13.6 | Used by pipeline scripts |
| concurrently | ^9.2.1 | Run frontend + backend together |
| nodemon | ^3.1.14 | Backend auto-restart during development |

---

## 7. Thesis Variants

All three variants share the same codebase. The `THESIS_VARIANT` env var labels which version is being measured. Each variant is **cumulative** — V3 includes everything from V1 and V2.

| # | Label | Description |
|---|-------|-------------|
| V1 | `base` | Baseline — no optimizations. Deliberately unoptimized to represent the worst-case starting point |
| V2 | `base-performance` | V1 + React performance techniques P1–P8 |
| V3 | `base-performance-security` | V2 + Backend security techniques S1–S10 |

### Performance Techniques (V2: P1–P8)

| ID | Technique | Applied To |
|----|-----------|-----------|
| P1 | `React.memo` on all 12 dashboard sub-components | `dashboard/components/` |
| P2 | `useMemo` for KPIs, chart data, filtered arrays | `DashboardPage.jsx` |
| P3 | `useCallback` for all filter handlers | `DashboardPage.jsx` |
| P4 | `React.lazy` + `Suspense` on all 8 route imports | `frontend/src/app/router.jsx` |
| P5 | Code splitting via lazy imports (same as P4) | `frontend/src/app/router.jsx` |
| P6 | `react-window` `FixedSizeList` for list virtualization | `TransactionsPage.jsx` |
| P7 | 300ms debounce on transaction search input | `TransactionsPage.jsx` |
| P8 | Dynamic `import()` for non-critical heavy modules | Large icon/chart imports |

### Security Techniques (V3: S1–S10)

| ID | Technique | Applied To |
|----|-----------|-----------|
| S1 | `helmet()` — HTTP security headers | `backend/app.js` |
| S2 | `helmet.contentSecurityPolicy()` — CSP whitelist | `backend/app.js` |
| S3 | `express-rate-limit` — 10 req / 15 min on auth routes | `backend/app.js` |
| S4 | `express-validator` — input validation on all POST/PUT routes | All auth + account + payment routes |
| S5 | JWT secret from `process.env.JWT_SECRET` (no hardcoded secret) | `auth.middleware.js`, `auth.controller.js` |
| S6 | JWT expiry `15m` + refresh token endpoint | `auth.controller.js` |
| S7 | JWT in HttpOnly + Secure + SameSite=Strict cookie | `auth.controller.js`, `axios.js`, `useAuthStore.js` |
| S8 | CSRF protection via SameSite=Strict cookie (from S7) | `backend/app.js` |
| S9 | `DOMPurify` sanitization of all user-controlled strings | `TransactionsPage.jsx`, `AccountsPage.jsx`, `DashboardPage.jsx` |
| S10 | CORS restricted to `process.env.CORS_ORIGIN` | `backend/app.js` |

### Measurement Comparison Plan

| Comparison | What It Shows |
|------------|---------------|
| V1 → V2 | Performance gain from React optimizations alone |
| V2 → V3 | Security overhead — does hardening slow things down? |
| V1 → V3 | Total combined effect of all optimizations |

---

## 8. Running Audits

### 8.1 Lighthouse (Page Performance Scores)

Lighthouse audits each page as an authenticated user using Puppeteer + Chrome remote debugging.

```bash
# Run Lighthouse for a variant
THESIS_VARIANT=base npm run audit:lighthouse

# Specify an explicit output label
AUDIT_LABEL=base THESIS_VARIANT=base npm run audit:lighthouse
```

**Pages audited:** login, dashboard, accounts, transactions, transfer, pay, settings (7 pages)

**Metrics captured per page:**
- Performance score (0–100)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Speed Index
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

**Output:** `reports/lighthouse/{label}.json` — mean, min, max, std_dev per metric

---

### 8.2 Playwright (E2E Interaction Timing)

8 spec files, each targeting a specific feature area. Every spec writes a labeled JSON report to `reports/playwright/`.

| npm script | Spec file | What it measures | Thesis techniques |
|------------|-----------|-----------------|-------------------|
| `audit:playwright:auth` | `auth.spec.js` | `login_ms`, `logout_ms`, `login_after_logout_ms` | S3 (rate limiting), S7 (cookie auth) |
| `audit:playwright:routes` | `route-readiness.spec.js` | SPA navigation time per page (8 routes) | P4, P5 (lazy loading / code splitting) |
| `audit:playwright:dashboard` | `dashboard.spec.js` | Filter re-render time for KPI, Trends, Breakdown, Health, Activity sections | P1 (memo), P2 (useMemo), P3 (useCallback) |
| `audit:playwright:transactions` | `transactions.spec.js` | Initial load, search filter, date/amount/flow/sort filters, combined filters | P6 (virtualization), P7 (debounce) |
| `audit:playwright:accounts` | `accounts.spec.js` | Page load, modal open, create account, deposit | S4 (validation), S7 (cookie auth) |
| `audit:playwright:transfer-pay` | `transfer-pay.spec.js` | Transfer form fill + submit, payment form fill + submit, full flow + logout | S4, S7 |
| `audit:playwright:settings` | `settings.spec.js` | Page load, profile update (API round-trip), password change (restored after) | S4, S7 |
| `audit:playwright:journey` | `user-journey.spec.js` | Full 10-step session: login → accounts → create → deposit → transfer → pay → transactions → dashboard → settings → logout | All techniques combined |

```bash
# Run all 8 specs
THESIS_VARIANT=base PLAYWRIGHT_RESULTS_LABEL=base npm run audit:playwright

# Run a single spec
THESIS_VARIANT=base npm run audit:playwright:auth
THESIS_VARIANT=base npm run audit:playwright:routes
THESIS_VARIANT=base npm run audit:playwright:dashboard
THESIS_VARIANT=base npm run audit:playwright:transactions
THESIS_VARIANT=base npm run audit:playwright:accounts
THESIS_VARIANT=base npm run audit:playwright:transfer-pay
THESIS_VARIANT=base npm run audit:playwright:settings
THESIS_VARIANT=base npm run audit:playwright:journey

# Aggregate all 8 spec reports into a single summary
npm run audit:playwright:summary
```

**Report fields per operation:** `count`, `mean_ms`, `min_ms`, `max_ms`, `p95_ms`, `std_dev_ms`

Use **`p95_ms`** for thesis comparisons — it captures worst-case user experience more reliably than mean across repeated runs.

**Increase repetitions for more stable statistics:**

```bash
PLAYWRIGHT_REPEAT_EACH=3 THESIS_VARIANT=base npm run audit:playwright
```

---

### 8.3 Full Pipeline (Recommended Workflow)

The pipeline runs Lighthouse + all Playwright specs + summary in one command, then auto-appends a `[MEASUREMENT]` entry to `ACTIVITY_LOG.md`.

```bash
# Full pipeline for one variant
THESIS_VARIANT=base PLAYWRIGHT_RESULTS_LABEL=base npm run pipeline
```

Sequence: Lighthouse → all Playwright specs → `summarizePlaywrightReports.js` → append to `ACTIVITY_LOG.md`

---

### 8.4 Complete Per-Variant Workflow

```bash
# 1. Seed deterministic data (once, or after any reset)
npm run seed:db

# 2. Start the app
npm run dev

# 3. Run full pipeline for V1
THESIS_VARIANT=base PLAYWRIGHT_RESULTS_LABEL=base npm run pipeline

# 4. (After implementing V2) run for V2
THESIS_VARIANT=base-performance PLAYWRIGHT_RESULTS_LABEL=base-performance npm run pipeline

# 5. (After implementing V3) run for V3
THESIS_VARIANT=base-performance-security PLAYWRIGHT_RESULTS_LABEL=base-performance-security npm run pipeline
```

---

### 8.5 Comparing Two Variants

```bash
# Lighthouse score comparison
node scripts/compareReports.js base base-performance

# Playwright timing comparison
node scripts/comparePlaywright.js base base-performance
```

Output is a delta table (▲/▼ per metric) saved to `reports/`.

---

## 9. Reports

All audit outputs are written here. **Do not edit files in `reports/` — they are generated outputs.**

```
reports/
├── lighthouse/
│   ├── base.json                              # Latest Lighthouse run for 'base'
│   ├── base-performance.json
│   ├── base-performance-security.json
│   ├── comparison_base_vs_base-performance.json
│   └── history/                               # Timestamped archives of past runs
└── playwright/
    ├── base.auth.performance.json
    ├── base.route-readiness.performance.json
    ├── base.dashboard.performance.json
    ├── base.transactions.performance.json
    ├── base.accounts.performance.json
    ├── base.transfer-pay.performance.json
    ├── base.settings.performance.json
    ├── base.user-journey.performance.json
    └── summary.json                           # Aggregated across all 8 specs
```

### Report Format (Playwright)

Each JSON report contains:

```json
{
  "suite": "spec name",
  "variant": "base",
  "runs": [
    {
      "repeat_index": 0,
      "measurements": [
        { "name": "login_ms", "value_ms": 412 }
      ]
    }
  ],
  "summary": {
    "login_ms": {
      "count": 3,
      "mean_ms": 415,
      "min_ms": 398,
      "max_ms": 431,
      "p95_ms": 431,
      "std_dev_ms": 13.6
    }
  }
}
```

---

## 10. API Endpoints

Base URL: `http://localhost:4000/api`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/healthCheck` | No | Server health check |
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login — returns JWT |
| GET | `/auth/me` | Yes | Get current authenticated user |
| PUT | `/auth/user/profile` | Yes | Update profile (name, contact, country, currency) |
| PUT | `/auth/user/change-password` | Yes | Change password |
| GET | `/accounts` | Yes | List all accounts for the authenticated user |
| POST | `/accounts` | Yes | Create a new account |
| POST | `/accounts/:id/deposit` | Yes | Deposit funds into an account |
| POST | `/accounts/transfer` | Yes | Transfer between two accounts |
| GET | `/accounts/:id/transactions` | Yes | List transactions for a specific account |
| GET | `/transactions` | Yes | List all transactions for the authenticated user |
| POST | `/payments` | Yes | Submit an external payment |

All protected routes require the JWT token. In V1 (`base`), the token is sent in the `Authorization: Bearer <token>` header. In V3 (`base-performance-security`), it is sent as an HttpOnly cookie.

---

## 11. Project Structure

```
thesis-fintech-app/
│
├── backend/                         # Express 5 API (port 4000)
│   ├── server.js                    # Entry point — starts HTTP server
│   ├── app.js                       # Express setup, middleware, route mounting
│   ├── config/
│   │   ├── init_db.js               # SQLite schema creation (runs on startup)
│   │   ├── seed_db.js               # Deterministic seed data generator
│   │   └── loadEnv.js               # Custom .env file parser
│   ├── db/
│   │   ├── db.js                    # SQLite connection (better-sqlite3)
│   │   └── banking_app.db           # SQLite database file (generated by seed)
│   ├── controllers/
│   │   ├── auth.controller.js       # register, login, me, update-profile, change-password
│   │   ├── account.controller.js    # list, create, deposit, transfer
│   │   ├── payments.controller.js   # external payment
│   │   └── dashboard.controller.js  # placeholder
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── account.routes.js
│   │   ├── transaction.routes.js
│   │   ├── payments.routes.js
│   │   └── dashboard.routes.js
│   ├── middleware/
│   │   └── auth.middleware.js       # JWT verification — applied to all protected routes
│   └── utils/
│
├── frontend/                        # React 19 + Vite (port 5173)
│   └── src/
│       ├── api/
│       │   └── axios.js             # Configured Axios instance with base URL + interceptors
│       ├── app/
│       │   ├── App.jsx              # RouterProvider wrapper
│       │   └── router.jsx           # All route definitions (8 routes)
│       ├── features/                # Feature-based modules
│       │   ├── auth/
│       │   │   ├── SignInPage.jsx
│       │   │   └── SignUpPage.jsx
│       │   ├── dashboard/
│       │   │   ├── DashboardPage.jsx        # Main analytics page
│       │   │   └── components/              # 12 sub-components (KpiGrid, charts, etc.)
│       │   ├── accounts/
│       │   │   ├── AccountsPage.jsx
│       │   │   └── components/              # AccountCard, AddAccount, DepositMoney
│       │   ├── transations/                 # NOTE: intentional typo — do not rename
│       │   │   └── TransactionsPage.jsx
│       │   ├── transfer/
│       │   │   └── TransferPage.jsx
│       │   ├── pay/
│       │   │   └── PayPage.jsx
│       │   └── settings/
│       │       └── SettingsPage.jsx
│       ├── shared/
│       │   ├── layouts/
│       │   │   └── AppLayout.jsx            # Sidebar + NavBar + <Outlet>
│       │   ├── componenets/                 # NOTE: intentional typo — do not rename
│       │   │   ├── NavBar.jsx
│       │   │   └── SideBar.jsx
│       │   ├── routes/
│       │   │   └── ProtectedRoute.jsx
│       │   └── utils/
│       │       └── auth.js
│       ├── store/
│       │   ├── useAuthStore.js              # Auth state (user, token, isAuthenticated)
│       │   ├── useAccountStore.js           # Accounts list + actions
│       │   └── useTransactionStore.js       # Transactions list + fetch
│       ├── assets/
│       │   └── user-avatar.png
│       ├── main.jsx
│       └── index.css                        # Tailwind imports + CSS variables
│
├── playwright/                      # E2E performance test suite
│   ├── playwright.config.js         # Playwright configuration
│   ├── tests/
│   │   └── performance/             # 8 spec files (one per feature area)
│   │       ├── auth.spec.js
│   │       ├── route-readiness.spec.js
│   │       ├── dashboard.spec.js
│   │       ├── transactions.spec.js
│   │       ├── accounts.spec.js
│   │       ├── transfer-pay.spec.js
│   │       ├── settings.spec.js
│   │       └── user-journey.spec.js
│   ├── utils/
│   │   ├── metrics.js               # PerformanceRecorder — measure(), record(), flush()
│   │   ├── helpers.js               # loginThroughUi, logoutThroughUi, measureApiCall, etc.
│   │   └── config.js                # Env var exports (playwrightUser, thesisVariant, etc.)
│   └── README.md                    # Playwright-specific documentation
│
├── scripts/                         # Audit pipeline scripts (Node, ES modules)
│   ├── runLighthouse.js             # Launches Puppeteer + Lighthouse for all pages
│   ├── runPipeline.js               # Orchestrates full audit pipeline
│   ├── summarizePlaywrightReports.js# Aggregates 8 spec JSONs into summary.json
│   ├── compareReports.js            # Lighthouse variant diff table
│   └── comparePlaywright.js         # Playwright timing diff table
│
├── config/
│   └── loadEnv.js                   # .env loader used by scripts (not frontend or backend)
│
├── reports/                         # Generated audit outputs — do not edit
│   ├── lighthouse/
│   └── playwright/
│
├── .env                             # Active configuration — do not commit
├── .env.example                     # Template — copy to .env to get started
├── package.json                     # Root npm scripts
├── ACTIVITY_LOG.md                  # Thesis change log (auto-updated by pipeline)
├── PROJECT_REFERENCE.md             # Full technical reference document
└── CLAUDE.md                        # Coding assistant rules for this repo
```

---

## 12. Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| `Cannot find module` on startup | Missing dependencies | Run `npm install`, `npm install --prefix frontend`, `npm install --prefix backend` |
| Login fails in Playwright or Lighthouse | Stale database or credentials mismatch | Run `npm run seed:db` |
| Lighthouse auth fails / pages load as guest | App not running or wrong port | Ensure `npm run dev` is running; confirm `LIGHTHOUSE_BASE_URL=http://localhost:5173` and `LIGHTHOUSE_DEBUG_PORT=9222` |
| Playwright can't find an element | `data-testid` missing or renamed | Check `PROJECT_REFERENCE.md` section 7 for all test IDs |
| Reports not generating | Wrong or missing `THESIS_VARIANT` | Set `THESIS_VARIANT=base` (or a valid variant name) |
| `summary.json` is empty or stale | Not all spec JSON files present | Run `npm run audit:playwright` first, then `npm run audit:playwright:summary` |
| SQLite database locked | Another Node process holds a connection | Stop all running Node processes: `pkill -f node` |
| Port 5173 already in use | Vite from a previous session still running | `lsof -ti:5173 \| xargs kill` |
| Port 4000 already in use | Express from a previous session still running | `lsof -ti:4000 \| xargs kill` |
| Playwright tests pass but results differ between runs | Low repeat count | Set `PLAYWRIGHT_REPEAT_EACH=3` or higher; use `p95_ms` not `mean_ms` |
| `Cannot connect to display` (Playwright, Linux/CI) | No headless environment | Playwright runs headless by default; confirm `PLAYWRIGHT_HEADLESS=true` (the default) |
| `Unexpected token` in backend scripts | Node version too old for ES modules | Upgrade Node to 18+ |
