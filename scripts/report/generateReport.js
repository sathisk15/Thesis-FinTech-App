/**
 * generateReport.js
 *
 * Reads all Lighthouse + Playwright JSON data from performance-reports/
 * and produces a single self-contained performance-reports/index.html
 * with embedded data, interactive charts, and filters.
 *
 * Usage:
 *   node scripts/generateReport.js
 */

import '../../config/loadEnv.js';
import fs from 'fs';
import path from 'path';

const ROOT        = path.resolve('performance-reports');
const LH_DIR      = path.join(ROOT, 'lighthouse');
const PW_DIR      = path.join(ROOT, 'playwright');
const OUTPUT      = path.join(ROOT, 'index.html');
const VARIANTS    = ['base', 'base-performance', 'base-performance-security'];
const PW_EXCLUDED = new Set(['summary.json', 'pw_results.json']);

// ── 1. Load Lighthouse data ──────────────────────────────────────────────────
const lhData = {};
for (const v of VARIANTS) {
  const fp = path.join(LH_DIR, `${v}.json`);
  if (!fs.existsSync(fp)) continue;
  const raw = JSON.parse(fs.readFileSync(fp, 'utf8'));
  lhData[v] = {};
  for (const [page, val] of Object.entries(raw)) {
    if (page === '_meta') continue;
    lhData[v][page] = val.statistics;
  }
}

// ── 2. Load Playwright data ──────────────────────────────────────────────────
const pwData = {}; // { suite: { variant: { metric: statistics } } }
if (fs.existsSync(PW_DIR)) {
  for (const file of fs.readdirSync(PW_DIR).filter(f => f.endsWith('.json') && !PW_EXCLUDED.has(f))) {
    const raw = JSON.parse(fs.readFileSync(path.join(PW_DIR, file), 'utf8'));
    const meta    = raw._meta || {};
    const suite   = meta.suite   || file.replace(/\.performance\.json$/, '');
    const variant = meta.variant || meta.label || 'unknown';
    if (!pwData[suite]) pwData[suite] = {};
    pwData[suite][variant] = {};
    for (const [key, val] of Object.entries(raw)) {
      if (key === '_meta') continue;
      pwData[suite][variant][key] = val.statistics;
    }
  }
}

// ── 3. Build human-readable labels ───────────────────────────────────────────
const VARIANT_LABELS = {
  'base':                       'V1 — Base',
  'base-performance':           'V2 — Performance',
  'base-performance-security':  'V3 — Security',
};
const VARIANT_DESC = {
  'base':                       'Unoptimised baseline. No React optimisations, no security hardening.',
  'base-performance':           'P1–P7 applied: React.memo, useMemo, useCallback, lazy loading, react-window, debounce.',
  'base-performance-security':  'S1–S10 added: Helmet, CSP, rate limiting, input validation, HttpOnly JWT, DOMPurify, CORS.',
};
const SUITE_LABELS = {
  'auth-timing':                    'Authentication',
  'accounts-operations':            'Accounts',
  'dashboard-operations':           'Dashboard',
  'transactions-operations':        'Transactions',
  'transfer-pay-operations':        'Transfer & Pay',
  'settings-operations':            'Settings',
  'authenticated-route-readiness':  'Route Readiness',
  'full-finance-user-journey':      'User Journey',
};
const METRIC_LABELS = {
  performance:  'Performance Score (0–100)',
  fcp:          'First Contentful Paint',
  lcp:          'Largest Contentful Paint',
  tbt:          'Total Blocking Time',
  speedIndex:   'Speed Index',
  cls:          'Cumulative Layout Shift',
};
const METRIC_DESC = {
  performance:  'Composite score (higher = better). Weighted combination of FCP, TBT, LCP, CLS, Speed Index.',
  fcp:          'Time until the first content is painted. Lower = faster perceived load.',
  lcp:          'Time until the largest visible content element is rendered. Lower = better.',
  tbt:          'Total time the main thread was blocked (>50ms tasks). Lower = more responsive.',
  speedIndex:   'How quickly content is visually populated during load. Lower = better.',
  cls:          'Measures unexpected layout shifts. Lower = more stable layout.',
};

const generated = new Date().toISOString();

