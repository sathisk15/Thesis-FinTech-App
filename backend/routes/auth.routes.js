import express from 'express';

const router = express.Router();

import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

router.post('/register', register);
router.post('/login', login);

router.get('/me', authenticate, getCurrentUser);
router.put('/user/profile', authenticate, updateProfile);
router.put('/user/change-password', authenticate, changePassword);

export default router;
