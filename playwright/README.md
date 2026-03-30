# Playwright Performance Measurement

This folder contains thesis-focused end-to-end performance measurements for:

- authenticated route readiness
- task-level timings
- full user journeys

Reports are written to `reports/playwright/`.

Recommended workflow per thesis branch:

1. Seed data: `npm run seed:db`
2. Start app: `npm run dev`
3. Run route timings: `npm run audit:playwright:routes`
4. Run full journey timings: `npm run audit:playwright:journey`
5. Summarize results: `npm run audit:playwright:summary`

Useful environment variables:

- `THESIS_VARIANT=base|bad|performance|security`
- `PLAYWRIGHT_RESULTS_LABEL=baseline-run-1`
- `PLAYWRIGHT_REPEAT_EACH=5`
- `PLAYWRIGHT_BASE_URL=http://localhost:5173`
- `PLAYWRIGHT_EMAIL=sathis@gmail.com`
- `PLAYWRIGHT_PASSWORD=123`

Suggested comparison approach:

- Run the same commands on each thesis version
- Keep the same seed and repeat count
- Archive `reports/playwright/*.json` for each variant
- Compare both Lighthouse page metrics and Playwright task timings
