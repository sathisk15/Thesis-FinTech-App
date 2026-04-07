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
  performance:  'Performance Score',
  fcp:          'First Contentful Paint (ms)',
  lcp:          'Largest Contentful Paint (ms)',
  tbt:          'Total Blocking Time (ms)',
  speedIndex:   'Speed Index (ms)',
  cls:          'Cumulative Layout Shift',
};

const generated = new Date().toISOString();

// ── 4. Emit HTML ─────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Thesis Performance Report</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"><\/script>
<style>
  :root {
    --bg:        #f8fafc;
    --surface:   #ffffff;
    --border:    #e2e8f0;
    --text:      #0f172a;
    --muted:     #64748b;
    --accent:    #2563eb;
    --v1:        #dc2626;
    --v2:        #2563eb;
    --v3:        #16a34a;
    --v1-dim:    rgba(220,38,38,0.10);
    --v2-dim:    rgba(37,99,235,0.10);
    --v3-dim:    rgba(22,163,74,0.10);
    --radius:    12px;
    --shadow:    0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: system-ui, -apple-system, sans-serif; font-size: 14px; }
  a { color: var(--accent); }

  /* ── top navbar (mirrors app header) ── */
  .topbar {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 24px;
    background: rgba(248,250,252,0.85); backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow);
    margin-bottom: 32px;
  }
  .topbar-brand { display: flex; align-items: center; gap: 12px; }
  .topbar-logo {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(37,99,235,0.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: var(--accent);
  }
  .topbar-title { font-size: 16px; font-weight: 600; letter-spacing: -.01em; color: var(--text); }
  .topbar-title span { color: var(--accent); }
  .topbar-meta { font-size: 12px; color: var(--muted); }

  /* layout */
  .container { max-width: 1400px; margin: 0 auto; padding: 0 24px 48px; }

  /* legend */
  .legend { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 28px; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
  .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  /* summary cards */
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 40px; }
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 20px;
    box-shadow: var(--shadow); transition: border-color .2s;
  }
  .card:hover { border-color: rgba(37,99,235,0.3); }
  .card-label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-bottom: 8px; font-weight: 600; }
  .card-value { font-size: 28px; font-weight: 700; }
  .card-sub   { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .card-delta { display: inline-block; margin-top: 8px; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .delta-good { background: rgba(22,163,74,.12); color: #16a34a; }
  .delta-bad  { background: rgba(220,38,38,.12); color: #dc2626; }

  /* section */
  .section { margin-bottom: 48px; }
  .section-title { font-size: 17px; font-weight: 700; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; color: var(--text); }
  .section-title span { font-size: 13px; font-weight: 400; color: var(--muted); }

  /* controls */
  .controls { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; align-items: center; }
  .control-group { display: flex; gap: 6px; flex-wrap: wrap; }
  .pill { padding: 5px 14px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); cursor: pointer; font-size: 13px; transition: all .15s; }
  .pill:hover { border-color: var(--accent); color: var(--accent); background: rgba(37,99,235,0.05); }
  .pill.active { background: var(--accent); border-color: var(--accent); color: #ffffff; font-weight: 600; }
  .ctrl-label { font-size: 12px; color: var(--muted); align-self: center; }

  /* chart wrapper */
  .chart-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 24px; box-shadow: var(--shadow); }
  .chart-container { position: relative; }

  /* table */
  .tbl-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { padding: 10px 14px; text-align: left; color: var(--muted); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; border-bottom: 1px solid var(--border); white-space: nowrap; background: var(--bg); }
  td { padding: 10px 14px; border-bottom: 1px solid var(--border); white-space: nowrap; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(37,99,235,0.03); }
  .val-v1 { color: var(--v1); font-weight: 600; }
  .val-v2 { color: var(--v2); font-weight: 600; }
  .val-v3 { color: var(--v3); font-weight: 600; }
  .delta { font-size: 12px; padding: 2px 7px; border-radius: 999px; font-weight: 600; }
  .better { background: rgba(22,163,74,.10); color: #16a34a; }
  .worse  { background: rgba(220,38,38,.10); color: #dc2626; }
  .same   { color: var(--muted); }
  .metric-name { color: var(--text); font-weight: 500; }
  .page-name { font-weight: 600; color: var(--text); }

  /* toggle show table */
  .tbl-toggle { font-size: 12px; color: var(--muted); cursor: pointer; margin-bottom: 12px; user-select: none; }
  .tbl-toggle:hover { color: var(--accent); }
  .hidden { display: none; }
</style>
</head>
<body>

  <!-- Top Navbar (mirrors app header) -->
  <div class="topbar">
    <div class="topbar-brand">
      <div class="topbar-logo">&#9684;</div>
      <div>
        <div class="topbar-title">E<span>-</span>Wallet &nbsp;<span style="color:var(--muted);font-weight:400;font-size:13px">·</span>&nbsp; Performance Report</div>
      </div>
    </div>
    <div class="topbar-meta">V1 → V2 → V3 &nbsp;·&nbsp; Generated ${generated.slice(0,10)} ${generated.slice(11,16)} UTC</div>
  </div>

<div class="container">

  <!-- Legend -->
  <div class="legend">
    <div class="legend-item"><div class="dot" style="background:var(--v1)"></div> V1 — Base (no optimisations)</div>
    <div class="legend-item"><div class="dot" style="background:var(--v2)"></div> V2 — Performance (P1–P7)</div>
    <div class="legend-item"><div class="dot" style="background:var(--v3)"></div> V3 — Security (S1–S10)</div>
  </div>

  <!-- Summary Cards -->
  <div id="summary-cards" class="cards"></div>

  <!-- ── Lighthouse ──────────────────────────────────────────────────────── -->
  <div class="section">
    <div class="section-title">
      Lighthouse Audit
      <span>Page performance scores measured in production build</span>
    </div>

    <div class="controls">
      <span class="ctrl-label">Metric:</span>
      <div class="control-group" id="lh-metric-pills">
        <button class="pill active" data-metric="performance">Perf Score</button>
        <button class="pill" data-metric="fcp">FCP</button>
        <button class="pill" data-metric="lcp">LCP</button>
        <button class="pill" data-metric="tbt">TBT</button>
        <button class="pill" data-metric="speedIndex">Speed Index</button>
        <button class="pill" data-metric="cls">CLS</button>
      </div>
      <span class="ctrl-label" style="margin-left:16px">View:</span>
      <div class="control-group">
        <button class="pill active" id="lh-view-chart">Chart</button>
        <button class="pill" id="lh-view-table">Table</button>
      </div>
    </div>

    <div class="chart-wrap" id="lh-chart-wrap">
      <div class="chart-container" style="height:320px">
        <canvas id="lh-chart"></canvas>
      </div>
    </div>

    <div id="lh-table-wrap" class="hidden">
      <div class="tbl-wrap">
        <table id="lh-table"></table>
      </div>
    </div>
  </div>

  <!-- ── Playwright ─────────────────────────────────────────────────────── -->
  <div class="section">
    <div class="section-title">
      Playwright Timing
      <span>Operation durations measured across all test runs (mean_ms)</span>
    </div>

    <div class="controls">
      <span class="ctrl-label">Suite:</span>
      <div class="control-group" id="pw-suite-pills"></div>
      <span class="ctrl-label" style="margin-left:16px">View:</span>
      <div class="control-group">
        <button class="pill active" id="pw-view-chart">Chart</button>
        <button class="pill" id="pw-view-table">Table</button>
      </div>
    </div>

    <div class="chart-wrap" id="pw-chart-wrap">
      <div class="chart-container" style="height:380px">
        <canvas id="pw-chart"></canvas>
      </div>
    </div>

    <div id="pw-table-wrap" class="hidden">
      <div class="tbl-wrap">
        <table id="pw-table"></table>
      </div>
    </div>
  </div>

</div>

<script>
const VARIANTS = ${JSON.stringify(VARIANTS)};
const VARIANT_LABELS = ${JSON.stringify(VARIANT_LABELS)};
const SUITE_LABELS   = ${JSON.stringify(SUITE_LABELS)};
const METRIC_LABELS  = ${JSON.stringify(METRIC_LABELS)};
const LH_DATA = ${JSON.stringify(lhData)};
const PW_DATA = ${JSON.stringify(pwData)};

const V_COLORS       = { 'base': '#dc2626', 'base-performance': '#2563eb', 'base-performance-security': '#16a34a' };
const V_COLORS_ALPHA = { 'base': 'rgba(220,38,38,.12)', 'base-performance': 'rgba(37,99,235,.12)', 'base-performance-security': 'rgba(22,163,74,.12)' };

// ── Helpers ────────────────────────────────────────────────────────────────
function fmt(v, metric) {
  if (v == null) return '—';
  if (metric === 'cls') return v.toFixed(4);
  if (metric === 'performance') return v.toFixed(1);
  if (v >= 1000) return (v/1000).toFixed(2) + 's';
  return v.toFixed(0) + 'ms';
}
function delta(a, b, metric) {
  // higher is better for performance score; lower is better for everything else
  if (a == null || b == null || a === 0) return null;
  const pct = ((b - a) / a) * 100;
  const better = metric === 'performance' ? pct > 0 : pct < 0;
  return { pct, better };
}
function deltaHtml(d) {
  if (!d) return '<span class="same">—</span>';
  const sign = d.pct > 0 ? '+' : '';
  const cls  = d.better ? 'better' : 'worse';
  return \`<span class="delta \${cls}">\${sign}\${d.pct.toFixed(1)}%</span>\`;
}

// ── Summary Cards ─────────────────────────────────────────────────────────
function buildSummaryCards() {
  const el = document.getElementById('summary-cards');
  const cards = [];

  // Avg Lighthouse performance score per variant
  VARIANTS.forEach(v => {
    if (!LH_DATA[v]) return;
    const scores = Object.values(LH_DATA[v]).map(s => s.performance_mean).filter(Boolean);
    if (!scores.length) return;
    const avg = scores.reduce((a,b)=>a+b,0)/scores.length;
    cards.push({ label: \`\${VARIANT_LABELS[v]}\`, value: avg.toFixed(1), sub: 'avg Lighthouse score (6 pages)', color: V_COLORS[v] });
  });

  // Best improvement: full user journey
  const jSuite = 'full-finance-user-journey';
  const jBase = PW_DATA[jSuite]?.['base']?.['full_user_journey_ms'];
  const jV3   = PW_DATA[jSuite]?.['base-performance-security']?.['full_user_journey_ms'];
  if (jBase && jV3) {
    const pct = ((jBase.mean - jV3.mean) / jBase.mean * 100).toFixed(1);
    cards.push({ label: 'Full Journey Speedup (V1→V3)', value: pct + '%', sub: \`\${(jBase.mean/1000).toFixed(1)}s → \${(jV3.mean/1000).toFixed(1)}s\`, color: '#16a34a' });
  }

  // Transactions initial load improvement
  const txSuite = 'transactions-operations';
  const txBase = PW_DATA[txSuite]?.['base']?.['transactions_initial_load_ms'];
  const txV2   = PW_DATA[txSuite]?.['base-performance']?.['transactions_initial_load_ms'];
  if (txBase && txV2) {
    const pct = ((txBase.mean - txV2.mean) / txBase.mean * 100).toFixed(1);
    cards.push({ label: 'Transactions Load (V1→V2)', value: pct + '%', sub: \`\${txBase.mean.toFixed(0)}ms → \${txV2.mean.toFixed(0)}ms\`, color: '#2563eb' });
  }

  el.innerHTML = cards.map(c => \`
    <div class="card">
      <div class="card-label">\${c.label}</div>
      <div class="card-value" style="color:\${c.color}">\${c.value}</div>
      <div class="card-sub">\${c.sub}</div>
    </div>
  \`).join('');
}

// ── Lighthouse Chart ───────────────────────────────────────────────────────
let lhChart = null;
let lhMetric = 'performance';

function getLhPages() {
  const pages = new Set();
  VARIANTS.forEach(v => { if (LH_DATA[v]) Object.keys(LH_DATA[v]).forEach(p => pages.add(p)); });
  return [...pages];
}

function getLhStatKey(metric) {
  return metric === 'performance' ? 'performance_mean'
       : metric === 'fcp'         ? 'fcp_mean'
       : metric === 'lcp'         ? 'lcp_mean'
       : metric === 'tbt'         ? 'tbt_mean'
       : metric === 'speedIndex'  ? 'speedIndex_mean'
       : metric === 'cls'         ? 'cls_mean'
       : null;
}

function buildLhChart() {
  const pages  = getLhPages();
  const key    = getLhStatKey(lhMetric);
  const labels = pages.map(p => p.charAt(0).toUpperCase() + p.slice(1));

  const datasets = VARIANTS.map(v => ({
    label:           VARIANT_LABELS[v],
    data:            pages.map(p => LH_DATA[v]?.[p]?.[key] ?? null),
    backgroundColor: V_COLORS_ALPHA[v],
    borderColor:     V_COLORS[v],
    borderWidth:     2,
    borderRadius:    6,
  })).filter(d => d.data.some(x => x != null));

  const higherBetter = lhMetric === 'performance';

  if (lhChart) lhChart.destroy();
  lhChart = new Chart(document.getElementById('lh-chart'), {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#64748b', font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => \` \${ctx.dataset.label}: \${fmt(ctx.raw, lhMetric)}\`
          }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(226,232,240,1)' }, ticks: { color: '#64748b' } },
        y: {
          grid:  { color: 'rgba(226,232,240,1)' },
          ticks: { color: '#64748b', callback: v => fmt(v, lhMetric) },
          title: { display: true, text: METRIC_LABELS[lhMetric] || lhMetric, color: '#64748b', font: { size: 11 } },
        }
      }
    }
  });
}

function buildLhTable() {
  const pages = getLhPages();
  const key   = getLhStatKey(lhMetric);

  let html = \`<thead><tr>
    <th>Page</th>
    <th class="val-v1">V1 Base</th>
    <th class="val-v2">V2 Performance</th>
    <th>V1→V2</th>
    <th class="val-v3">V3 Security</th>
    <th>V2→V3</th>
  </tr></thead><tbody>\`;

  for (const page of pages) {
    const v1 = LH_DATA['base']?.[page]?.[key];
    const v2 = LH_DATA['base-performance']?.[page]?.[key];
    const v3 = LH_DATA['base-performance-security']?.[page]?.[key];
    const d1 = delta(v1, v2, lhMetric);
    const d2 = delta(v2, v3, lhMetric);
    html += \`<tr>
      <td class="page-name">\${page}</td>
      <td class="val-v1">\${fmt(v1, lhMetric)}</td>
      <td class="val-v2">\${fmt(v2, lhMetric)}</td>
      <td>\${deltaHtml(d1)}</td>
      <td class="val-v3">\${fmt(v3, lhMetric)}</td>
      <td>\${deltaHtml(d2)}</td>
    </tr>\`;
  }
  html += '</tbody>';
  document.getElementById('lh-table').innerHTML = html;
}

// ── Playwright Chart ───────────────────────────────────────────────────────
let pwChart = null;
let pwSuite = Object.keys(PW_DATA)[0] || '';

function buildPwSuitePills() {
  const el = document.getElementById('pw-suite-pills');
  el.innerHTML = Object.keys(PW_DATA).map(s => \`
    <button class="pill\${s === pwSuite ? ' active' : ''}" data-suite="\${s}">\${SUITE_LABELS[s] || s}</button>
  \`).join('');
  el.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      pwSuite = btn.dataset.suite;
      el.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      buildPwChart(); buildPwTable();
    });
  });
}

function buildPwChart() {
  if (!pwSuite || !PW_DATA[pwSuite]) return;
  const suiteData = PW_DATA[pwSuite];
  const metrics   = new Set();
  VARIANTS.forEach(v => { if (suiteData[v]) Object.keys(suiteData[v]).forEach(m => metrics.add(m)); });
  const mArr   = [...metrics];
  const labels = mArr.map(m => m.replace(/_ms$/, '').replace(/_/g, ' '));

  const datasets = VARIANTS.map(v => ({
    label:           VARIANT_LABELS[v],
    data:            mArr.map(m => suiteData[v]?.[m]?.mean ?? null),
    backgroundColor: V_COLORS_ALPHA[v],
    borderColor:     V_COLORS[v],
    borderWidth:     2,
    borderRadius:    4,
  })).filter(d => d.data.some(x => x != null));

  if (pwChart) pwChart.destroy();
  pwChart = new Chart(document.getElementById('pw-chart'), {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      indexAxis: mArr.length > 5 ? 'y' : 'x',
      plugins: {
        legend: { labels: { color: '#64748b', font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = ctx.raw;
              if (v == null) return null;
              return \` \${ctx.dataset.label}: \${v >= 1000 ? (v/1000).toFixed(2)+'s' : v.toFixed(0)+'ms'}\`;
            }
          }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(226,232,240,1)' }, ticks: { color: '#64748b' } },
        y: { grid: { color: 'rgba(226,232,240,1)' }, ticks: { color: '#64748b', font: { size: 11 } } }
      }
    }
  });
}

function buildPwTable() {
  if (!pwSuite || !PW_DATA[pwSuite]) return;
  const suiteData = PW_DATA[pwSuite];
  const metrics   = new Set();
  VARIANTS.forEach(v => { if (suiteData[v]) Object.keys(suiteData[v]).forEach(m => metrics.add(m)); });

  let html = \`<thead><tr>
    <th>Operation</th>
    <th class="val-v1">V1 mean</th>
    <th class="val-v1">V1 p95</th>
    <th class="val-v2">V2 mean</th>
    <th>V1→V2</th>
    <th class="val-v3">V3 mean</th>
    <th>V2→V3</th>
  </tr></thead><tbody>\`;

  for (const m of metrics) {
    const v1 = suiteData['base']?.[m];
    const v2 = suiteData['base-performance']?.[m];
    const v3 = suiteData['base-performance-security']?.[m];
    const d1 = delta(v1?.mean, v2?.mean, 'ms');
    const d2 = delta(v2?.mean, v3?.mean, 'ms');
    const f  = v => v == null ? '—' : (v >= 1000 ? (v/1000).toFixed(2)+'s' : v.toFixed(0)+'ms');
    html += \`<tr>
      <td class="metric-name">\${m.replace(/_ms$/, '').replace(/_/g, ' ')}</td>
      <td class="val-v1">\${f(v1?.mean)}</td>
      <td style="color:var(--muted)">\${f(v1?.p95)}</td>
      <td class="val-v2">\${f(v2?.mean)}</td>
      <td>\${deltaHtml(d1)}</td>
      <td class="val-v3">\${f(v3?.mean)}</td>
      <td>\${deltaHtml(d2)}</td>
    </tr>\`;
  }
  html += '</tbody>';
  document.getElementById('pw-table').innerHTML = html;
}

// ── Wire up controls ───────────────────────────────────────────────────────
document.getElementById('lh-metric-pills').querySelectorAll('.pill').forEach(btn => {
  btn.addEventListener('click', () => {
    lhMetric = btn.dataset.metric;
    document.querySelectorAll('#lh-metric-pills .pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    buildLhChart(); buildLhTable();
  });
});

document.getElementById('lh-view-chart').addEventListener('click', () => {
  document.getElementById('lh-view-chart').classList.add('active');
  document.getElementById('lh-view-table').classList.remove('active');
  document.getElementById('lh-chart-wrap').classList.remove('hidden');
  document.getElementById('lh-table-wrap').classList.add('hidden');
});
document.getElementById('lh-view-table').addEventListener('click', () => {
  document.getElementById('lh-view-table').classList.add('active');
  document.getElementById('lh-view-chart').classList.remove('active');
  document.getElementById('lh-chart-wrap').classList.add('hidden');
  document.getElementById('lh-table-wrap').classList.remove('hidden');
  buildLhTable();
});

document.getElementById('pw-view-chart').addEventListener('click', () => {
  document.getElementById('pw-view-chart').classList.add('active');
  document.getElementById('pw-view-table').classList.remove('active');
  document.getElementById('pw-chart-wrap').classList.remove('hidden');
  document.getElementById('pw-table-wrap').classList.add('hidden');
});
document.getElementById('pw-view-table').addEventListener('click', () => {
  document.getElementById('pw-view-table').classList.add('active');
  document.getElementById('pw-view-chart').classList.remove('active');
  document.getElementById('pw-chart-wrap').classList.add('hidden');
  document.getElementById('pw-table-wrap').classList.remove('hidden');
  buildPwTable();
});

// ── Init ───────────────────────────────────────────────────────────────────
buildSummaryCards();
buildLhChart();
buildPwSuitePills();
buildPwChart();
<\/script>
</body>
</html>`;

fs.writeFileSync(OUTPUT, html);
console.log(`\n✅  Report generated: ${OUTPUT}`);
console.log(`   Open it in a browser: open performance-reports/index.html\n`);
