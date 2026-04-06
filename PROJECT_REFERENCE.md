# Project Reference — Thesis Fintech App

> Living document. Update this file whenever architecture, dependencies, routes, schema, or test IDs change.
> Last analyzed: 2026-04-05

---

## 1. Project Overview

A full-stack fintech/banking web application built for **thesis research on the cumulative impact of performance and security optimizations**. The app serves as a realistic banking dashboard used to measure and compare metrics across three implementation variants.

**Research tooling:** Lighthouse audits, Playwright E2E performance tests.

**Research question:** How do layered performance and security optimizations affect Lighthouse scores and Playwright timings — individually and combined?

---

### Thesis Variants

Controlled via `THESIS_VARIANT` env var. **Cumulative** — each variant builds on top of the previous.

#### V1 — `base` (Baseline / Bad Version)
The deliberately unoptimized application. No performance or security techniques applied. Used as the **worst-case measurement baseline**.

**Absent optimisations (confirmed):**
- No `React.memo` on any component (P1)
- No `useMemo` — all derived data recomputed on every render (P2)
- No `useCallback` — filter handlers recreated on every render (P3)
- All routes loaded eagerly via static imports — no code splitting (P4/P5)
- No `react-window` list virtualization in TransactionsPage (P6)
- No debounce on search input — every keystroke triggers full filter+sort (P7)
- No dynamic `import()` (P8)
- No `helmet()` security headers (S1/S2)
- No rate limiting (S3)
- No `express-validator` (S4)
- JWT secret hardcoded as `'supersecret'` (S5)
- JWT expiry `1d`, no refresh token (S6)
- JWT in `localStorage` via Bearer header, not HttpOnly cookie (S7/S8)
- No `DOMPurify` sanitization (S9)
- CORS hardcoded to `http://localhost:5173`, not env var (S10)

**Deliberate anti-patterns added on `base` branch:**
- `TransactionsPage.jsx`: `useMemo` removed — full O(n) filter + O(n log n) sort runs synchronously on every render
- `DashboardPage.jsx`: `_allTxSorted` (spread + sort all transactions), `_txById` (full reduce), and `console.log` added — all execute on every render without caching

**Status:** Done — branch `base`. `THESIS_VARIANT=base`

---

#### V2 — `base-performance` (V1 + Performance Optimizations)
All performance techniques applied on top of V1.

| # | Technique | Where Applied | Implementation |
|---|-----------|---------------|----------------|
| P1 | `React.memo` | All 12 dashboard sub-components | Wrap each component export in `React.memo()` |
| P2 | `useMemo` | `DashboardPage.jsx` | Memoize KPI calculations, chart data derivation, filtered transaction arrays |
| P3 | `useCallback` | `DashboardPage.jsx` | Memoize account filter handler, time range filter handler |
| P4 | Code Splitting (`React.lazy` + `Suspense`) | `frontend/src/app/router.jsx` | Convert all 8 static route imports to `React.lazy()` with `<Suspense fallback>` |
| P5 | Lazy Loading (routes) | `frontend/src/app/router.jsx` | Same as P4 — lazy imports mean bundles load on demand |
| P6 | List Virtualization (`react-window`) | `TransactionsPage.jsx` | Replace flat list render with `FixedSizeList` from `react-window` |
| P7 | Debouncing | `TransactionsPage.jsx` search input | 300ms debounce on the `transactions-search` input handler |
| P8 | Dynamic imports | Large icon/chart imports | Use dynamic `import()` for any non-critical heavy modules |

**Status:** Not started. `THESIS_VARIANT=base-performance`

---

#### V3 — `base-performance-security` (V2 + Security Hardening)
All security techniques applied on top of V2.

