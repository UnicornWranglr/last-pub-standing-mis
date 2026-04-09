import { Router } from 'express';
import * as ctrl from '../controllers/takings.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

router.use(requireAuth);

router.get('/', ctrl.list);
router.get('/summary', ctrl.getSummary);
router.get('/:id', ctrl.getOne);
router.post('/', validate(ctrl.takingsSchema), ctrl.create);
router.put('/:id', validate(ctrl.takingsSchema), ctrl.update);
router.delete('/:id', requireRole('owner'), ctrl.remove);
