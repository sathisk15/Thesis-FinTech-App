import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// S3: rate limiter — max 20 requests per 15 min on auth endpoints.
// Localhost is skipped so the Lighthouse/Playwright audit pipeline (which logs
// in once per run × page, up to 30+ times) is never blocked during thesis audits.
// External traffic (any non-loopback IP) is still fully rate-limited.
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: (req) => LOOPBACK.has(req.ip),
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// S4: validation helper — returns first error as 400
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

// S4: validation chains
const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('firstname').notEmpty().withMessage('First name is required'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').notEmpty().withMessage('New password is required'),
];

// S3: rate limited; S4: validated
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login',    authLimiter, loginValidation,    validate, login);

// S6: refresh and logout endpoints
router.post('/refresh', refresh);
router.post('/logout',  logout);

router.get('/me',                  authenticate, getCurrentUser);
router.put('/user/profile',        authenticate, updateProfile);
router.put('/user/change-password', authenticate, changePasswordValidation, validate, changePassword);

export default router;
