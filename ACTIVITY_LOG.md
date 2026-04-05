# Activity Log — Thesis Fintech App

> Record of every significant change made to the project.
> Used as a reference for thesis writing — tracks what was built, why, and when.
> Update this file after every session or meaningful change.

---

## How to Use This Log

- **Add a new entry at the top** (most recent first)
- Each entry should answer: what changed, why it was done, what files were affected
- Use the **Category tags** to classify the type of work:
  - `[FEATURE]` — new functionality added
  - `[FIX]` — bug or error corrected
  - `[MEASUREMENT]` — audit tooling, metrics, or reporting changes
  - `[TEST]` — test additions or changes
  - `[REFACTOR]` — code restructured without behavior change
  - `[CONFIG]` — configuration, env, or tooling setup
  - `[DOCS]` — documentation changes (including this file)
  - `[SECURITY]` — security-related changes
  - `[CLEANUP]` — dead code removal, formatting

---

## 2026

---

### 2026-04-05 19:00 `[CLEANUP]`
**Removed SonarQube from project**
- Deleted `scripts/sonar-analysis.js` and `scripts/setupSonarProfile.js`
- Removed `sonarqube-scanner` npm dependency from `package.json`
- Removed scripts: `audit:sonar`, `sonar:setup`, `sonar`; updated `audit:all` to Lighthouse + Playwright only
- Simplified `scripts/runPipeline.js` — removed SonarQube step, axios import, and sonarLine log output; `main()` is now synchronous
- Removed SonarQube section 10 from `PROJECT_REFERENCE.md` and all other SonarQube references in docs
- Removed SonarQube env vars from `.env.example`
- **Purpose:** SonarQube cannot reliably detect most security issues in the base variant (misses absent middleware, architectural decisions, indirect data flows). Thesis measurements will rely on Lighthouse (performance scores) and Playwright (E2E timings) which provide concrete, comparable numbers across variants.
- **Files:** `scripts/sonar-analysis.js` (deleted), `scripts/setupSonarProfile.js` (deleted), `scripts/runPipeline.js`, `package.json`, `CLAUDE.md`, `PROJECT_REFERENCE.md`, `ACTIVITY_LOG.md`, `.env.example`

---

### 2026-04-05 16:35 `[CONFIG]` `[MEASUREMENT]`
**Audit scripts reviewed, fixed, and extended**

**Fixes to existing scripts:**
- `scripts/runLighthouse.js` — added `min` and `max` to statistics (was mean + std dev only); fixed `AUDIT_LABEL` fallback order (`AUDIT_LABEL → THESIS_VARIANT → git branch`) so variant reports never overwrite each other; added per-run metric logging to console
- `scripts/lighthouse.js` — deleted (redundant 4-line wrapper)
- `scripts/compareReports.js` — fixed confusing duplicate variable name (`meanKeyB` used for both A and B); added improved/degraded/unchanged totals summary line
- `scripts/summarizePlaywrightReports.js` — excluded `pw_results.json` from aggregation (wrong schema caused silent failures); added console table preview of results
- `playwright/utils/metrics.js` — Playwright performance reports now prefixed with `PLAYWRIGHT_RESULTS_LABEL` (e.g. `base.route-readiness.performance.json`) enabling variant-specific files

**New scripts:**
- `scripts/comparePlaywright.js` — Playwright equivalent of `compareReports.js`; compares operation timings across two variant labels for all 3 suites; shows ▲/▼ delta per operation; saves JSON
- `scripts/runPipeline.js` — master pipeline; runs Lighthouse → Playwright → summary in sequence; auto-appends `[MEASUREMENT]` entry to `ACTIVITY_LOG.md` with scores, timings, commit hash

**`package.json` changes:**
- Removed `audit:lighthouse:legacy` (script deleted)
- Added `audit:playwright:compare` → `node scripts/comparePlaywright.js`
- Added `audit:pipeline` and `pipeline` alias → `node scripts/runPipeline.js`

**Purpose:** Complete the measurement infrastructure. One command (`THESIS_VARIANT=base npm run pipeline`) now runs all audits and logs results automatically — no manual ACTIVITY_LOG entries needed after audit runs.

