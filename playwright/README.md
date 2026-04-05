# Playwright Performance Measurement

Thesis-focused E2E performance tests. Each spec measures a specific area of the
app and writes timing data to `reports/playwright/`. All specs use the seeded
user — no registration required.

---

## Spec Files

| File | Report JSON | What it measures | Thesis techniques |
|------|-------------|-----------------|-------------------|
| `auth.spec.js` | `{label}.auth.performance.json` | login, logout, re-login timing | S3 (rate limiting), S7 (cookie auth) |
| `route-readiness.spec.js` | `{label}.route-readiness.performance.json` | SPA navigation time per page | P4 (lazy loading) |
| `dashboard.spec.js` | `{label}.dashboard.performance.json` | filter re-render per section (KPI, Trends, Breakdown, Health, Activity) | P1 (memo), P2 (useMemo), P3 (useCallback) |
| `transactions.spec.js` | `{label}.transactions.performance.json` | initial load, search, date/amount/flow/sort filters, combined | P5 (virtualization), P6 (debounce) |
| `accounts.spec.js` | `{label}.accounts.performance.json` | page load, modal open, create account, deposit | S4 (validation), S7 (cookie auth) |
| `transfer-pay.spec.js` | `{label}.transfer-pay.performance.json` | transfer fill + submit, pay fill + submit, complete flow | S4, S7 |
| `settings.spec.js` | `{label}.settings.performance.json` | page load, profile update, password change (restored after) | S4, S7 |
| `user-journey.spec.js` | `{label}.user-journey.performance.json` | full session: login → create → deposit → transfer → pay → dashboard → transactions → settings → logout | All techniques combined |

---

## Utilities

| File | Purpose |
|------|---------|
| `utils/metrics.js` | `PerformanceRecorder` — `measure(name, fn)`, `record(name, ms)`, `flush()`. Statistics: mean, min, max, p95, std_dev |
| `utils/helpers.js` | `loginThroughUi`, `logoutThroughUi`, `openNavigation`, `getSelectOptions`, `selectOptionByText`, `measureApiCall` |
| `utils/config.js` | Env var exports: `playwrightUser`, `thesisVariant`, `resultsLabel`, `playwrightReportDir` |

---

## Recommended Workflow Per Variant

```bash
# 1. Seed deterministic data
npm run seed:db

# 2. Start the app
npm run dev

# 3. Run all specs (produces 8 JSON report files)
THESIS_VARIANT=base PLAYWRIGHT_RESULTS_LABEL=base npm run audit:playwright

# 4. Summarize into summary.json
npm run audit:playwright:summary

# 5. (After implementing V2) compare
node scripts/comparePlaywright.js base base-performance
```

---

## Run Individual Specs

```bash
THESIS_VARIANT=base npm run audit:playwright:auth
THESIS_VARIANT=base npm run audit:playwright:routes
THESIS_VARIANT=base npm run audit:playwright:dashboard
THESIS_VARIANT=base npm run audit:playwright:transactions
THESIS_VARIANT=base npm run audit:playwright:accounts
THESIS_VARIANT=base npm run audit:playwright:transfer-pay
THESIS_VARIANT=base npm run audit:playwright:settings
THESIS_VARIANT=base npm run audit:playwright:journey
```

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `THESIS_VARIANT` | `base` | Labels the variant being measured |
| `PLAYWRIGHT_RESULTS_LABEL` | same as `THESIS_VARIANT` | Prefix for report filenames |
| `PLAYWRIGHT_REPEAT_EACH` | `3` | Repetitions per test (more = better statistics) |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:5173` | App URL |
| `PLAYWRIGHT_EMAIL` | `sathis@gmail.com` | Seed user email |
| `PLAYWRIGHT_PASSWORD` | `123` | Seed user password |
| `PLAYWRIGHT_HEADLESS` | `true` | Set `false` to watch tests run |

---

## Report Format

Each JSON report contains:
- `suite` — spec name
- `variant` — thesis variant label
- `runs[]` — one entry per test repetition with `measurements[]`
- `summary` — aggregated stats per operation: `mean_ms`, `min_ms`, `max_ms`, `p95_ms`, `std_dev_ms`

Use `p95_ms` for thesis comparisons — it captures worst-case user experience
more reliably than mean across repeated runs.
