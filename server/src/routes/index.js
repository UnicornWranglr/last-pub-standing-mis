import { Router } from 'express';
import { router as authRouter } from './auth.routes.js';
import { router as takingsRouter } from './takings.routes.js';
import { router as eventsRouter } from './events.routes.js';

export const router = Router();

router.use('/auth', authRouter);
router.use('/takings', takingsRouter);
router.use('/events', eventsRouter);
