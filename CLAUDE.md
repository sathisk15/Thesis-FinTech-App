# CLAUDE.md — Coding Assistant Rules

Rules for Claude when working in this repository. These apply to every session unless the user explicitly overrides.

---

## 1. Project Identity

This is a **thesis research application**. Stability and measurability come before new features. Every change that touches performance-sensitive code should be considered in light of its effect on Lighthouse and Playwright audit metrics.

- **Do not add speculative features** not requested by the user
- **Do not refactor** working code unless explicitly asked
- **Do not break audit infrastructure** — Lighthouse, Playwright, SonarQube pipelines must stay functional
- **Do not change port numbers** — frontend: 5173, backend: 4000, Lighthouse debug: 9222

---

## 2. Code Style

### Frontend
- **Styling:** Tailwind CSS only. No separate `.css` files, no CSS modules, no inline `style={}` objects
- **State:** Zustand stores only (`useAuthStore`, `useAccountStore`, `useTransactionStore`). No Redux, no Context for global state
- **HTTP:** Always use the configured Axios instance from `frontend/src/api/axios.js`. Never use `fetch()` directly
- **Icons:** Use `react-icons` (already installed). Do not add icon libraries
- **Charts:** Use Recharts (already installed). Do not add charting libraries

### Backend
- **DB Access:** Use `better-sqlite3` synchronous API. No async DB calls
- **Auth:** All protected routes must use the `auth.middleware.js` middleware
- **Response shape:** `{ success: true, data: ... }` for success, `{ success: false, message: '...' }` for errors

---

## 3. File & Component Conventions

| Pattern | Rule |
|---------|------|
| Page components | Must be named `*Page.jsx` (e.g., `DashboardPage.jsx`) |
| Feature folders | Lowercase, singular (e.g., `dashboard/`, `transfer/`) |
| Shared components | PascalCase (e.g., `NavBar.jsx`, `SideBar.jsx`) |
| Sub-components of a page | Live in `features/{feature}/components/` |
| Zustand stores | Named `use*Store.js` in `frontend/src/store/` |
| New backend controllers | Named `*.controller.js` in `backend/controllers/` |
| New backend routes | Named `*.routes.js` in `backend/routes/` |

**Note:** Two existing folders have typos — do not rename them without being asked, as imports reference them:
- `features/transations/` (missing 'c')
- `shared/componenets/` (extra 'e')

---

## 4. Test ID Rules

Every new interactive element must have a `data-testid`. Without this, Playwright tests cannot target them.

**Convention:** `{feature}-{element}` in kebab-case

```jsx
// Good
<input data-testid="transfer-amount" />
<button data-testid="transfer-submit">Submit</button>

// Bad — missing testid, inconsistent casing
<input />
<button data-testid="TransferSubmit">Submit</button>
```

**Existing test IDs are documented in `PROJECT_REFERENCE.md` section 7.** When adding new pages or features, append the new test IDs there.

---

## 5. What NOT to Do

- **Do not install new npm packages** without asking the user first
- **Do not modify `.env`** — this configures live audit runs
- **Do not change `SEED_DB_SEED`** — this key controls deterministic data; changing it invalidates historical comparisons
- **Do not delete or modify files under `reports/`** — these are audit outputs
- **Do not add Jest or Vitest unit tests** — this thesis uses Playwright exclusively for testing
- **Do not add a `README.md`** unless asked — `PROJECT_REFERENCE.md` is the project doc
- **Do not disable or bypass the JWT auth middleware** on any route
- **Do not remove `data-testid` attributes** from existing elements

---

## 6. Audit Awareness

When making changes, consider the effect on these audits:

| Audit | Tool | Output |
|-------|------|--------|
| Page performance | Lighthouse (Puppeteer) | `reports/lighthouse/` |
| E2E timing | Playwright | `reports/playwright/` |
| Code quality | SonarQube | External server |

- Lighthouse measures authenticated pages — auth flow must stay working
- Playwright uses specific `data-testid` selectors — removing/renaming IDs breaks tests
- SonarQube scans `frontend/` and `backend/` — avoid introducing obvious code smells

---

## 7. Git Discipline

- **Small, focused commits** — one logical change per commit
- **Do not commit `.env`** — it contains a real SonarQube token
- **Do not amend pushed commits** — create new commits to fix issues
- **Branch:** Work on `main` unless user specifies otherwise
- **Do not force-push** without explicit user instruction

---

## 8. Activity Log — `ACTIVITY_LOG.md`

After every session where code was changed, append a new entry to `ACTIVITY_LOG.md` at the top of the log (below the `## 2026` heading). Use the template at the bottom of that file.

**Always include:**
- Date (`YYYY-MM-DD`)
- Category tag(s): `[FEATURE]`, `[FIX]`, `[MEASUREMENT]`, `[TEST]`, `[REFACTOR]`, `[CONFIG]`, `[DOCS]`, `[SECURITY]`, `[CLEANUP]`
- What changed (bullet points)
- **Purpose:** why it was done / thesis relevance
- Commit hash if a commit was made
- Key files added or modified

This log is the primary reference for thesis writing — it must be accurate and up to date.

---

## 9. When to Update `PROJECT_REFERENCE.md`

Update the relevant section of `PROJECT_REFERENCE.md` when:

| Change | Section to Update |
|--------|-------------------|
| New npm dependency added | Section 2 (Tech Stack) |
| New page or route added | Section 4 (Routing) |
| New API endpoint added | Section 4 (Routing → API Routes) |
| New `data-testid` added | Section 7 (Test IDs) |
| DB schema change | Section 6 (Database Schema) |
| New env variable added | Section 9 (Environment Variables) |
| New npm script added | Section 8 (NPM Scripts) |
| New bug discovered | Section 11 (Known Issues) |
| Bug fixed | Remove from Section 11 |
| Enhancement completed | Remove from Section 12 (Roadmap) |

---

## 10. Enhancement Priority Order

When the user asks for "improvements" or "enhancements" without specifying, use this priority order (from `PROJECT_REFERENCE.md` section 12):

1. Move JWT secret to `JWT_SECRET` env var
2. Add rate limiting on auth endpoints
3. Re-enable ESLint in `frontend/eslint.config.js`
4. Remove debug `console.log` calls
5. Fix folder typos
6. Add pagination to `GET /transactions`
7. Re-enable `<StrictMode>` in `main.jsx`
8. Clean up commented-out code blocks
9. Improve health check to verify DB connectivity
10. Add request logging middleware

---

## 11. Quick Reference

```bash
# Start full app
npm run dev

# Reseed database
npm run seed:db

# Run all audits
npm run audit:all

# Run specific audits
npm run audit:lighthouse
npm run audit:playwright
npm run audit:sonar

# Compare two lighthouse runs
npm run audit:compare

# Summarize playwright reports
npm run audit:playwright:summary
```

**Default test credentials:** `sathis@gmail.com` / `123`
**Backend:** `http://localhost:4000/api`
**Frontend:** `http://localhost:5173`