| # | Technique | Where Applied | Implementation |
|---|-----------|---------------|----------------|
| S1 | HTTP Security Headers (`Helmet.js`) | `backend/app.js` | `app.use(helmet())` — sets X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-DNS-Prefetch-Control |
| S2 | Content Security Policy (CSP) | `backend/app.js` | `helmet.contentSecurityPolicy({ directives: { ... } })` — whitelist only self + CDN origins |
| S3 | Rate Limiting | `backend/app.js` | `express-rate-limit`: 10 requests / 15 min on `/api/auth/login` and `/api/auth/register` |
| S4 | Input Validation | All POST/PUT routes | `express-validator`: validate and sanitize all request body fields in auth + account + payment routes |
| S5 | JWT Secret from Env | `backend/middleware/auth.middleware.js` + `backend/controllers/auth.controller.js` | Replace hardcoded `"supersecret"` with `process.env.JWT_SECRET` |
| S6 | JWT Short Expiry | `backend/controllers/auth.controller.js` | Change `expiresIn` from `1d` to `15m`; add refresh token endpoint |
| S7 | JWT in HttpOnly Cookie | `backend/controllers/auth.controller.js` + `frontend/src/api/axios.js` + `frontend/src/store/useAuthStore.js` | Send JWT as HttpOnly + Secure + SameSite=Strict cookie instead of JSON body; update frontend to use `withCredentials: true` |
| S8 | CSRF Protection | `backend/app.js` | SameSite=Strict cookie (from S7) provides CSRF protection; add `csurf` middleware if needed |
| S9 | XSS Prevention (`DOMPurify`) | `TransactionsPage.jsx`, `AccountsPage.jsx`, `DashboardPage.jsx` | Sanitize all user-controlled string values before rendering (transaction descriptions, account names, payment references) |
| S10 | Secure CORS | `backend/app.js` | Restrict `cors()` to `process.env.CORS_ORIGIN` (frontend URL only) |

**Status:** Not started. `THESIS_VARIANT=base-performance-security`

---

### Measurement Comparison Plan

| Comparison | What It Shows |
|------------|---------------|
| V1 → V2 | Performance gain from React optimizations (Lighthouse scores, Playwright timing) |
| V2 → V3 | Security overhead/impact on performance (does adding security slow things down?) |
| V1 → V3 | Total combined effect of all optimizations |

---

## 2. Tech Stack

### Root
| Tool | Version |
|------|---------|
| Node.js (ES modules) | `"type": "module"` |
| concurrently | ^9.2.1 |
| nodemon | ^3.1.14 |

### Frontend (`frontend/`)
| Library | Version |
|---------|---------|
| React | 19.2.0 |
| React Router | 7.13.0 |
| Vite | 7.3.1 |
| Tailwind CSS | 4.2.0 |
| Zustand | 5.0.11 |
| Recharts | 3.7.0 |
| Axios | 1.13.5 |
| react-icons | 5.5.0 |

### Backend (`backend/`)
| Library | Version |
|---------|---------|
| Express | 5.2.1 |
| better-sqlite3 | 12.6.2 |
| jsonwebtoken | ^9.0.3 |
| bcrypt | ^6.0.0 |
| cors | ^2.8.6 |

### Auditing & Testing
| Tool | Version |
|------|---------|
| @playwright/test | ^1.58.2 |
| lighthouse | ^13.0.3 |
| puppeteer | ^24.38.0 |
| axios (scripts) | ^1.13.6 |

---

## 3. Architecture

### Monorepo Structure
```
thesis-fintech-app/
├── backend/                  # Express API server (port 4000)
├── frontend/                 # React Vite app (port 5173)
├── playwright/               # E2E performance test suite
├── scripts/                  # Lighthouse, Playwright summary scripts
├── config/                   # loadEnv.js
├── reports/                  # Generated audit outputs
│   ├── lighthouse/
│   └── playwright/
├── .env                      # Active environment config
├── .env.example              # Template
├── package.json              # Root scripts
├── CLAUDE.md                 # Coding assistant rules
└── PROJECT_REFERENCE.md      # This file
```