**Files:** `scripts/runLighthouse.js`, `scripts/compareReports.js`, `scripts/summarizePlaywrightReports.js`, `scripts/comparePlaywright.js` (new), `scripts/runPipeline.js` (new), `playwright/utils/metrics.js`, `package.json`

---

### 2026-04-05 13:56 `[DOCS]` `[CONFIG]`
**Thesis variant plan finalized + project documentation created**

**Variant structure decided:**
- **V1 `base`** — Current unoptimized codebase. No performance or security techniques. The bad/baseline version used as worst-case measurement starting point.
- **V2 `base-performance`** — V1 + 7 performance techniques (P1–P7)
- **V3 `base-performance-security`** — V2 + 10 security techniques (S1–S10)
- Variants are cumulative — each builds on the previous

**Performance techniques planned for V2:**
- P1: `React.memo` on all 12 dashboard sub-components
- P2: `useMemo` for KPI calculations, chart data, filtered arrays in `DashboardPage.jsx`
- P3: `useCallback` for filter handlers in `DashboardPage.jsx`
- P4: `React.lazy` + `Suspense` on all 8 route imports in `router.jsx`
- P5: `react-window` `FixedSizeList` for transactions list in `TransactionsPage.jsx`
- P6: 300ms debounce on search input in `TransactionsPage.jsx`
- P7: Dynamic imports for heavy non-critical modules

**Security techniques planned for V3 (on top of V2):**
- S1: `helmet()` — X-Frame-Options, X-Content-Type-Options, Referrer-Policy in `backend/app.js`
- S2: `helmet.contentSecurityPolicy()` — origin whitelisting in `backend/app.js`
- S3: `express-rate-limit` — 10 req/15 min on `/api/auth/login` + `/api/auth/register`
- S4: `express-validator` — validate + sanitize all POST/PUT bodies in backend routes
- S5: JWT secret from `process.env.JWT_SECRET` (remove hardcoded `"supersecret"`)
- S6: JWT expiry `15m` + refresh token endpoint
- S7: JWT in HttpOnly + Secure + SameSite=Strict cookie (remove from localStorage)
- S8: CSRF protection via SameSite=Strict (covered by S7)
- S9: `DOMPurify` — sanitize user-controlled strings before rendering
- S10: CORS restricted to `process.env.CORS_ORIGIN`

**Purpose:** Define exact thesis scope — ensures reproducible, measurable, and comparable variants for academic research. V1→V2 shows performance impact; V2→V3 shows security overhead; V1→V3 shows combined effect.

**Files:** `PROJECT_REFERENCE.md` (variant plan + implementation checklist), `CLAUDE.md` (variant rules), `ACTIVITY_LOG.md` (this entry)

---

### 2026-03-30 23:04 `[TEST]` `[MEASUREMENT]`
**Playwright page-operations spec + headless toggle + dashboard test IDs**
- Added `playwright/tests/performance/page-operations.spec.js` — measures timing of individual UI operations (login, transfer, pay, dashboard filters, transaction filters)
- Added `PLAYWRIGHT_HEADLESS` env var toggle for running tests with visible browser
- Added `data-testid` attributes to dashboard sections and filter elements for Playwright targeting
- **Purpose:** Capture granular operation-level performance data for thesis measurement (complement to route-readiness and journey tests)
- **Commit:** `d15569c`
- **Files:** `playwright/tests/performance/page-operations.spec.js`, `frontend/src/features/dashboard/DashboardPage.jsx`, various page components

---


### 2026-03-30 12:29 `[MEASUREMENT]`
**Labeled reports, comparison tooling, std dev fix**
- Added labeled report output — Lighthouse and Playwright reports now tagged by `THESIS_VARIANT` / `PLAYWRIGHT_RESULTS_LABEL`
- Added `scripts/compareReports.js` — compares two Lighthouse run outputs side-by-side (absolute delta + percentage)
- Fixed standard deviation calculation in `playwright/utils/metrics.js`
- Added report history archiving to `reports/lighthouse/history/`
- **Purpose:** Enable controlled comparison between thesis variants (base vs performance vs security)
- **Commit:** `87e648f`
- **Files:** `scripts/compareReports.js` (new), `scripts/runLighthouse.js`, `playwright/utils/metrics.js`

