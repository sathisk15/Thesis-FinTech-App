import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { createExternalPayment } from '../controllers/payments.controller.js';

const router = express.Router();

router.post('/', authenticate, createExternalPayment);

export default router;