### Frontend Structure (`frontend/src/`)
```
frontend/src/
├── api/
│   └── axios.js              # Axios instance + request/response interceptors
├── app/
│   ├── App.jsx               # RouterProvider wrapper
│   └── router.jsx            # All route definitions
├── features/                 # Feature-based modules
│   ├── auth/
│   │   ├── SignInPage.jsx
│   │   └── SignUpPage.jsx
│   ├── dashboard/
│   │   ├── DashboardPage.jsx (594 lines — complex analytics)
│   │   └── components/       # 12 sub-components (KpiGrid, CustomLineChart, etc.)
│   ├── accounts/
│   │   ├── AccountsPage.jsx
│   │   └── components/       # AccountCard, AddAccount, DepositMoney, Pay, Transfer
│   ├── transations/          # NOTE: typo in folder name (missing 'c')
│   │   └── TransactionsPage.jsx
│   ├── transfer/
│   │   └── TransferPage.jsx
│   ├── pay/
│   │   └── PayPage.jsx
│   └── settings/
│       └── SettingsPage.jsx
├── shared/
│   ├── layouts/
│   │   └── AppLayout.jsx     # Sidebar + NavBar + <Outlet>
│   ├── componenets/          # NOTE: typo in folder name
│   │   ├── NavBar.jsx
│   │   └── SideBar.jsx
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   └── utils/
│       └── auth.js
├── store/
│   ├── useAuthStore.js       # Persisted to localStorage key 'token'
│   ├── useAccountStore.js
│   └── useTransactionStore.js
├── assets/
│   └── user-avatar.png
├── main.jsx
└── index.css                 # Tailwind imports + CSS variables
```

### CSS Variables (defined in `index.css`)
```css
--color-primary: #2563eb
--color-success: #16a34a
--color-danger:  #dc2626
--color-background: #f8fafc
--color-card:    #ffffff
--color-border:  #e2e8f0
--color-text:    #0f172a
```

### Backend Structure (`backend/`)
```
backend/
├── server.js                 # Entry point (port 4000)
├── app.js                    # Express setup, route mounting
├── config/
│   ├── init_db.js            # Schema creation (runs on startup)
│   ├── seed_db.js            # Seed data generator
│   └── loadEnv.js            # Custom .env parser
├── db/
│   ├── db.js                 # SQLite connection
│   └── banking_app.db        # SQLite file
├── controllers/
│   ├── auth.controller.js
│   ├── account.controller.js
│   ├── dashboard.controller.js  # EMPTY placeholder
│   └── payments.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── account.routes.js
│   ├── transaction.routes.js
│   ├── payments.routes.js
│   └── dashboard.routes.js   # Commented out
├── middleware/
│   └── auth.middleware.js    # JWT verification
└── utils/
```

---

## 4. Routing

### Frontend Routes (`frontend/src/app/router.jsx`)
| Path | Component | Auth |
|------|-----------|------|
| `/login` | SignInPage | Public |
| `/register` | SignUpPage | Public |
| `/` | AppLayout > ProtectedRoute | Protected |
| `/dashboard` | DashboardPage | Protected (default) |
| `/account` | AccountsPage | Protected |
| `/transactions` | TransactionsPage | Protected |
| `/transfer` | TransferPage | Protected |
| `/pay` | PayPage | Protected |
| `/settings` | SettingsPage | Protected |

### API Routes (Backend, base: `http://localhost:4000/api`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/healthCheck` | No | Health check |
| POST | `/auth/register` | No | Register user |
| POST | `/auth/login` | No | Login, get JWT |
| GET | `/auth/me` | Yes | Current user |
| PUT | `/auth/user/profile` | Yes | Update profile |
| PUT | `/auth/user/change-password` | Yes | Change password |
| GET | `/accounts` | Yes | List user accounts |
| POST | `/accounts` | Yes | Create account |
| POST | `/accounts/:id/deposit` | Yes | Deposit to account |
| POST | `/accounts/transfer` | Yes | Transfer between accounts |
| GET | `/accounts/:id/transactions` | Yes | Account transactions |
| GET | `/transactions` | Yes | All user transactions |
| POST | `/payments` | Yes | External payment |

