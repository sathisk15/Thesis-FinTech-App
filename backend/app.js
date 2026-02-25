import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import paymentsRoutes from './routes/payments.routes.js';

// import dashboardRoutes from './routes/dashboard.routes';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentsRoutes);

// app.use('/api/dashboard', dashboardRoutes);

app.get('/api/healthCheck', (req, res) => res.json({ health: 'ok' }));

export default app;
