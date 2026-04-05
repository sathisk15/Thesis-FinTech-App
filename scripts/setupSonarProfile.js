/**
 * setupSonarProfile.js — One-time SonarQube quality profile setup
 *
 * Creates the "Thesis-Security-Profile" quality profile and activates
 * all 16 security rules that map to thesis techniques S1–S10.
 * Then assigns the profile to all three thesis variant projects.
 *
 * Idempotent — safe to re-run at any time.
 *
 * Usage:
 *   npm run sonar:setup
 */

import '../config/loadEnv.js';
import axios from 'axios';

const SONAR_URL = process.env.SONAR_URL || 'http://localhost:9000';
const TOKEN = process.env.SONAR_TOKEN;
const PROFILE_NAME = 'Thesis-Security-Profile';
const LANGUAGE = 'js';

const auth = { username: TOKEN, password: '' };

// All 3 variant project keys
const VARIANT_PROJECTS = [
  'fintech-app-base',
  'fintech-app-base-performance',
  'fintech-app-base-performance-security',
];

// 16 security rules mapped to thesis techniques S1–S10
const THESIS_RULES = [
  // XSS Prevention (S9)
  { key: 'javascript:S5131', category: 'XSS',              desc: 'DOM XSS via innerHTML / document.write' },
  { key: 'javascript:S6105', category: 'XSS',              desc: 'Unsafe use of dangerouslySetInnerHTML in React' },

  // SQL / NoSQL Injection (already safe via parameterized queries — baseline check)
  { key: 'javascript:S3649', category: 'SQL Injection',    desc: 'SQL injection risk' },
  { key: 'javascript:S5334', category: 'NoSQL Injection',  desc: 'NoSQL injection via unvalidated input' },

  // Authentication / Session (S5, S6, S7)
  { key: 'javascript:S5527', category: 'Auth',             desc: 'Insecure SSL/TLS configuration' },
  { key: 'javascript:S5659', category: 'Auth',             desc: 'JWT signature not verified / algorithm confusion' },
  { key: 'javascript:S5247', category: 'Auth',             desc: 'Disabling certificate validation' },

  // Hardcoded Secrets (S5 — JWT_SECRET)
  { key: 'javascript:S2068', category: 'Secrets',          desc: 'Hardcoded password or credential' },
  { key: 'javascript:S6418', category: 'Secrets',          desc: 'Hardcoded secret or API token' },

  // Insecure Cookies (S7)
  { key: 'javascript:S2255', category: 'Cookies',          desc: 'Cookies written without proper flags' },
  { key: 'javascript:S3330', category: 'Cookies',          desc: 'Cookie missing HttpOnly flag' },
  { key: 'javascript:S2092', category: 'Cookies',          desc: 'Cookie missing Secure flag' },

  // Input Validation (S4)
  { key: 'javascript:S5146', category: 'Input Validation', desc: 'Open redirect via unvalidated URL' },
  { key: 'javascript:S2631', category: 'Input Validation', desc: 'Regular expression injection' },

  // Cryptography
  { key: 'javascript:S4426', category: 'Cryptography',     desc: 'Cryptographic key too short / weak length' },
  { key: 'javascript:S5542', category: 'Cryptography',     desc: 'Insecure cipher mode (ECB, no padding)' },
];

// ─── API helpers ──────────────────────────────────────────────────���─────────

async function getExistingProfile() {
  const res = await axios.get(`${SONAR_URL}/api/qualityprofiles/search`, {
    params: { qualityProfile: PROFILE_NAME, language: LANGUAGE },
    auth,
  });
  return res.data.profiles?.[0] ?? null;
}

async function createProfile() {
  const res = await axios.post(`${SONAR_URL}/api/qualityprofiles/create`, null, {
    params: { name: PROFILE_NAME, language: LANGUAGE },
    auth,
  });
  return res.data.profile.key;
}

async function activateRule(profileKey, rule) {
  try {
    await axios.post(`${SONAR_URL}/api/qualityprofiles/activate_rule`, null, {
      params: { key: profileKey, rule: rule.key, severity: 'MAJOR' },
      auth,
    });
    return { ok: true };
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.errors?.[0]?.msg || err.message;
    return { ok: false, status, msg };
  }
}

async function projectExists(projectKey) {
  const res = await axios.get(`${SONAR_URL}/api/projects/search`, {
    params: { projects: projectKey },
    auth,
  });
  return res.data.components?.length > 0;
}

async function assignProfileToProject(projectKey) {
  await axios.post(`${SONAR_URL}/api/qualityprofiles/add_project`, null, {
    params: {
      qualityProfile: PROFILE_NAME,
      language: LANGUAGE,
      project: projectKey,
    },
    auth,
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  if (!TOKEN) {
    console.error('\n❌  SONAR_TOKEN is not set.');
    process.exit(1);
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`  SonarQube Quality Profile Setup`);
  console.log(`  Profile: ${PROFILE_NAME}`);
  console.log(`  Server:  ${SONAR_URL}`);
  console.log('═'.repeat(60));

  // Step 1 — Get or create profile
  let profileKey;
  const existing = await getExistingProfile();

  if (existing) {
    profileKey = existing.key;
    console.log(`\n✅  Profile already exists (key: ${profileKey})`);
    console.log('    Proceeding to rule activation...');
  } else {
    console.log(`\n📋  Creating profile: ${PROFILE_NAME}`);
    profileKey = await createProfile();
    console.log(`✅  Profile created (key: ${profileKey})`);
  }

  // Step 2 — Activate rules
  console.log(`\n🔧  Activating ${THESIS_RULES.length} rules...\n`);

  let activated = 0;
  let skipped = 0;
  const skippedRules = [];

  for (const rule of THESIS_RULES) {
    const result = await activateRule(profileKey, rule);
    if (result.ok) {
      console.log(`  ✅  ${rule.key.padEnd(28)} [${rule.category}]`);
      activated++;
    } else {
      console.log(`  ⚠️   ${rule.key.padEnd(28)} [${rule.category}] — skipped (${result.msg})`);
      skipped++;
      skippedRules.push(rule.key);
    }
  }

  // Step 3 — Assign to variant projects
  console.log(`\n🔗  Assigning profile to variant projects...\n`);

  let assigned = 0;
  for (const projectKey of VARIANT_PROJECTS) {
    const exists = await projectExists(projectKey);
    if (!exists) {
      console.log(`  ⏭️   ${projectKey} — project not found, skipping`);
      continue;
    }
    try {
      await assignProfileToProject(projectKey);
      console.log(`  ✅  ${projectKey}`);
      assigned++;
    } catch (err) {
      console.log(`  ⚠️   ${projectKey} — ${err.response?.data?.errors?.[0]?.msg || err.message}`);
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log(`  SUMMARY`);
  console.log('─'.repeat(60));
  console.log(`  Profile key:      ${profileKey}`);
  console.log(`  Rules activated:  ${activated} / ${THESIS_RULES.length}`);
  console.log(`  Rules skipped:    ${skipped}${skipped > 0 ? ' (not installed in this SonarQube)' : ''}`);
  console.log(`  Projects assigned: ${assigned} / ${VARIANT_PROJECTS.length}`);
  if (skippedRules.length > 0) {
    console.log(`\n  Skipped rules:`);
    skippedRules.forEach((r) => console.log(`    - ${r}`));
    console.log('\n  Tip: Some rules require the SonarQube Security plugin.');
    console.log('  Install it via: Administration → Marketplace → Security');
  }
  console.log('═'.repeat(60) + '\n');
}

run().catch((err) => {
  console.error('\n❌  Setup failed:', err.response?.data || err.message);
  process.exit(1);
});