---

## 5. State Management (Zustand)

### `useAuthStore`
- **Persisted:** Yes (`localStorage` key: `'token'`)
- **State:** `user`, `token`, `isAuthenticated`
- **Actions:** `login({ user, token })`, `logout()`, `setUser(user)`

### `useAccountStore`
- **Persisted:** No
- **State:** `accounts[]`, `loading`, `error`
- **Actions:** `fetchAccounts()`, `addAccount(data)`, `depositMoney(id, amount, desc)`

### `useTransactionStore`
- **Persisted:** No
- **State:** `transactions[]`, `loading`, `error`
- **Actions:** `fetchTransactions(accountId?)` — omit id for all transactions

---

## 6. Database Schema

**Type:** SQLite 3 (better-sqlite3), foreign keys enabled

### `tbluser`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| email | TEXT | NOT NULL UNIQUE |
| firstname | TEXT | NOT NULL |
| lastname | TEXT | |
| contact | TEXT | |
| password | TEXT | bcrypt hash |
| provider | TEXT | DEFAULT 'local' |
| country | TEXT | |
| currency | TEXT | DEFAULT 'EUR' |
| createdat | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updatedat | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### `tblaccount`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| user_id | INTEGER FK | → tbluser(id) CASCADE |
| account_name | TEXT | NOT NULL |
| account_type | TEXT | NOT NULL |
| account_number | TEXT | NOT NULL UNIQUE |
| currency | TEXT | DEFAULT 'EUR' |
| account_balance | REAL | DEFAULT 0 |
| is_active | INTEGER | DEFAULT 1 |
| createdat | DATETIME | |
| updatedat | DATETIME | |

### `tbltransaction`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| user_id | INTEGER FK | → tbluser(id) CASCADE |
| account_id | INTEGER FK | → tblaccount(id) CASCADE |
| description | TEXT | NOT NULL |
| reference | TEXT | |
| amount | REAL | CHECK > 0 |
| type | TEXT | 'credit' or 'debit' |
| balance_before | REAL | NOT NULL |
| balance_after | REAL | NOT NULL |
| status | TEXT | 'Pending', 'Completed', 'Failed' |
| category | TEXT | |
| createdat | DATETIME | |
| updatedat | DATETIME | |

### Indexes
- `idx_account_user` ON tblaccount(user_id)
- `idx_transaction_user` ON tbltransaction(user_id)
- `idx_transaction_account` ON tbltransaction(account_id)
- `idx_transaction_created` ON tbltransaction(createdat)

---

## 7. Test IDs (`data-testid` values)

Convention: `{feature}-{element}` in kebab-case.

### Auth
| Test ID | Element |
|---------|---------|
| `login-page` | Login page container |
| `login-email` | Email input |
| `login-password` | Password input |
| `login-submit` | Submit button |

### Navigation
| Test ID | Element |
|---------|---------|
| `nav-dashboard` | Dashboard nav link |
| `nav-account` | Accounts nav link |
| `nav-transactions` | Transactions nav link |
| `nav-transfer` | Transfer nav link |
| `nav-pay` | Pay nav link |
| `nav-settings` | Settings nav link |
| `logout-button` | Logout button |

### Dashboard
| Test ID | Element |
|---------|---------|
| `dashboard-kpi-section` | KPI cards container |
| `dashboard-account-filter` | Account dropdown filter |
| `dashboard-time-filter-last_3_months` | Time range chip (and other time ranges) |
| `dashboard-trends-section` | Line chart section |

