import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware.js';
import { createExternalPayment } from '../controllers/payments.controller.js';

const router = express.Router();

// S4: validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

// S4: validation chain for external payment
const paymentValidation = [
  body('externalAccountNumber').notEmpty().withMessage('Recipient account number is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
];

router.post('/', authenticate, paymentValidation, validate, createExternalPayment);

export default router;
