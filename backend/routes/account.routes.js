import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getAccounts,
  createAccount,
  deposit,
  getTransactionsByAccount,
  transfer,
} from '../controllers/account.controller.js';

const router = express.Router();

// S4: validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

// S4: validation chains
const createAccountValidation = [
  body('account_type').notEmpty().withMessage('Account type is required'),
];

const depositValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
];

const transferValidation = [
  body('fromAccountId').notEmpty().withMessage('Source account is required'),
  body('toAccountId').notEmpty().withMessage('Destination account is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
];

router.get('/', authenticate, getAccounts);
router.post('/', authenticate, createAccountValidation, validate, createAccount);
router.post('/:accountId/deposit', authenticate, depositValidation, validate, deposit);
router.get('/:accountId/transactions', authenticate, getTransactionsByAccount);
router.post('/transfer', authenticate, transferValidation, validate, transfer);

export default router;
