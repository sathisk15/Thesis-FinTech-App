#!/usr/bin/env bash
# run-all-audits.sh
# Runs the full Lighthouse + Playwright audit pipeline for all 3 thesis variants
# in sequence: base (dev) → base-performance (prod) → base-performance-security (prod)
#
# ACTIVITY_LOG.md is gitignored so branch switches don't cause conflicts.
#
# Usage (from repo root):
#   chmod +x scripts/runners/run-all-audits.sh   # first time only
#   ./scripts/runners/run-all-audits.sh

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

BACKEND_PID=""
FRONTEND_PID=""
PREVIEW_PID=""
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# ── Cleanup trap ─────────────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo "── Stopping any running servers ────────────────────────────────────"
  [ -n "$PREVIEW_PID"  ] && kill "$PREVIEW_PID"  2>/dev/null || true
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
  [ -n "$BACKEND_PID"  ] && kill "$BACKEND_PID"  2>/dev/null || true
  lsof -ti:5173 | xargs kill -9 2>/dev/null || true
  lsof -ti:4000 | xargs kill -9 2>/dev/null || true
  echo "── Servers stopped ─────────────────────────────────────────────────"
  echo ""
  echo "── Returning to original branch: $ORIGINAL_BRANCH ─────────────────"
  git checkout "$ORIGINAL_BRANCH" 2>/dev/null || true
}
trap cleanup EXIT

# ── Helpers ───────────────────────────────────────────────────────────────────
stop_servers() {
  [ -n "$PREVIEW_PID"  ] && kill "$PREVIEW_PID"  2>/dev/null || true
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
  [ -n "$BACKEND_PID"  ] && kill "$BACKEND_PID"  2>/dev/null || true
  PREVIEW_PID=""
  FRONTEND_PID=""
  BACKEND_PID=""
  lsof -ti:5173 | xargs kill -9 2>/dev/null || true
  lsof -ti:4000 | xargs kill -9 2>/dev/null || true
  sleep 1
}

