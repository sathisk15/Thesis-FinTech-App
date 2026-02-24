import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getAllTransactions } from '../controllers/account.controller.js';

const router = express.Router();

router.get('/', authenticate, getAllTransactions);

export default router;
