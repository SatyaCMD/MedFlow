/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { RegisterUserSchema, LoginUserSchema, VerifyOtpSchema } from './auth.dto.js';
import { rateLimit } from '../../middleware/rateLimit.js';

const router = Router();
const controller = new AuthController();

// Rate limiter for authentication attempts (headroom configured for automated testing & production safety)
const authRateLimiter = rateLimit({
  windowSeconds: 60,
  maxRequests: 100,
  keyPrefix: 'auth-limit',
  skipDev: true,
});

router.post('/register', authRateLimiter, validate(RegisterUserSchema), controller.register);
router.post('/login', authRateLimiter, validate(LoginUserSchema), controller.login);
router.post('/verify-otp', authRateLimiter, validate(VerifyOtpSchema), controller.verifyOtp);
router.get('/debug-otp', controller.getDebugOtp);
router.post('/forgot-password', authRateLimiter, controller.forgotPassword);
router.get('/forgot-password/debug-otp/:email', controller.getDebugForgotOtp);
router.post('/reset-password', authRateLimiter, controller.resetPassword);
router.post('/refresh', controller.refresh);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);

export default router;