wait_for_servers() {
  local BACKEND_READY=false
  local FRONTEND_READY=false
  local ELAPSED=0

  echo "── Waiting for servers to be ready (max 90s) ───────────────────────"
  while [ $ELAPSED -lt 90 ]; do
    if [ "$BACKEND_READY" = false ] && curl -sf http://localhost:4000/api/healthCheck > /dev/null 2>&1; then
      echo "  ✓ Backend ready"
      BACKEND_READY=true
    fi
    if [ "$FRONTEND_READY" = false ] && curl -sf http://localhost:5173 > /dev/null 2>&1; then
      echo "  ✓ Frontend ready"
      FRONTEND_READY=true
    fi
    [ "$BACKEND_READY" = true ] && [ "$FRONTEND_READY" = true ] && break
    sleep 2
    ELAPSED=$((ELAPSED + 2))
  done

  if [ "$BACKEND_READY" = false ] || [ "$FRONTEND_READY" = false ]; then
    echo ""
    echo "❌  Servers did not start within 90s."
    echo "    Backend log  : /tmp/thesis-backend.log"
    echo "    Frontend log : /tmp/thesis-frontend.log"
    echo "    Preview log  : /tmp/thesis-preview.log"
    exit 1
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        THESIS FULL AUDIT — ALL 3 VARIANTS                   ║"
echo "║  base  →  base-performance  →  base-performance-security     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ═════════════════════════════════════════════════════════════════════════════
# VARIANT 1 — base  (dev server)
# ═════════════════════════════════════════════════════════════════════════════
echo "══════════════════════════════════════════════════════════════"
echo "  [1/3] BASE — V1 baseline (dev mode)"
echo "══════════════════════════════════════════════════════════════"

git checkout base

echo ""
echo "── Installing dependencies ──────────────────────────────────────────"
npm install --prefix backend --silent
npm install --prefix frontend --silent

echo ""
echo "── Seeding database ────────────────────────────────────────────────"
npm run seed:db

stop_servers

echo ""
echo "── Starting backend (port 4000) ────────────────────────────────────"
node backend/server.js > /tmp/thesis-backend.log 2>&1 &
BACKEND_PID=$!

echo "── Starting frontend dev server (port 5173) ─────────────────────────"
npm run dev --prefix frontend > /tmp/thesis-frontend.log 2>&1 &
FRONTEND_PID=$!

wait_for_servers

echo ""
echo "── Running audit pipeline ──────────────────────────────────────────"
THESIS_VARIANT=base \
  AUDIT_LABEL=base \
  PLAYWRIGHT_RESULTS_LABEL=base \
  npm run pipeline

stop_servers
echo ""
echo "  ✓ base audit complete"

# ═════════════════════════════════════════════════════════════════════════════
# VARIANT 2 — base-performance  (prod build)
# ═════════════════════════════════════════════════════════════════════════════
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  [2/3] BASE-PERFORMANCE — V2 optimised (prod build)"
echo "══════════════════════════════════════════════════════════════"

git checkout base-performance

echo ""
echo "── Installing dependencies ──────────────────────────────────────────"
npm install --prefix backend --silent
npm install --prefix frontend --silent

echo ""
echo "── Building frontend (production) ──────────────────────────────────"
npm run build --prefix frontend

echo ""
echo "── Seeding database ────────────────────────────────────────────────"
npm run seed:db

stop_servers

echo ""
echo "── Starting backend (port 4000) ────────────────────────────────────"
node backend/server.js > /tmp/thesis-backend.log 2>&1 &
BACKEND_PID=$!

echo "── Serving production build (port 5173) ─────────────────────────────"
npm run preview --prefix frontend -- --port 5173 > /tmp/thesis-preview.log 2>&1 &
PREVIEW_PID=$!

wait_for_servers

echo ""
echo "── Running audit pipeline ──────────────────────────────────────────"
THESIS_VARIANT=base-performance \
  AUDIT_LABEL=base-performance \
  PLAYWRIGHT_RESULTS_LABEL=base-performance \
  npm run pipeline

stop_servers
echo ""
echo "  ✓ base-performance audit complete"

# ═════════════════════════════════════════════════════════════════════════════
# VARIANT 3 — base-performance-security  (prod build)
# ═════════════════════════════════════════════════════════════════════════════
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  [3/3] BASE-PERFORMANCE-SECURITY — V3 secured (prod build)"
echo "══════════════════════════════════════════════════════════════"

git checkout base-performance-security

echo ""
echo "── Installing dependencies ──────────────────────────────────────────"
npm install --prefix backend --silent
npm install --prefix frontend --silent

echo ""
echo "── Building frontend (production) ──────────────────────────────────"
npm run build --prefix frontend

echo ""
echo "── Seeding database ────────────────────────────────────────────────"
npm run seed:db

stop_servers

echo ""
echo "── Starting backend (port 4000) ────────────────────────────────────"
node backend/server.js > /tmp/thesis-backend.log 2>&1 &
BACKEND_PID=$!

echo "── Serving production build (port 5173) ─────────────────────────────"
npm run preview --prefix frontend -- --port 5173 > /tmp/thesis-preview.log 2>&1 &
PREVIEW_PID=$!

wait_for_servers

echo ""
echo "── Running audit pipeline ──────────────────────────────────────────"
THESIS_VARIANT=base-performance-security \
  AUDIT_LABEL=base-performance-security \
  PLAYWRIGHT_RESULTS_LABEL=base-performance-security \
  npm run pipeline

stop_servers
echo ""
echo "  ✓ base-performance-security audit complete"

# ═════════════════════════════════════════════════════════════════════════════
# Done — generate HTML report
# ═════════════════════════════════════════════════════════════════════════════
echo ""
echo "── Generating HTML report ──────────────────────────────────────────"
node scripts/report/generateReport.js

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ALL AUDITS COMPLETE                                         ║"
echo "║                                                              ║"
echo "║  Reports : performance-reports/lighthouse/*.json             ║"
echo "║            performance-reports/playwright/*.json             ║"
echo "║  Dashboard: performance-reports/index.html                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
