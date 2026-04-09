import { Router } from 'express';
import * as ctrl from '../controllers/expenses.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

router.use(requireAuth);
router.use(requireRole('manager', 'owner'));

router.get('/', ctrl.list);
router.get('/summary', ctrl.getSummary);
router.get('/:id', ctrl.getOne);
router.post('/', validate(ctrl.expenseSchema), ctrl.create);
router.put('/:id', validate(ctrl.expenseSchema), ctrl.update);
router.delete('/:id', requireRole('owner'), ctrl.remove);
