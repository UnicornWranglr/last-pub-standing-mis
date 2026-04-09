import { Router } from 'express';
import * as ctrl from '../controllers/payroll.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

// Payroll is owner-only, top to bottom.
router.use(requireAuth);
router.use(requireRole('owner'));

router.get('/', ctrl.list);
router.get('/summary', ctrl.getSummary);
router.get('/:id', ctrl.getOne);
router.post('/', validate(ctrl.payrollSchema), ctrl.create);
router.put('/:id', validate(ctrl.payrollSchema), ctrl.update);
router.delete('/:id', ctrl.remove);
