import '../../config/loadEnv.js';
import path from 'path';

export const playwrightBaseUrl =
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.LIGHTHOUSE_BASE_URL ||
  'http://localhost:5173';

export const playwrightUser = {
  email:
    process.env.PLAYWRIGHT_EMAIL ||
    process.env.SEED_USER_EMAIL ||
    'sathis@gmail.com',
  password:
    process.env.PLAYWRIGHT_PASSWORD ||
    process.env.SEED_USER_PASSWORD ||
    '123',
};

export const thesisVariant = process.env.THESIS_VARIANT || 'base';
export const resultsLabel =
  process.env.PLAYWRIGHT_RESULTS_LABEL || thesisVariant;

export const playwrightReportDir = path.resolve(
  process.cwd(),
  'reports',
  'playwright',
);
