#!/usr/bin/env bash
# run-base-audit.sh
# Runs the full Lighthouse + Playwright audit pipeline for the `base` (V1) branch
# in dev mode, then commits the generated reports back to the `base` branch.
#
# Usage (from repo root):
#   chmod +x scripts/runners/run-base-audit.sh   # first time only
#   ./scripts/runners/run-base-audit.sh

set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

BACKEND_PID=""
FRONTEND_PID=""

# ── Cleanup trap ────────────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo "── Stopping dev servers ────────────────────────────────────────────"
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
  [ -n "$BACKEND_PID"  ] && kill "$BACKEND_PID"  2>/dev/null || true
  # Also clear the ports in case sub-processes forked
  lsof -ti:5173 | xargs kill -9 2>/dev/null || true
  lsof -ti:4000 | xargs kill -9 2>/dev/null || true
  echo "── Servers stopped ─────────────────────────────────────────────────"
}
trap cleanup EXIT

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  BASE AUDIT PIPELINE"
echo "══════════════════════════════════════════════════════════════"
echo ""

# ── 1. Switch to base branch ─────────────────────────────────────────────────
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "base" ]; then
  echo "── Switching to base branch ────────────────────────────────────────"
  git checkout base
fi

# ── 3. Install frontend deps ────────────────────────────────────────────────
echo ""
echo "── Installing frontend dependencies ────────────────────────────────"
npm install --prefix frontend --silent

# ── 4. Seed the database ─────────────────────────────────────────────────────
echo ""
echo "── Seeding database ────────────────────────────────────────────────"
npm run seed:db

# ── 5. Kill stale servers ────────────────────────────────────────────────────
echo ""
echo "── Clearing ports 4000 and 5173 ───────────────────────────────────"
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# ── 6. Start backend ─────────────────────────────────────────────────────────
echo ""
echo "── Starting backend (port 4000) ────────────────────────────────────"
node backend/server.js > /tmp/thesis-backend.log 2>&1 &
BACKEND_PID=$!

# ── 7. Start frontend dev server ─────────────────────────────────────────────
echo "── Starting frontend dev server (port 5173) ────────────────────────"
npm run client > /tmp/thesis-frontend.log 2>&1 &
FRONTEND_PID=$!

# ── 8. Wait for both servers ─────────────────────────────────────────────────
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
      echo "  ✓ Frontend ready"
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
  echo "    Backend log: /tmp/thesis-backend.log"
  echo "    Frontend log: /tmp/thesis-frontend.log"
  exit 1
fi

# ── 9. Run the audit pipeline ────────────────────────────────────────────────
echo ""
echo "── Running audit pipeline ──────────────────────────────────────────"
THESIS_VARIANT=base AUDIT_LABEL=base PLAYWRIGHT_RESULTS_LABEL=base npm run pipeline

# ── 10. Kill servers (cleanup trap handles this, but be explicit) ────────────
[ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
[ -n "$BACKEND_PID"  ] && kill "$BACKEND_PID"  2>/dev/null || true
FRONTEND_PID=""
BACKEND_PID=""

# ── 11. Commit the reports ───────────────────────────────────────────────────
echo ""
echo "── Committing reports to base branch ───────────────────────────────"

git add performance-reports/

if git diff --cached --quiet; then
  echo "  No report changes to commit (reports unchanged)."
else
  git commit -m "$(cat <<'EOF'
measurement(base): audit pipeline run — Lighthouse + Playwright

performance-reports/lighthouse/base.json
- Updated Lighthouse performance scores for V1 baseline (dev mode)

performance-reports/playwright/base.*.performance.json
- Updated Playwright timing metrics for all 8 spec suites

performance-reports/playwright/summary.json
- Aggregated summary across all Playwright specs

ACTIVITY_LOG.md
- Auto-updated by runPipeline.js with [MEASUREMENT] entry

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
  echo "  ✓ Reports committed on base branch"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  DONE — base audit complete"
echo "  Reports: performance-reports/lighthouse/base.json"
echo "           performance-reports/playwright/base.*.performance.json"
echo "══════════════════════════════════════════════════════════════"
echo ""
