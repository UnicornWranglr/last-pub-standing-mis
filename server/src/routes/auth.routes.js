import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

export const router = Router();

router.post('/login', validate(authController.loginSchema), authController.login);
router.get('/me', requireAuth, authController.me);