// ── 4. Emit HTML ─────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>E-Wallet · Performance Report</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"><\/script>
<style>
  :root {
    --bg:       #f8fafc;
    --surface:  #ffffff;
    --border:   #e2e8f0;
    --text:     #0f172a;
    --muted:    #64748b;
    --accent:   #2563eb;
    --v1:       #dc2626;
    --v1-light: #fca5a5;
    --v2:       #2563eb;
    --v2-light: #93c5fd;
    --v3:       #16a34a;
    --v3-light: #86efac;
    --radius:   12px;
    --shadow:   0 1px 3px rgba(15,23,42,.07), 0 1px 2px rgba(15,23,42,.05);
    --shadow-md:0 4px 12px rgba(15,23,42,.08), 0 2px 4px rgba(15,23,42,.05);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.5; }

  /* ── Topbar ── */
  .topbar {
    position: sticky; top: 0; z-index: 20;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 56px;
    background: rgba(248,250,252,0.92); backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow);
  }
  .topbar-brand { display: flex; align-items: center; gap: 10px; }
  .topbar-logo {
    width: 34px; height: 34px; border-radius: 9px;
    background: #2563eb; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; letter-spacing: -.5px;
  }
  .topbar-name { font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: -.01em; }
  .topbar-name em { color: var(--accent); font-style: normal; }
  .topbar-sep { color: var(--border); margin: 0 8px; font-size: 18px; }
  .topbar-sub { font-size: 13px; color: var(--muted); font-weight: 500; }
  .topbar-right { display: flex; align-items: center; gap: 16px; }
  .topbar-meta { font-size: 12px; color: var(--muted); }
  .topbar-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; background: #dbeafe; color: #1d4ed8; }

  /* ── Layout ── */
  .wrap { max-width: 1440px; margin: 0 auto; padding: 28px 24px 60px; }

  /* ── Variant cards row ── */
  .variant-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
  .variant-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 18px 20px;
    box-shadow: var(--shadow); position: relative; overflow: hidden;
  }
  .variant-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  }
  .variant-card.v1::before { background: var(--v1); }
  .variant-card.v2::before { background: var(--v2); }
  .variant-card.v3::before { background: var(--v3); }
  .vc-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .vc-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; }
  .vc-label.v1 { color: var(--v1); }
  .vc-label.v2 { color: var(--v2); }
  .vc-label.v3 { color: var(--v3); }
  .vc-score { font-size: 32px; font-weight: 800; line-height: 1; }
  .vc-score.v1 { color: var(--v1); }
  .vc-score.v2 { color: var(--v2); }
  .vc-score.v3 { color: var(--v3); }
  .vc-score-label { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .vc-desc { font-size: 12px; color: var(--muted); margin-bottom: 12px; line-height: 1.4; }
  .score-bar-track { height: 6px; background: var(--border); border-radius: 999px; overflow: hidden; }
  .score-bar-fill { height: 100%; border-radius: 999px; transition: width .6s ease; }

  /* ── Insight strip ── */
  .insights { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 32px; }
  .insight {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 14px 16px;
    box-shadow: var(--shadow);
    display: flex; align-items: flex-start; gap: 12px;
  }
  .insight-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .insight-body {}
  .insight-val { font-size: 20px; font-weight: 800; line-height: 1; }
  .insight-lbl { font-size: 11px; color: var(--muted); margin-top: 2px; }

  /* ── Section ── */
  .section { margin-bottom: 52px; }
  .section-head {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid var(--border);
    gap: 16px;
  }
  .section-head-left {}
  .section-title { font-size: 17px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }
  .section-title-icon { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .section-desc { font-size: 12px; color: var(--muted); margin-top: 4px; max-width: 600px; }

  /* ── Controls ── */
  .controls { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; align-items: center; }
  .ctrl-group { display: flex; align-items: center; gap: 8px; }
  .ctrl-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); white-space: nowrap; }
  .pills { display: flex; gap: 4px; flex-wrap: wrap; }
  .pill {
    padding: 5px 12px; border-radius: 7px; border: 1px solid var(--border);
    background: var(--surface); color: var(--muted);
    cursor: pointer; font-size: 12px; font-weight: 500; transition: all .12s;
  }
  .pill:hover { border-color: var(--accent); color: var(--accent); background: #eff6ff; }
  .pill.active { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }

  /* ── Chart panel ── */
  .panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 24px; box-shadow: var(--shadow); margin-bottom: 16px; }
  .panel-title { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 14px; }
  .metric-hint { font-size: 12px; color: var(--muted); padding: 10px 14px; background: #f1f5f9; border-radius: 8px; margin-bottom: 16px; border-left: 3px solid var(--accent); }

  /* ── Table ── */
  .tbl-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { background: #f8fafc; }
  th {
    padding: 9px 12px; text-align: left;
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
    color: var(--muted); border-bottom: 2px solid var(--border); white-space: nowrap;
  }
  th.right { text-align: right; }
  td { padding: 9px 12px; border-bottom: 1px solid var(--border); white-space: nowrap; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #f8fafc; }
  .td-right { text-align: right; }
  .cell-v1 { color: var(--v1); font-weight: 700; }
  .cell-v2 { color: var(--v2); font-weight: 700; }
  .cell-v3 { color: var(--v3); font-weight: 700; }
  .cell-muted { color: var(--muted); font-size: 12px; }
  .row-label { font-weight: 600; color: var(--text); }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
  .badge-up   { background: #dcfce7; color: #15803d; }
  .badge-down { background: #fee2e2; color: #b91c1c; }
  .badge-flat { color: var(--muted); }

  /* score mini-bar inside table cell */
  .sbar-wrap { display: flex; align-items: center; gap: 8px; }
  .sbar { height: 6px; width: 60px; background: var(--border); border-radius: 999px; overflow: hidden; flex-shrink: 0; }
  .sbar-fill { height: 100%; border-radius: 999px; }

  /* stat sub-row */
  .stat-chips { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 2px; }
  .stat-chip { font-size: 10px; padding: 1px 6px; border-radius: 4px; background: #f1f5f9; color: var(--muted); }

  /* ── Legend ── */
  .legend { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
  .legend-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--muted); font-weight: 500; }
  .ldot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }

  /* ── Hidden ── */
  .hidden { display: none !important; }

  @media (max-width: 900px) {
    .variant-row { grid-template-columns: 1fr; }
    .topbar-sub, .topbar-badge { display: none; }
  }
</style>
</head>
<body>

<!-- ── Topbar ── -->
<div class="topbar">
  <div class="topbar-brand">
    <div class="topbar-logo">E</div>
    <span class="topbar-name">E<em>-</em>Wallet</span>
    <span class="topbar-sep">|</span>
    <span class="topbar-sub">Thesis Performance Report</span>
  </div>
  <div class="topbar-right">
    <span class="topbar-badge">V1 → V2 → V3</span>
    <span class="topbar-meta">Generated ${generated.slice(0,10)} ${generated.slice(11,16)} UTC</span>
  </div>
</div>

<div class="wrap">

  <!-- ── Variant overview cards ── -->
  <div class="variant-row" id="variant-cards"></div>

  <!-- ── Key insights ── -->
  <div class="insights" id="insights"></div>

  <!-- ── Lighthouse section ── -->
  <div class="section">
    <div class="section-head">
      <div class="section-head-left">
        <div class="section-title">
          <div class="section-title-icon" style="background:#dbeafe;color:#1d4ed8">&#9680;</div>
          Lighthouse Audit
        </div>
        <div class="section-desc">Page-level performance scores from Lighthouse CI run against a production build (Vite preview, port 5173). Each page audited 5 times; statistics derived from all runs.</div>
      </div>
    </div>

    <div id="lh-metric-hint" class="metric-hint"></div>

    <div class="controls">
      <div class="ctrl-group">
        <span class="ctrl-label">Metric</span>
        <div class="pills" id="lh-metric-pills">
          <button class="pill active" data-metric="performance">Perf Score</button>
          <button class="pill" data-metric="fcp">FCP</button>
          <button class="pill" data-metric="lcp">LCP</button>
          <button class="pill" data-metric="tbt">TBT</button>
          <button class="pill" data-metric="speedIndex">Speed Index</button>
          <button class="pill" data-metric="cls">CLS</button>
        </div>
      </div>
      <div class="ctrl-group">
        <span class="ctrl-label">Stat</span>
        <div class="pills" id="lh-stat-pills">
          <button class="pill active" data-stat="mean">Mean</button>
          <button class="pill" data-stat="min">Min</button>
          <button class="pill" data-stat="max">Max</button>
        </div>
      </div>
      <div class="ctrl-group" style="margin-left:auto">
        <span class="ctrl-label">View</span>
        <div class="pills">
          <button class="pill active" id="lh-view-chart">Chart</button>
          <button class="pill" id="lh-view-table">Table</button>
        </div>
      </div>
    </div>

    <div id="lh-chart-panel" class="panel">
      <div class="panel-title">All pages — grouped by variant</div>
      <div style="position:relative;height:340px"><canvas id="lh-chart"></canvas></div>
    </div>

    <div id="lh-table-panel" class="panel hidden">
      <div class="panel-title">Full statistics — all pages × all variants</div>
      <div class="tbl-wrap"><table id="lh-table"></table></div>
    </div>
  </div>

  <!-- ── Playwright section ── -->
  <div class="section">
    <div class="section-head">
      <div class="section-head-left">
        <div class="section-title">
          <div class="section-title-icon" style="background:#dcfce7;color:#15803d">&#9654;</div>
          Playwright Timing
        </div>
        <div class="section-desc">End-to-end operation durations measured by Playwright across all test runs. Each operation timed repeatedly; statistics include mean, min, max, std dev, and p95.</div>
      </div>
    </div>

    <div class="controls">
      <div class="ctrl-group">
        <span class="ctrl-label">Suite</span>
        <div class="pills" id="pw-suite-pills"></div>
      </div>
      <div class="ctrl-group">
        <span class="ctrl-label">Stat</span>
        <div class="pills" id="pw-stat-pills">
          <button class="pill active" data-stat="mean">Mean</button>
          <button class="pill" data-stat="min">Min</button>
          <button class="pill" data-stat="max">Max</button>
          <button class="pill" data-stat="p95">P95</button>
        </div>
      </div>
      <div class="ctrl-group" style="margin-left:auto">
        <span class="ctrl-label">View</span>
        <div class="pills">
          <button class="pill active" id="pw-view-chart">Chart</button>
          <button class="pill" id="pw-view-table">Table</button>
        </div>
      </div>
    </div>

    <div id="pw-chart-panel" class="panel">
      <div class="panel-title" id="pw-panel-title">Select a suite above</div>
      <div style="position:relative;height:400px"><canvas id="pw-chart"></canvas></div>
    </div>

    <div id="pw-table-panel" class="panel hidden">
      <div class="panel-title">Full statistics — mean · min · max · std · p95</div>
      <div class="tbl-wrap"><table id="pw-table"></table></div>
    </div>
  </div>

</div><!-- /wrap -->

<script>
// ── Embedded data ─────────────────────────────────────────────────────────
const VARIANTS       = ${JSON.stringify(VARIANTS)};
const VARIANT_LABELS = ${JSON.stringify(VARIANT_LABELS)};
const VARIANT_DESC   = ${JSON.stringify(VARIANT_DESC)};
const SUITE_LABELS   = ${JSON.stringify(SUITE_LABELS)};
const METRIC_LABELS  = ${JSON.stringify(METRIC_LABELS)};
const METRIC_DESC    = ${JSON.stringify(METRIC_DESC)};
const LH_DATA        = ${JSON.stringify(lhData)};
const PW_DATA        = ${JSON.stringify(pwData)};

// ── Colors (solid) ───────────────────────────────────────────────────────
const VC = {
  // solid = text/card accent; bar = chart fill (lighter); border = chart stroke (darker)
  'base':                       { solid: '#dc2626', bar: '#f87171', border: '#b91c1c', bg: '#fee2e2', label: 'V1', cls: 'v1' },
  'base-performance':           { solid: '#2563eb', bar: '#60a5fa', border: '#1d4ed8', bg: '#dbeafe', label: 'V2', cls: 'v2' },
  'base-performance-security':  { solid: '#16a34a', bar: '#4ade80', border: '#15803d', bg: '#dcfce7', label: 'V3', cls: 'v3' },
};

// ── Helpers ───────────────────────────────────────────────────────────────
const higherBetter = m => m === 'performance';
const lowerBetter  = m => m !== 'performance';

function fmt(v, metric) {
  if (v == null || isNaN(v)) return '—';
  if (metric === 'cls')         return v.toFixed(4);
  if (metric === 'performance') return v.toFixed(1);
  if (v >= 1000) return (v / 1000).toFixed(2) + 's';
  return Math.round(v) + 'ms';
}
function fmtMs(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 1000) return (v / 1000).toFixed(2) + 's';
  return Math.round(v) + 'ms';
}
function pct(a, b) {
  if (a == null || b == null || a === 0) return null;
  return ((b - a) / a) * 100;
}
function deltaHtml(a, b, metric) {
  const p = pct(a, b);
  if (p == null) return '<span class="badge-flat">—</span>';
  const better = higherBetter(metric) ? p > 1 : p < -1;
  const worse  = higherBetter(metric) ? p < -1 : p > 1;
  const sign   = p > 0 ? '+' : '';
  if (better) return \`<span class="badge badge-up">\${sign}\${p.toFixed(1)}%</span>\`;
  if (worse)  return \`<span class="badge badge-down">\${sign}\${p.toFixed(1)}%</span>\`;
  return \`<span class="badge-flat" style="color:#64748b">\${sign}\${p.toFixed(1)}%</span>\`;
}

function scoreColor(s) {
  if (s >= 90) return '#16a34a';
  if (s >= 50) return '#d97706';
  return '#dc2626';
}

function statKey(metric, stat) {
  // LH data is stored as performance_mean, fcp_min, etc.
  return \`\${metric}_\${stat}\`;
}

const CHART_OPTS = {
  grid:  'rgba(226,232,240,1)',
  ticks: '#94a3b8',
};

// ── Error-bar plugin (std deviation whiskers on bars) ─────────────────────
const errorBarPlugin = {
  id: 'errorBars',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const isHoriz = chart.options.indexAxis === 'y';
    const vScale  = isHoriz ? chart.scales.x : chart.scales.y;

    chart.data.datasets.forEach((ds, i) => {
      if (!ds.errorBars) return;
      const meta = chart.getDatasetMeta(i);
      meta.data.forEach((bar, j) => {
        const std = ds.errorBars[j];
        const val = ds.data[j];
        if (std == null || std === 0 || val == null) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(30,41,59,0.75)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();

        if (isHoriz) {
          const cy   = bar.y;
          const xHi  = vScale.getPixelForValue(val + std);
          const xLo  = vScale.getPixelForValue(Math.max(0, val - std));
          const cap  = 6;
          ctx.moveTo(xLo, cy - cap); ctx.lineTo(xLo, cy + cap);
          ctx.moveTo(xLo, cy);       ctx.lineTo(xHi, cy);
          ctx.moveTo(xHi, cy - cap); ctx.lineTo(xHi, cy + cap);
        } else {
          const cx  = bar.x;
          const yHi = vScale.getPixelForValue(val + std);
          const yLo = vScale.getPixelForValue(Math.max(0, val - std));
          const cap = 6;
          ctx.moveTo(cx, yHi);       ctx.lineTo(cx, yLo);
          ctx.moveTo(cx - cap, yHi); ctx.lineTo(cx + cap, yHi);
          ctx.moveTo(cx - cap, yLo); ctx.lineTo(cx + cap, yLo);
        }

        ctx.stroke();
        ctx.restore();
      });
    });
  }
};
Chart.register(errorBarPlugin);

// ── Variant overview cards ────────────────────────────────────────────────
function buildVariantCards() {
  const el = document.getElementById('variant-cards');
  el.innerHTML = VARIANTS.map(v => {
    const vc = VC[v];
    const pages = LH_DATA[v] ? Object.values(LH_DATA[v]) : [];
    const scores = pages.map(p => p.performance_mean).filter(x => x != null);
    const avg = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : null;
    const barW = avg != null ? Math.min(100, avg) : 0;
    const barC = avg != null ? scoreColor(avg) : '#94a3b8';

    // n runs from LH data (stored at statistics level)
    const firstPageStats = pages[0];
    const lhN = firstPageStats?.n ?? null;

    // PW journey time + n runs
    const journey = PW_DATA['full-finance-user-journey']?.[v]?.['full_user_journey_ms'];
    const journeyStr = journey ? fmtMs(journey.mean) : '—';
    const pwN = journey?.n ?? null;

    const nBadge = lhN != null
      ? \`<span style="display:inline-block;margin-top:4px;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;background:\${vc.bg};color:\${vc.solid}">n = \${lhN} runs</span>\`
      : '';

    return \`
    <div class="variant-card \${vc.cls}">
      <div class="vc-top">
        <div>
          <div class="vc-label \${vc.cls}">\${vc.label} — \${VARIANT_LABELS[v].split('— ')[1]}</div>
          <div class="vc-score \${vc.cls}">\${avg != null ? avg.toFixed(1) : '—'}</div>
          <div class="vc-score-label">avg Lighthouse score</div>
          \${nBadge}
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:#64748b;margin-bottom:2px">Full Journey</div>
          <div style="font-size:17px;font-weight:700;color:\${vc.solid}">\${journeyStr}</div>
          \${pwN != null ? \`<div style="font-size:10px;color:#94a3b8;margin-top:2px">n = \${pwN} runs</div>\` : ''}
        </div>
      </div>
      <div class="vc-desc">\${VARIANT_DESC[v]}</div>
      <div class="score-bar-track">
        <div class="score-bar-fill" style="width:\${barW}%;background:\${barC}"></div>
      </div>
    </div>\`;
  }).join('');
}

// ── Key insights ──────────────────────────────────────────────────────────
function buildInsights() {
  const el = document.getElementById('insights');
  const items = [];

  // LH score gain V1→V2
  const lhV1 = VARIANTS.filter(v=>LH_DATA[v]).map(v => {
    const sc = Object.values(LH_DATA[v]).map(p=>p.performance_mean).filter(Boolean);
    return sc.length ? sc.reduce((a,b)=>a+b,0)/sc.length : null;
  });
  if (lhV1[0] && lhV1[1]) {
    const gain = ((lhV1[1]-lhV1[0])/lhV1[0]*100).toFixed(1);
    items.push({ icon:'📈', bg:'#dbeafe', val: (gain>0?'+':'')+gain+'%', lbl:'LH score V1→V2', color:'#2563eb' });
  }
  if (lhV1[1] && lhV1[2]) {
    const gain = ((lhV1[2]-lhV1[1])/lhV1[1]*100).toFixed(1);
    items.push({ icon:'🔒', bg:'#dcfce7', val: (gain>0?'+':'')+gain+'%', lbl:'LH score V2→V3', color:'#16a34a' });
  }

  // Best PW improvement
  const txSuite = 'transactions-operations';
  const txBase = PW_DATA[txSuite]?.['base']?.['transactions_initial_load_ms'];
  const txV2   = PW_DATA[txSuite]?.['base-performance']?.['transactions_initial_load_ms'];
  if (txBase && txV2) {
    const p = ((txBase.mean-txV2.mean)/txBase.mean*100).toFixed(1);
    items.push({ icon:'⚡', bg:'#fef3c7', val: p+'%', lbl:'Tx load speedup (V1→V2)', color:'#d97706' });
  }

  // Journey time
  const jSuite = 'full-finance-user-journey';
  const jV1 = PW_DATA[jSuite]?.['base']?.['full_user_journey_ms'];
  const jV3 = PW_DATA[jSuite]?.['base-performance-security']?.['full_user_journey_ms'];
  if (jV1 && jV3) {
    const p = ((jV1.mean-jV3.mean)/jV1.mean*100).toFixed(1);
    items.push({ icon:'🏁', bg:'#f3e8ff', val: p+'%', lbl:'Journey faster V1→V3', color:'#7c3aed' });
  }

  // Pages audited
  const pages = new Set();
  VARIANTS.forEach(v => { if(LH_DATA[v]) Object.keys(LH_DATA[v]).forEach(p=>pages.add(p)); });
  items.push({ icon:'🔍', bg:'#f1f5f9', val: pages.size+'', lbl:'Pages audited (LH)', color:'#475569' });

  // Suites
  items.push({ icon:'🧪', bg:'#f1f5f9', val: Object.keys(PW_DATA).length+'', lbl:'Playwright suites', color:'#475569' });

  el.innerHTML = items.map(it => \`
    <div class="insight">
      <div class="insight-icon" style="background:\${it.bg}">\${it.icon}</div>
      <div class="insight-body">
        <div class="insight-val" style="color:\${it.color}">\${it.val}</div>
        <div class="insight-lbl">\${it.lbl}</div>
      </div>
    </div>\`).join('');
}

// ── Lighthouse ────────────────────────────────────────────────────────────
let lhChart  = null;
let lhMetric = 'performance';
let lhStat   = 'mean';

function updateLhHint() {
  document.getElementById('lh-metric-hint').textContent =
    (METRIC_DESC[lhMetric] || '') + (lhStat !== 'mean' ? \`  ·  Showing \${lhStat.toUpperCase()} values.\` : '');
}

function buildLhChart() {
  const pages = [...new Set(VARIANTS.flatMap(v => LH_DATA[v] ? Object.keys(LH_DATA[v]) : []))];
  const labels = pages.map(p => p.charAt(0).toUpperCase() + p.slice(1));
  const key = statKey(lhMetric, lhStat);

  const datasets = VARIANTS.filter(v => LH_DATA[v]).map(v => ({
    label:           VARIANT_LABELS[v],
    data:            pages.map(p => LH_DATA[v]?.[p]?.[key] ?? null),
    errorBars:       pages.map(p => LH_DATA[v]?.[p]?.[\`\${lhMetric}_std\`] ?? null),
    backgroundColor: VC[v].bar,
    borderColor:     VC[v].border,
    borderWidth:     1.5,
    borderRadius:    5,
    borderSkipped:   false,
  }));

  // Derive n for subtitle
  const lhNSample = (() => {
    for (const v of VARIANTS) {
      const pages2 = LH_DATA[v] ? Object.values(LH_DATA[v]) : [];
      if (pages2[0]?.n != null) return pages2[0].n;
    }
    return null;
  })();
  document.querySelector('#lh-chart-panel .panel-title').textContent =
    \`All pages — grouped by variant\${lhNSample != null ? \`  ·  n = \${lhNSample} runs per page  ·  whiskers = ±1σ\` : '  ·  whiskers = ±1σ'}\`;

  if (lhChart) lhChart.destroy();
  lhChart = new Chart(document.getElementById('lh-chart'), {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#475569', font: { size: 12, weight: '500' }, boxWidth: 12, boxHeight: 12 } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v   = VARIANTS[ctx.datasetIndex];
              const page= pages[ctx.dataIndex];
              const d   = LH_DATA[v]?.[page];
              if (!d) return null;
              const val = fmt(ctx.raw, lhMetric);
              const rng = \` (min \${fmt(d[\`\${lhMetric}_min\`], lhMetric)} – max \${fmt(d[\`\${lhMetric}_max\`], lhMetric)} · σ \${fmt(d[\`\${lhMetric}_std\`], lhMetric)})\`;
              return \` \${VARIANT_LABELS[v]}: \${val}\${rng}\`;
            }
          }
        }
      },
      scales: {
        x: { grid: { color: CHART_OPTS.grid }, ticks: { color: CHART_OPTS.ticks, font: { size: 11 } } },
        y: {
          grid:  { color: CHART_OPTS.grid },
          ticks: { color: CHART_OPTS.ticks, callback: v => fmt(v, lhMetric) },
          title: { display: true, text: METRIC_LABELS[lhMetric] || lhMetric, color: '#94a3b8', font: { size: 11 } },
          beginAtZero: true,
        }
      }
    }
  });
}

function buildLhTable() {
  const pages = [...new Set(VARIANTS.flatMap(v => LH_DATA[v] ? Object.keys(LH_DATA[v]) : []))];

  let html = \`<thead><tr>
    <th>Page</th>
    <th class="right" style="color:#dc2626">V1 \${lhStat}</th>
    <th class="right" style="color:#2563eb">V2 \${lhStat}</th>
    <th class="right">V1→V2</th>
    <th class="right" style="color:#16a34a">V3 \${lhStat}</th>
    <th class="right">V2→V3</th>
    <th class="right">V1→V3</th>
  </tr></thead><tbody>\`;

  for (const page of pages) {
    const k = statKey(lhMetric, lhStat);
    const v1v = LH_DATA['base']?.[page]?.[k];
    const v2v = LH_DATA['base-performance']?.[page]?.[k];
    const v3v = LH_DATA['base-performance-security']?.[page]?.[k];

    // sub-stats for tooltip-like display
    const v1d = LH_DATA['base']?.[page];
    const subV1 = v1d ? \`min \${fmt(v1d[\`\${lhMetric}_min\`],lhMetric)} · max \${fmt(v1d[\`\${lhMetric}_max\`],lhMetric)} · σ \${fmt(v1d[\`\${lhMetric}_std\`],lhMetric)}\` : '';

    const scoreBar = (val) => {
      if (lhMetric !== 'performance' || val == null) return '';
      const w = Math.min(100, val);
      const c = scoreColor(val);
      return \`<div class="sbar-wrap"><span>\${fmt(val,lhMetric)}</span><div class="sbar"><div class="sbar-fill" style="width:\${w}%;background:\${c}"></div></div></div>\`;
    };

    html += \`<tr>
      <td>
        <div class="row-label">\${page.charAt(0).toUpperCase()+page.slice(1)}</div>
        \${v1d && lhMetric !== 'performance' ? \`<div class="cell-muted" style="margin-top:2px">\${subV1}</div>\` : ''}
      </td>
      <td class="td-right cell-v1">\${lhMetric === 'performance' ? scoreBar(v1v) : fmt(v1v,lhMetric)}</td>
      <td class="td-right cell-v2">\${lhMetric === 'performance' ? scoreBar(v2v) : fmt(v2v,lhMetric)}</td>
      <td class="td-right">\${deltaHtml(v1v,v2v,lhMetric)}</td>
      <td class="td-right cell-v3">\${lhMetric === 'performance' ? scoreBar(v3v) : fmt(v3v,lhMetric)}</td>
      <td class="td-right">\${deltaHtml(v2v,v3v,lhMetric)}</td>
      <td class="td-right">\${deltaHtml(v1v,v3v,lhMetric)}</td>
    </tr>\`;
  }

  // Averages footer
  const avg = (v, k) => {
    if (!LH_DATA[v]) return null;
    const vals = Object.values(LH_DATA[v]).map(p=>p[k]).filter(x=>x!=null);
    return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
  };
  const k = statKey(lhMetric, lhStat);
  const a1 = avg('base', k);
  const a2 = avg('base-performance', k);
  const a3 = avg('base-performance-security', k);
  html += \`<tr style="background:#f8fafc;font-weight:600">
    <td style="color:#475569;font-style:italic">All pages avg</td>
    <td class="td-right cell-v1">\${fmt(a1,lhMetric)}</td>
    <td class="td-right cell-v2">\${fmt(a2,lhMetric)}</td>
    <td class="td-right">\${deltaHtml(a1,a2,lhMetric)}</td>
    <td class="td-right cell-v3">\${fmt(a3,lhMetric)}</td>
    <td class="td-right">\${deltaHtml(a2,a3,lhMetric)}</td>
    <td class="td-right">\${deltaHtml(a1,a3,lhMetric)}</td>
  </tr>\`;

  html += '</tbody>';
  document.getElementById('lh-table').innerHTML = html;
}

// ── Playwright ────────────────────────────────────────────────────────────
let pwChart = null;
let pwSuite = Object.keys(PW_DATA)[0] || '';
let pwStat  = 'mean';

function buildPwSuitePills() {
  const el = document.getElementById('pw-suite-pills');
  el.innerHTML = Object.keys(PW_DATA).map(s =>
    \`<button class="pill\${s===pwSuite?' active':''}" data-suite="\${s}">\${SUITE_LABELS[s]||s}</button>\`
  ).join('');
  el.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      pwSuite = btn.dataset.suite;
      el.querySelectorAll('.pill').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      buildPwChart(); buildPwTable();
    });
  });
}

function buildPwChart() {
  if (!pwSuite || !PW_DATA[pwSuite]) return;
  const suiteData = PW_DATA[pwSuite];
  const metrics   = [...new Set(VARIANTS.flatMap(v => suiteData[v] ? Object.keys(suiteData[v]) : []))];
  const labels    = metrics.map(m => m.replace(/_ms$/, '').replace(/_/g, ' '));

  const datasets = VARIANTS.filter(v => suiteData[v]).map(v => ({
    label:           VARIANT_LABELS[v],
    data:            metrics.map(m => suiteData[v]?.[m]?.[pwStat] ?? null),
    errorBars:       metrics.map(m => suiteData[v]?.[m]?.std ?? null),
    backgroundColor: VC[v].bar,
    borderColor:     VC[v].border,
    borderWidth:     1.5,
    borderRadius:    4,
    borderSkipped:   false,
  }));

  const isHoriz = metrics.length > 4;
  const pwNSample = (() => {
    for (const v of VARIANTS) {
      const firstMetric = metrics[0];
      const n = suiteData[v]?.[firstMetric]?.n;
      if (n != null) return n;
    }
    return null;
  })();
  document.getElementById('pw-panel-title').textContent =
    \`\${SUITE_LABELS[pwSuite]||pwSuite} — \${pwStat.toUpperCase()} durations\${pwNSample != null ? \`  ·  n = \${pwNSample} runs  ·  whiskers = ±1σ\` : '  ·  whiskers = ±1σ'}\`;

  if (pwChart) pwChart.destroy();
  pwChart = new Chart(document.getElementById('pw-chart'), {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      indexAxis: isHoriz ? 'y' : 'x',
      plugins: {
        legend: { labels: { color: '#475569', font: { size: 12, weight: '500' }, boxWidth: 12, boxHeight: 12 } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = VARIANTS[ctx.datasetIndex];
              const m = metrics[ctx.dataIndex];
              const s = PW_DATA[pwSuite]?.[v]?.[m];
              if (!s) return null;
              return [
                \` \${VARIANT_LABELS[v]}: \${fmtMs(s[pwStat])}\`,
                \`   min \${fmtMs(s.min)}  max \${fmtMs(s.max)}  p95 \${fmtMs(s.p95)}  σ \${fmtMs(s.std)}\`,
              ];
            }
          }
        }
      },
      scales: {
        x: { grid: { color: CHART_OPTS.grid }, ticks: { color: CHART_OPTS.ticks, font: { size: 11 } } },
        y: { grid: { color: CHART_OPTS.grid }, ticks: { color: CHART_OPTS.ticks, font: { size: 11 } } }
      }
    }
  });
}

function buildPwTable() {
  if (!pwSuite || !PW_DATA[pwSuite]) return;
  const suiteData = PW_DATA[pwSuite];
  const metrics = [...new Set(VARIANTS.flatMap(v => suiteData[v] ? Object.keys(suiteData[v]) : []))];

  let html = \`<thead><tr>
    <th>Operation</th>
    <th class="right" colspan="2" style="color:#dc2626">V1 Base</th>
    <th class="right" colspan="2" style="color:#2563eb">V2 Performance</th>
    <th class="right">V1→V2</th>
    <th class="right" colspan="2" style="color:#16a34a">V3 Security</th>
    <th class="right">V2→V3</th>
    <th class="right">V1→V3</th>
  </tr><tr style="background:#f8fafc">
    <th></th>
    <th class="right" style="color:#dc2626">mean</th>
    <th class="right" style="color:#94a3b8;font-size:10px">p95</th>
    <th class="right" style="color:#2563eb">mean</th>
    <th class="right" style="color:#94a3b8;font-size:10px">p95</th>
    <th></th>
    <th class="right" style="color:#16a34a">mean</th>
    <th class="right" style="color:#94a3b8;font-size:10px">p95</th>
    <th></th>
    <th></th>
  </tr></thead><tbody>\`;

  for (const m of metrics) {
    const s1 = suiteData['base']?.[m];
    const s2 = suiteData['base-performance']?.[m];
    const s3 = suiteData['base-performance-security']?.[m];

    const subStats = (s) => s
      ? \`min \${fmtMs(s.min)} · max \${fmtMs(s.max)} · σ \${fmtMs(s.std)}\${s.n != null ? \` · n=\${s.n}\` : ''}\`
      : '';

    html += \`<tr>
      <td>
        <div class="row-label">\${m.replace(/_ms$/, '').replace(/_/g, ' ')}</div>
        \${s1 ? \`<div class="cell-muted" style="margin-top:2px">\${subStats(s1)}</div>\` : ''}
      </td>
      <td class="td-right cell-v1">\${fmtMs(s1?.mean)}</td>
      <td class="td-right cell-muted">\${fmtMs(s1?.p95)}</td>
      <td class="td-right cell-v2">\${fmtMs(s2?.mean)}</td>
      <td class="td-right cell-muted">\${fmtMs(s2?.p95)}</td>
      <td class="td-right">\${deltaHtml(s1?.mean, s2?.mean, 'ms')}</td>
      <td class="td-right cell-v3">\${fmtMs(s3?.mean)}</td>
      <td class="td-right cell-muted">\${fmtMs(s3?.p95)}</td>
      <td class="td-right">\${deltaHtml(s2?.mean, s3?.mean, 'ms')}</td>
      <td class="td-right">\${deltaHtml(s1?.mean, s3?.mean, 'ms')}</td>
    </tr>\`;
  }
  html += '</tbody>';
  document.getElementById('pw-table').innerHTML = html;
}

// ── Wire metric pills ─────────────────────────────────────────────────────
document.getElementById('lh-metric-pills').querySelectorAll('.pill').forEach(btn => {
  btn.addEventListener('click', () => {
    lhMetric = btn.dataset.metric;
    document.querySelectorAll('#lh-metric-pills .pill').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    updateLhHint(); buildLhChart(); buildLhTable();
  });
});
document.getElementById('lh-stat-pills').querySelectorAll('.pill').forEach(btn => {
  btn.addEventListener('click', () => {
    lhStat = btn.dataset.stat;
    document.querySelectorAll('#lh-stat-pills .pill').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    buildLhChart(); buildLhTable();
  });
});
document.getElementById('pw-stat-pills').querySelectorAll('.pill').forEach(btn => {
  btn.addEventListener('click', () => {
    pwStat = btn.dataset.stat;
    document.querySelectorAll('#pw-stat-pills .pill').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    buildPwChart(); buildPwTable();
  });
});

// ── View toggles ──────────────────────────────────────────────────────────
document.getElementById('lh-view-chart').addEventListener('click', () => {
  document.getElementById('lh-view-chart').classList.add('active');
  document.getElementById('lh-view-table').classList.remove('active');
  document.getElementById('lh-chart-panel').classList.remove('hidden');
  document.getElementById('lh-table-panel').classList.add('hidden');
});
document.getElementById('lh-view-table').addEventListener('click', () => {
  document.getElementById('lh-view-table').classList.add('active');
  document.getElementById('lh-view-chart').classList.remove('active');
  document.getElementById('lh-chart-panel').classList.add('hidden');
  document.getElementById('lh-table-panel').classList.remove('hidden');
  buildLhTable();
});
document.getElementById('pw-view-chart').addEventListener('click', () => {
  document.getElementById('pw-view-chart').classList.add('active');
  document.getElementById('pw-view-table').classList.remove('active');
  document.getElementById('pw-chart-panel').classList.remove('hidden');
  document.getElementById('pw-table-panel').classList.add('hidden');
});
document.getElementById('pw-view-table').addEventListener('click', () => {
  document.getElementById('pw-view-table').classList.add('active');
  document.getElementById('pw-view-chart').classList.remove('active');
  document.getElementById('pw-chart-panel').classList.add('hidden');
  document.getElementById('pw-table-panel').classList.remove('hidden');
  buildPwTable();
});

// ── Init ──────────────────────────────────────────────────────────────────
buildVariantCards();
buildInsights();
updateLhHint();
buildLhChart();
buildPwSuitePills();
buildPwChart();
<\/script>
</body>
</html>`;

fs.writeFileSync(OUTPUT, html);
console.log(`\n✅  Report generated: ${OUTPUT}`);
console.log(`   Open it in a browser: open performance-reports/index.html\n`);
