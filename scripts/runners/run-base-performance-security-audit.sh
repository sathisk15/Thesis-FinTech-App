#!/usr/bin/env bash
# run-base-performance-security-audit.sh
# Runs the full Lighthouse + Playwright audit pipeline for the `base-performance-security` (V3) branch
# using a production build served via `vite preview` on port 5173.
#
# Usage (from repo root):
#   chmod +x scripts/runners/run-base-performance-security-audit.sh   # first time only
#   ./scripts/runners/run-base-performance-security-audit.sh

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

BACKEND_PID=""
PREVIEW_PID=""

# ── Cleanup trap ────────────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo "── Stopping servers ────────────────────────────────────────────────"
  [ -n "$PREVIEW_PID" ] && kill "$PREVIEW_PID" 2>/dev/null || true
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
  lsof -ti:5173 | xargs kill -9 2>/dev/null || true
  lsof -ti:4000 | xargs kill -9 2>/dev/null || true
  echo "── Servers stopped ─────────────────────────────────────────────────"
}
trap cleanup EXIT

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  BASE-PERFORMANCE-SECURITY AUDIT PIPELINE (prod build)"
echo "══════════════════════════════════════════════════════════════"
echo ""

# ── 1. Switch to base-performance-security branch ───────────────────────────
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "base-performance-security" ]; then
  echo "── Switching to base-performance-security branch ───────────────────"
  git checkout base-performance-security
fi

# ── 2. Install backend deps ───────────────────────────────────────────────────
echo ""
echo "── Installing backend dependencies ─────────────────────────────────"
npm install --prefix backend --silent

# ── 3. Install frontend deps ─────────────────────────────────────────────────
echo ""
echo "── Installing frontend dependencies ────────────────────────────────"
npm install --prefix frontend --silent

# ── 4. Build frontend for production ─────────────────────────────────────────
echo ""
echo "── Building frontend (production) ──────────────────────────────────"
npm run build --prefix frontend

# ── 5. Seed the database ─────────────────────────────────────────────────────
echo ""
echo "── Seeding database ────────────────────────────────────────────────"
npm run seed:db

# ── 6. Kill stale servers ────────────────────────────────────────────────────
echo ""
echo "── Clearing ports 4000 and 5173 ───────────────────────────────────"
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# ── 7. Start backend ─────────────────────────────────────────────────────────
echo ""
echo "── Starting backend (port 4000) ────────────────────────────────────"
node backend/server.js > /tmp/thesis-backend.log 2>&1 &
BACKEND_PID=$!

# ── 8. Serve production build via vite preview (port 5173) ───────────────────
echo "── Serving production build via vite preview (port 5173) ──────────"
npm run preview --prefix frontend -- --port 5173 > /tmp/thesis-preview.log 2>&1 &
PREVIEW_PID=$!

# ── 9. Wait for both servers ─────────────────────────────────────────────────
echo ""
echo "── Waiting for servers to be ready (max 90s) ───────────────────────"

BACKEND_READY=false
FRONTEND_READY=false
ELAPSED=0

while [ $ELAPSED -lt 90 ]; do
  if [ "$BACKEND_READY" = false ]; then
    if curl -sf http://localhost:4000/api/healthCheck > /dev/null 2>&1; then
      echo "  ✓ Backend ready"
      BACKEND_READY=true
    fi
  fi

  if [ "$FRONTEND_READY" = false ]; then
    if curl -sf http://localhost:5173 > /dev/null 2>&1; then
      echo "  ✓ Frontend (prod) ready"
      FRONTEND_READY=true
    fi
  fi

  if [ "$BACKEND_READY" = true ] && [ "$FRONTEND_READY" = true ]; then
    break
  fi

  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

if [ "$BACKEND_READY" = false ] || [ "$FRONTEND_READY" = false ]; then
  echo ""
  echo "❌  Servers did not start within 90s."
  echo "    Backend log : /tmp/thesis-backend.log"
  echo "    Preview log : /tmp/thesis-preview.log"
  exit 1
fi

# ── 10. Run the audit pipeline ───────────────────────────────────────────────
echo ""
echo "── Running audit pipeline ──────────────────────────────────────────"
THESIS_VARIANT=base-performance-security \
  AUDIT_LABEL=base-performance-security \
  PLAYWRIGHT_RESULTS_LABEL=base-performance-security \
  npm run pipeline

# ── 11. Kill servers ─────────────────────────────────────────────────────────
[ -n "$PREVIEW_PID" ] && kill "$PREVIEW_PID" 2>/dev/null || true
[ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
PREVIEW_PID=""
BACKEND_PID=""

# ── 12. Commit the reports ───────────────────────────────────────────────────
echo ""
echo "── Committing reports to base-performance-security branch ──────────"

git add reports/

if git diff --cached --quiet; then
  echo "  No report changes to commit (reports unchanged)."
else
  git commit -m "$(cat <<'EOF'
measurement(base-performance-security): audit pipeline run — Lighthouse + Playwright

performance-reports/lighthouse/base-performance-security.json
- Updated Lighthouse performance scores for V3 (prod build, vite preview)

performance-reports/playwright/base-performance-security.*.performance.json
- Updated Playwright timing metrics for all 8 spec suites

performance-reports/playwright/summary.json
- Aggregated summary across all Playwright specs

ACTIVITY_LOG.md
- Auto-updated by runPipeline.js with [MEASUREMENT] entry
EOF
)"
  echo "  ✓ Reports committed on base-performance-security branch"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  DONE — base-performance-security audit complete (prod build)"
echo "  Reports: performance-reports/lighthouse/base-performance-security.json"
echo "           performance-reports/playwright/base-performance-security.*.performance.json"
echo "══════════════════════════════════════════════════════════════"
echo ""
