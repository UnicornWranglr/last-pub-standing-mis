import { Router } from 'express';
import { router as authRouter } from './auth.routes.js';
import { router as takingsRouter } from './takings.routes.js';
import { router as eventsRouter } from './events.routes.js';
import { router as expensesRouter } from './expenses.routes.js';
import { router as payrollRouter } from './payroll.routes.js';
import { router as adminRouter } from './admin.routes.js';

export const router = Router();

router.use('/auth', authRouter);
router.use('/takings', takingsRouter);
router.use('/events', eventsRouter);
router.use('/expenses', expensesRouter);
router.use('/payroll', payrollRouter);
router.use('/admin', adminRouter);