---

### 2026-03-30 11:10 `[TEST]`
**Test IDs added across all pages**
- Added `data-testid` attributes to all interactive elements across all pages
- Enables Playwright to reliably select elements without fragile CSS selectors
- **Coverage:** Login, Register, Dashboard (filters, sections), Accounts (list, modals), Transactions (filters, table), Transfer, Pay, Settings, NavBar
- **Convention established:** `{feature}-{element}` in kebab-case
- **Commit:** `f896609`

---

### 2026-03-24 20:13 `[MEASUREMENT]` `[CONFIG]`
**Deterministic seed data + env-driven audit scripts**
- Improved `backend/config/seed_db.js` to be fully deterministic — same seed key always produces identical data
- Seed key controlled by `SEED_DB_SEED` env var (default: `thesis-fintech-base-v1`)
- All audit scripts now read configuration from `.env` (no hardcoded values in scripts)
- Added `THESIS_VARIANT`, `PLAYWRIGHT_RESULTS_LABEL`, `PLAYWRIGHT_REPEAT_EACH` env support
- **Purpose:** Ensures repeatable, comparable measurements across thesis variants
- **Commit:** `0b27902`
- **Files:** `backend/config/seed_db.js`, `scripts/runLighthouse.js`, `playwright/utils/config.js`, `.env`

---

### 2026-03-24 19:13 `[REFACTOR]`
**Minor enhancements and cleanup**
- Small fixes across frontend and backend
- **Commit:** `5203733`

---

### 2026-03-06 13:53 `[CONFIG]`
**Folder structure enhanced**
- Reorganized project directory structure
- **Commit:** `59c7a7b`

---

### 2026-03-05 10:53 `[MEASUREMENT]`
**Lighthouse script updated**
- Updated `scripts/runLighthouse.js` with improved page navigation and metric capture
- **Commit:** `274b7c5`

---

### 2026-03-04 09:06 `[MEASUREMENT]`
**Lighthouse statistical calculations added**
- Added mean, min, max, std dev statistics to Lighthouse output
- Initial and iterative setup of `scripts/runLighthouse.js` using Puppeteer + Lighthouse
- Captures: Performance score, FCP, LCP, Speed Index, TBT, CLS for each page
- **Purpose:** Core performance measurement tool for thesis — provides Lighthouse-based metrics per variant
- **Commits:** `11e1480`, `45b5bbc`, `01760e5`
- **Files:** `scripts/runLighthouse.js`, `scripts/lighthouse.js` (legacy)

---

### 2026-02-27 14:23 `[FIX]` `[FEATURE]`
**Dashboard line chart fixed + time range filter + activity filter**
- Fixed rendering bug in `CustomLineChart.jsx` — chart was not displaying correctly
- Added time range filter chips to Dashboard (1m, 3m, 6m, 1y, 3y, 6y, all-time)
- Added account activity filter dropdown to Dashboard
- Label aggregation logic added — auto-adjusts label density based on selected time range to prevent chart clutter
- **Commits:** `d0c6348`, `5d634b6`, `5d9f562`, `ddb3d54`
- **Files:** `frontend/src/features/dashboard/DashboardPage.jsx`, `frontend/src/features/dashboard/components/CustomLineChart.jsx`, `frontend/src/features/dashboard/components/TimeRangeFilterChips.jsx`, `frontend/src/features/dashboard/components/AccountFilterDropdown.jsx`

---

### 2026-02-26 16:57 `[FEATURE]`
**Dashboard complete — KPI grid, charts, health metrics, layout finalized**
- KPI grid showing total income, total expense, net savings, account totals
- Line chart for income/expense trends over time
- Pie chart for expense breakdown by category
- Financial health score, budget health, savings rate, monthly comparison components
- Latest transactions section on dashboard
- Advanced transaction filters (date range, amount, flow, sort)
- Overall dashboard layout finalized
- UI sign-in and sign-up pages modernized
- Account pay popup added
- **Commits:** `2b39bd3`, `7c37ca3`, `0d49574`, `5f522c2`, `9a03342`, `9c1a5a3`, `1a1b5ff`, `c55bf1f`
- **Files:** `frontend/src/features/dashboard/DashboardPage.jsx` and all components under `dashboard/components/`

