# Project Reference — Thesis Fintech App

> Living document. Update this file whenever architecture, dependencies, routes, schema, or test IDs change.
> Last analyzed: 2026-04-05

---

## 1. Project Overview

A full-stack fintech/banking web application built for **thesis research on performance optimization**. The app serves as a realistic banking dashboard used to measure and compare performance metrics across different implementation variants (base, bad, performance, security).

**Research tooling:** Lighthouse audits, Playwright E2E performance tests, SonarQube code quality scans.

**Thesis variants** are controlled via `THESIS_VARIANT` env var — each variant may have different implementations of the same features to compare performance characteristics.

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
| sonarqube-scanner | ^4.3.4 |
| axios (scripts) | ^1.13.6 |

---

## 3. Architecture

### Monorepo Structure
```
thesis-fintech-app/
├── backend/                  # Express API server (port 4000)
├── frontend/                 # React Vite app (port 5173)
├── playwright/               # E2E performance test suite
├── scripts/                  # Lighthouse, Playwright summary, SonarQube scripts
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
npm run audit:lighthouse          # Lighthouse performance audit (runs × LIGHTHOUSE_RUNS)
npm run audit:lighthouse:legacy   # Old Lighthouse script
npm run audit:playwright          # All Playwright performance tests
npm run audit:playwright:routes   # Route readiness timing tests only
npm run audit:playwright:journey  # Full user journey tests only
npm run audit:playwright:ops      # Page operations timing tests only
npm run audit:playwright:list     # List all available Playwright tests
npm run audit:playwright:summary  # Aggregate Playwright JSON reports → summary.json
npm run audit:sonar               # SonarQube code quality scan
npm run audit:all                 # lighthouse + playwright + sonar (sequential)
npm run audit:compare             # Compare two Lighthouse runs by label
npm run light                     # Alias for audit:lighthouse
npm run sonar                     # Alias for audit:sonar
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
| `THESIS_VARIANT` | Variant label (`base`, `bad`, `performance`, `security`) |
| `PLAYWRIGHT_BASE_URL` | App URL (default: `http://localhost:5173`) |
| `PLAYWRIGHT_EMAIL` | Test user email |
| `PLAYWRIGHT_PASSWORD` | Test user password |
| `PLAYWRIGHT_REPEAT_EACH` | Times to repeat each test (default: `1`) |
| `PLAYWRIGHT_RESULTS_LABEL` | Label for JSON report files |

### SonarQube
| Key | Description |
|-----|-------------|
| `SONAR_URL` | SonarQube server URL |
| `SONAR_TOKEN` | Auth token |
| `SONAR_PROJECT_KEY` | Project key (default: `fintech-app`) |
| `SONAR_PROJECT_NAME` | Display name |
| `SONAR_TEST_COMMAND` | Test command for coverage |

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

### SonarQube (`scripts/sonar-analysis.js`)
- Scans `frontend/` and `backend/` dirs
- Excludes `node_modules`, `dist`, `playwright`, `scripts`, `reports`
- Auto-creates project if it doesn't exist

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

## 12. Enhancement Roadmap (Priority Order)

### High Priority
1. Move JWT secret to env var (`JWT_SECRET`)
2. Add rate limiting on auth endpoints (e.g., `express-rate-limit`)
3. Re-enable ESLint (`frontend/eslint.config.js`)
4. Remove debug `console.log` calls from components

### Medium Priority
5. Fix folder typos (`transations/` → `transactions/`, `componenets/` → `components/`)
6. Add pagination to `GET /transactions` API endpoint
7. Re-enable React `<StrictMode>` in `main.jsx`
8. Clean up commented-out code blocks (store SQL, dashboard routes)
9. Improve health check to test DB connectivity

### Low Priority
10. Add request logging middleware (e.g., Morgan)
11. Make CORS origin configurable via env
12. Add password complexity validation on register
13. Add component-level tests (Vitest) for critical dashboard calculations
14. Implement `dashboard.controller.js` (currently empty)
