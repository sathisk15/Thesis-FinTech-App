import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import paymentsRoutes from './routes/payments.routes.js';

const app = express();

// S1: helmet sets secure HTTP response headers (X-Frame-Options, HSTS, etc.)
app.use(helmet());

// S2: Content Security Policy — restricts what resources the browser may load
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:'],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || 'http://localhost:5173'],
      fontSrc:    ["'self'"],
      objectSrc:  ["'none'"],
      frameAncestors: ["'none'"],
    },
  }),
);

// S10: CORS origin from environment variable — no hardcoded localhost
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);

// S7: cookie-parser needed to read HttpOnly JWT cookies in auth middleware
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentsRoutes);

app.get('/api/healthCheck', (req, res) => res.json({ health: 'ok' }));

export default app;
