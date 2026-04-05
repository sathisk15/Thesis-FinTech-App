import '../config/loadEnv.js';
import axios from 'axios';
import { execSync } from 'child_process';
import sonarScanner from 'sonarqube-scanner';

const scanner = sonarScanner.default;

const SONAR_URL = process.env.SONAR_URL || 'http://localhost:9000';
const TOKEN = process.env.SONAR_TOKEN;
const THESIS_VARIANT = process.env.THESIS_VARIANT || 'base';
const SONAR_SKIP_TESTS = process.env.SONAR_SKIP_TESTS === 'true';

// Per-variant project keys so each variant has its own SonarQube history
const VARIANT_KEY_MAP = {
  'base': 'fintech-app-base',
  'base-performance': 'fintech-app-base-performance',
  'base-performance-security': 'fintech-app-base-performance-security',
};

const PROJECT_KEY = VARIANT_KEY_MAP[THESIS_VARIANT] ||
  `fintech-app-${THESIS_VARIANT.replace(/[^a-z0-9]/gi, '-')}`;
const PROJECT_NAME = `Fintech App [${THESIS_VARIANT}]`;

async function projectExists() {
  try {
    const res = await axios.get(
      `${SONAR_URL}/api/projects/search?projects=${PROJECT_KEY}`,
      { auth: { username: TOKEN, password: '' } },
    );
    return res.data.components.length > 0;
  } catch (err) {
    console.error('Error checking project:', err.message);
    process.exit(1);
  }
}

async function createProject() {
  console.log(`Creating SonarQube project: ${PROJECT_KEY}`);
  await axios.post(`${SONAR_URL}/api/projects/create`, null, {
    params: { name: PROJECT_NAME, project: PROJECT_KEY },
    auth: { username: TOKEN, password: '' },
  });
  console.log('Project created.');
}

async function run() {
  if (!TOKEN) {
    console.error('SONAR_TOKEN environment variable is missing.');
    process.exit(1);
  }

  console.log(`\nSonarQube scan — variant: ${THESIS_VARIANT}`);
  console.log(`Project key: ${PROJECT_KEY}\n`);

  const exists = await projectExists();
  if (!exists) {
    await createProject();
  } else {
    console.log('Project already exists in SonarQube.');
  }

  if (!SONAR_SKIP_TESTS) {
    const testCmd = process.env.SONAR_TEST_COMMAND || 'npm test';
    console.log(`Running: ${testCmd}`);
    execSync(testCmd, { stdio: 'inherit' });
  } else {
    console.log('Skipping test step (SONAR_SKIP_TESTS=true).');
  }

  console.log('Running SonarQube analysis...');

  await new Promise((resolve, reject) => {
    scanner(
      {
        serverUrl: SONAR_URL,
        options: {
          'sonar.login': TOKEN,
          'sonar.projectKey': PROJECT_KEY,
          'sonar.projectName': PROJECT_NAME,
          'sonar.sources': 'frontend,backend',
          'sonar.exclusions':
            'node_modules/**,dist/**,playwright/**,scripts/**,reports/**',
          'sonar.coverage.exclusions': '**/*',
        },
      },
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });

  console.log(`\nSonarQube scan complete for project: ${PROJECT_KEY}`);
}

run().catch((err) => {
  console.error('SonarQube analysis failed:', err.message || err);
  process.exit(1);
});