### Accounts
| Test ID | Element |
|---------|---------|
| `accounts-page` | Page container |
| `accounts-link-button` | Open account creation button |
| `accounts-deposit-button` | Open deposit modal |
| `add-account-modal` | Account creation modal |
| `add-account-name` | Account name input |
| `add-account-type` | Account type select |
| `add-account-number` | Account number input |
| `add-account-initial-balance` | Initial balance input |
| `add-account-submit` | Submit button |
| `deposit-modal` | Deposit modal |
| `deposit-account-select` | Account selector |
| `deposit-amount-input` | Amount input |
| `deposit-description-input` | Description input |
| `deposit-submit` | Submit button |

### Transactions
| Test ID | Element |
|---------|---------|
| `transactions-page` | Page container |
| `transactions-search` | Search input |
| `transactions-from-date` | From date filter |
| `transactions-to-date` | To date filter |
| `transactions-min-amount` | Min amount filter |
| `transactions-max-amount` | Max amount filter |
| `transactions-flow-filter` | Credit/debit filter |
| `transactions-sort` | Sort dropdown |
| `transactions-clear` | Clear filters button |
| `transactions-table-body` | Table tbody |

### Transfer
| Test ID | Element |
|---------|---------|
| `transfer-page` | Page container |
| `transfer-from-account` | Source account select |
| `transfer-to-account` | Destination account select |
| `transfer-amount` | Amount input |
| `transfer-description` | Description input |
| `transfer-submit` | Submit button |

### Pay
| Test ID | Element |
|---------|---------|
| `pay-page` | Page container |
| `pay-from-account` | Source account select |
| `pay-recipient-name` | Recipient name input |
| `pay-bank-name` | Bank name input |
| `pay-recipient-account` | Recipient account input |
| `pay-amount` | Amount input |
| `pay-description` | Description input |
| `pay-submit` | Submit button |

### Settings
| Test ID | Element |
|---------|---------|
| `settings-page` | Page container |
| `settings-contact` | Contact input |
| `settings-save-profile` | Save profile button |
| `settings-current-password` | Current password input |
| `settings-new-password` | New password input |
| `settings-confirm-password` | Confirm password input |
| `settings-change-password-submit` | Change password submit button |

---

## 8. NPM Scripts

### Development
```bash
npm run dev           # Starts both frontend (5173) and backend (4000) concurrently
npm run client        # Frontend only (Vite dev server)
npm run server        # Backend only (nodemon)
npm run seed:db       # Re-seed SQLite database with test data
```

### Auditing
```bash
# Run entire pipeline for a variant (recommended — logs results to ACTIVITY_LOG.md)
THESIS_VARIANT=base npm run audit:pipeline
THESIS_VARIANT=base npm run pipeline          # alias

# Individual audits
npm run audit:lighthouse          # Lighthouse performance audit (runs × LIGHTHOUSE_RUNS)
npm run audit:playwright          # All Playwright performance tests
npm run audit:playwright:routes   # Route readiness timing tests only
npm run audit:playwright:journey  # Full user journey tests only
npm run audit:playwright:ops      # Page operations timing tests only
npm run audit:playwright:list     # List all available Playwright tests
npm run audit:playwright:auth         # Auth timing spec only
npm run audit:playwright:routes       # Route readiness spec only
npm run audit:playwright:dashboard    # Dashboard filter spec only
npm run audit:playwright:transactions # Transactions filter spec only
npm run audit:playwright:accounts     # Accounts operations spec only
npm run audit:playwright:transfer-pay # Transfer + payment spec only
npm run audit:playwright:settings     # Settings operations spec only
npm run audit:playwright:journey      # Full user journey spec only
npm run audit:playwright:summary      # Aggregate all JSON reports → summary.json
npm run audit:all                     # lighthouse + playwright (no auto-log)
npm run light                         # Alias for audit:lighthouse

# Comparisons
npm run audit:compare base base-performance             # Lighthouse delta
npm run audit:playwright:compare base base-performance  # Playwright timing delta
```


