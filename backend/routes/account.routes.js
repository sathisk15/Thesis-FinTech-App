import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getAccounts,
  createAccount,
  deposit,
  getTransactionsByAccount,
  transfer,
} from '../controllers/account.controller.js';

const router = express.Router();

// All routes require authentication
router.get('/', authenticate, getAccounts);
router.post('/', authenticate, createAccount);
router.post('/:accountId/deposit', authenticate, deposit);
router.get('/:accountId/transactions', authenticate, getTransactionsByAccount);
router.post('/transfer', authenticate, transfer);

export default router;
