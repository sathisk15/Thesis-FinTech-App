import { startAudit } from './runLighthouse.js';

startAudit({
  runs: Number(process.env.LIGHTHOUSE_RUNS || 1),
}).catch((error) => {
  console.error('Legacy Lighthouse entry failed:', error);
  process.exit(1);
});