---

### 2026-02-26 21:21 `[FEATURE]`
**Account management — create account, deposit, transfer, link**
- Account page fully built — list accounts, create new account, deposit money
- Transfer between accounts implemented (frontend + backend)
- Account name column added to backend (renamed from `account_type`)
- Business logic for linking accounts updated
- **Commits:** `3e0fbb6`, `50dd10a`, `36b3bb8`, `aa979b4`, `2941227`
- **Files:** `backend/controllers/account.controller.js`, `frontend/src/features/accounts/`, `frontend/src/store/useAccountStore.js`

---

### 2026-02-24 08:47 `[FEATURE]`
**Account page + store setup**
- Created `AccountsPage.jsx` and account Zustand store
- Implemented `AccountCard`, `AddAccount`, `DepositMoney` components
- Create account and deposit money features working end-to-end
- **Commits:** `2375e8f`, `e705223`, `484484f`
- **Files:** `frontend/src/features/accounts/`, `frontend/src/store/useAccountStore.js`

---

### 2026-02-24 06:21 `[FEATURE]`
**Authentication — full auth flow implemented**
- Login and registration UI built
- Backend: register + login routes with bcrypt password hashing and JWT generation
- Auth middleware added — protects all API routes requiring authentication
- `GET /api/auth/me` — returns current user from token
- Profile update and change password features added
- Auth store (Zustand) with localStorage persistence
- Axios interceptors: adds token to requests, redirects to `/login` on 401
- **Commits:** `a2fce62`, `9cfafd0`, `a22952c`, `01ffb6f`, `415e7e3`, `74e6bc9`, `7941669`, `95e5f72`, `f066eb3`, `7bb0c0b`, `b1005a7`
- **Files:** `backend/controllers/auth.controller.js`, `backend/routes/auth.routes.js`, `backend/middleware/auth.middleware.js`, `frontend/src/features/auth/`, `frontend/src/store/useAuthStore.js`, `frontend/src/api/axios.js`, `frontend/src/shared/routes/ProtectedRoute.jsx`

---

### 2026-02-24 05:55 `[FEATURE]`
**Backend database initialization**
- SQLite database setup with `better-sqlite3`
- Schema creation script: `tbluser`, `tblaccount`, `tbltransaction` tables
- Indexes on user_id, account_id, and transaction date
- Foreign keys enabled with cascade delete
- **Commit:** `a180c69`
- **Files:** `backend/db/db.js`, `backend/config/init_db.js`

---

### 2026-02-24 05:25 `[FEATURE]`
**Dashboard pages + routing + sidebar**
- Dashboard, Accounts, Transactions, Transfer, Pay, Settings page stubs created
- React Router setup with protected routes
- AppLayout with SideBar and NavBar components
- **Commit:** `6169e08`
- **Files:** `frontend/src/app/router.jsx`, `frontend/src/shared/layouts/AppLayout.jsx`, `frontend/src/shared/componenets/SideBar.jsx`, `frontend/src/shared/componenets/NavBar.jsx`

---

### 2026-02-23 00:24 `[CONFIG]`
**Initial project setup**
- Frontend: React + Vite + Tailwind CSS + React Router + Zustand (basic architecture)
- Backend: Express server on port 4000
- NavBar and SideBar created, app theme/CSS variables defined
- **Commits:** `c70df26`, `72246e1`, `77f1cf6`, `43807b7`
- **Files:** `frontend/`, `backend/server.js`, `backend/app.js`, `frontend/src/index.css`

---

## Entry Template

Copy this when adding a new entry:

```
### YYYY-MM-DD HH:MM `[CATEGORY]`
**Short description of what changed**
- Bullet point detail
- Bullet point detail
- **Purpose:** Why this was done / thesis relevance
- **Commit:** `abc1234` (if applicable)
- **Files:** list of key files added/changed
```