---

## 9. Environment Variables

All configured in `.env` at root. Loaded via `config/loadEnv.js`.

### Seed
| Key | Description |
|-----|-------------|
| `SEED_DB_SEED` | Deterministic seed key (default: `thesis-fintech-base-v1`) |
| `SEED_USER_EMAIL` | Test user email |
| `SEED_USER_PASSWORD` | Test user password (default: `123`) |
| `SEED_USER_FIRSTNAME` | First name |
| `SEED_USER_LASTNAME` | Last name |
| `SEED_USER_CONTACT` | Phone number |
| `SEED_USER_COUNTRY` | Country |
| `SEED_USER_CURRENCY` | Currency code (default: `EUR`) |

### Backend / Database
| Key | Description |
|-----|-------------|
| `DB_VERBOSE` | Set `true` to log all SQL queries |

### Lighthouse
| Key | Description |
|-----|-------------|
| `LIGHTHOUSE_BASE_URL` | App URL (default: `http://localhost:5173`) |
| `LIGHTHOUSE_DEBUG_PORT` | Chrome debug port (default: `9222`) |
| `LIGHTHOUSE_EMAIL` | Login email for authenticated audits |
| `LIGHTHOUSE_PASSWORD` | Login password |
| `LIGHTHOUSE_RUNS` | Number of audit repetitions (default: `5`) |
| `LIGHTHOUSE_OUTPUT_FILE` | Output filename |

### Playwright
| Key | Description |
|-----|-------------|
| `THESIS_VARIANT` | Variant label: `base` \| `base-performance` \| `base-performance-security` |
| `PLAYWRIGHT_BASE_URL` | App URL (default: `http://localhost:5173`) |
| `PLAYWRIGHT_EMAIL` | Test user email |
| `PLAYWRIGHT_PASSWORD` | Test user password |
| `PLAYWRIGHT_REPEAT_EACH` | Times to repeat each test (default: `1`) |
| `PLAYWRIGHT_RESULTS_LABEL` | Label for JSON report files |

---

## 10. Audit & Reporting Infrastructure

### Lighthouse (`scripts/runLighthouse.js`)
- Puppeteer launches Chrome on `LIGHTHOUSE_DEBUG_PORT`
- Logs in through the UI, then audits 6 pages
- Captures: Performance score, FCP, LCP, Speed Index, TBT, CLS
- Outputs stats (mean, min, max, std dev) to `reports/lighthouse/{label}.json`
- Archives to `reports/lighthouse/history/` with timestamp
- Captures git branch + commit hash

### Playwright (`playwright/tests/performance/`)
Three spec files:
1. `route-readiness.spec.js` — time-to-interactive for each page
2. `user-journey.spec.js` — full auth + financial workflow end-to-end
3. `page-operations.spec.js` — individual UI operation timings

Utilities:
- `playwright/utils/metrics.js` — `PerformanceRecorder` class (mean/min/max/std dev)
- `playwright/utils/helpers.js` — `loginThroughUi`, `logoutThroughUi`, `openNavigation`
- `playwright/utils/config.js` — env var loader for test config

Output: `reports/playwright/{label}.performance.json` + `pw_results.json`

### Report Comparison (`scripts/compareReports.js`)
- Compares two Lighthouse runs by label (e.g., `base` vs `performance`)
- Shows absolute delta + percentage change per metric
- Output: `reports/lighthouse/comparison_{A}_vs_{B}.json`

---

## 11. Known Issues / Technical Debt

### Naming Typos
| Issue | Current | Should Be |
|-------|---------|-----------|
| Folder | `features/transations/` | `features/transactions/` |
| Folder | `shared/componenets/` | `shared/components/` |
| Variable | `selectedkpiAccountId` | `selectedKpiAccountId` |

