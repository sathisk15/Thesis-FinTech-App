import express from 'express';

import authRoutes from './routes/auth.routes.js';
// import dashboardRoutes from './routes/dashboard.routes';
// import transferRoutes from './routes/transfer.routes';
// import historyRoutes from './routes/history.routes';
// import settingsRoutes from './routes/settings.routes';

const app = express();

// Load mock DB into memory
// app.locals.db = loadDb();

app.use(express.json());

app.use('/api/auth', authRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/transfer', transferRoutes);
// app.use('/api/history', historyRoutes);
// app.use('/api/settings', settingsRoutes);

app.get('/api/healthCheck', (req, res) => res.json({ health: 'ok' }));

export default app;
