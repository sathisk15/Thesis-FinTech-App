import express from 'express';

const router = express.Router();

import {
  register,
  login,
  getCurrentUser,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

router.post('/register', register);
router.post('/login', login);

router.get('/me', authenticate, getCurrentUser);

export default router;
