import '../config/loadEnv.js';
import axios from 'axios';
import { execSync } from 'child_process';
import sonarScanner from 'sonarqube-scanner';

const scanner = sonarScanner.default;
const SONAR_URL = process.env.SONAR_URL || 'http://localhost:9000';
const TOKEN = process.env.SONAR_TOKEN;
const PROJECT_KEY = process.env.SONAR_PROJECT_KEY || 'fintech-app';
const PROJECT_NAME = process.env.SONAR_PROJECT_NAME || 'Fintech App';
const TEST_COMMAND = process.env.SONAR_TEST_COMMAND || 'npm test';

async function projectExists() {
  try {
    const res = await axios.get(
      `${SONAR_URL}/api/projects/search?projects=${PROJECT_KEY}`,
      {
        auth: {
          username: TOKEN,
          password: '',
        },
      },
    );

    return res.data.components.length > 0;
  } catch (err) {
    console.error('Error checking project:', err.message);
    process.exit(1);
  }
}

async function createProject() {
  console.log('Creating project in SonarQube...');

  await axios.post(`${SONAR_URL}/api/projects/create`, null, {
    params: {
      name: PROJECT_NAME,
      project: PROJECT_KEY,
    },
    auth: {
      username: TOKEN,
      password: '',
    },
  });

  console.log('Project created.');
}

async function run() {
  if (!TOKEN) {
    console.error('SONAR_TOKEN environment variable is missing.');
    process.exit(1);
  }

  const exists = await projectExists();

  if (!exists) {
    await createProject();
  } else {
    console.log('Project already exists.');
  }

  console.log('Running tests...');
  execSync(TEST_COMMAND, { stdio: 'inherit' });

  console.log('Running SonarQube analysis...');

  scanner(
    {
      serverUrl: SONAR_URL,
      options: {
        'sonar.login': TOKEN,
        'sonar.projectKey': PROJECT_KEY,
        'sonar.projectName': PROJECT_NAME,
        'sonar.sources': 'frontend,backend',
        'sonar.exclusions': 'node_modules/**,dist/**',
      },
    },
    () => process.exit(),
  );
}

run();
