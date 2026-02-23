const express = require('express');
const loadDb = require('./config/loadDb');

const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const transferRoutes = require('./routes/transfer.routes');
const historyRoutes = require('./routes/history.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();

// Load mock DB into memory
app.locals.db = loadDb();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/settings', settingsRoutes);

module.exports = app;