### Security
- **JWT secret hardcoded** as `"supersecret"` in `auth.middleware.js` — should be `process.env.JWT_SECRET`
- **No rate limiting** on `/auth/login` or `/auth/register` — brute-force vulnerable
- **No password complexity** rules on registration
- **CORS** origin not configurable via env

### Dead Code
- `frontend/eslint.config.js` — entire config commented out, ESLint effectively disabled
- `frontend/src/main.jsx` — `<StrictMode>` commented out
- `frontend/src/store/useTransactionStore.js` — ~60 lines of commented-out old controller code
- `backend/routes/dashboard.routes.js` — commented out (route not active)
- `backend/controllers/dashboard.controller.js` — empty placeholder

### Debug Artifacts
- `frontend/src/features/dashboard/components/CustomLineChart.jsx` — `console.log(chartData)`
- `frontend/src/features/accounts/components/Transfer.jsx` — `console.log(err)`
- `frontend/src/store/useAccountStore.js` — `console.error(error)` (acceptable in store)

### Missing Features
- No pagination on `GET /transactions` — could be slow with large datasets
- No structured logging (backend uses raw `console.log`)
- No request/response logging middleware on Express
- `GET /api/healthCheck` does not verify DB connectivity

---

## 12. Implementation Checklist

Track which techniques have been implemented per variant. Update status as work completes.

### V2 — Performance Techniques

| ID | Technique | File(s) | Status |
|----|-----------|---------|--------|
| P1 | `React.memo` on all 12 dashboard sub-components | `frontend/src/features/dashboard/components/*.jsx` | Not started |
| P2 | `useMemo` for KPI calculations + chart data + filtered arrays | `frontend/src/features/dashboard/DashboardPage.jsx` | Not started |
| P3 | `useCallback` for account filter + time range filter handlers | `frontend/src/features/dashboard/DashboardPage.jsx` | Not started |
| P4 | `React.lazy` + `Suspense` on all 8 route imports | `frontend/src/app/router.jsx` | Not started |
| P5 | `react-window` `FixedSizeList` for transactions list | `frontend/src/features/transations/TransactionsPage.jsx` | Not started |
| P6 | 300ms debounce on search input | `frontend/src/features/transations/TransactionsPage.jsx` | Not started |
| P7 | Dynamic imports for heavy non-critical modules | TBD during implementation | Not started |

### V3 — Security Techniques (applied on top of V2)

| ID | Technique | File(s) | Status |
|----|-----------|---------|--------|
| S1 | `helmet()` middleware — X-Frame-Options, X-Content-Type-Options, Referrer-Policy | `backend/app.js` | Not started |
| S2 | `helmet.contentSecurityPolicy()` — whitelist origins | `backend/app.js` | Not started |
| S3 | `express-rate-limit` — 10 req / 15 min on auth endpoints | `backend/app.js` | Not started |
| S4 | `express-validator` — validate + sanitize all POST/PUT bodies | `backend/routes/*.js` or middleware | Not started |
| S5 | JWT secret from `process.env.JWT_SECRET` | `backend/middleware/auth.middleware.js`, `backend/controllers/auth.controller.js` | Not started |
| S6 | JWT expiry: `15m` + refresh token endpoint | `backend/controllers/auth.controller.js`, new refresh route | Not started |
| S7 | JWT in HttpOnly + Secure + SameSite=Strict cookie | `backend/controllers/auth.controller.js`, `frontend/src/api/axios.js`, `frontend/src/store/useAuthStore.js` | Not started |
| S8 | CSRF protection via SameSite=Strict (from S7) | Covered by S7 | Not started |
| S9 | `DOMPurify` sanitization on rendered user strings | `frontend/src/features/transations/TransactionsPage.jsx`, `AccountsPage.jsx`, `DashboardPage.jsx` | Not started |
| S10 | CORS restricted to `process.env.CORS_ORIGIN` | `backend/app.js` | Not started |
