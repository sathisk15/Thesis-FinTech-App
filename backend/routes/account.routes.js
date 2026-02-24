import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getAccounts,
  createAccount,
  deposit,
} from '../controllers/account.controller.js';

const router = express.Router();

// All routes require authentication
router.get('/', authenticate, getAccounts);
router.post('/', authenticate, createAccount);
router.post('/:accountId/deposit', authenticate, deposit);

export default router;
