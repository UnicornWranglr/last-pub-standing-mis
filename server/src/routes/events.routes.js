import { Router } from 'express';
import * as ctrl from '../controllers/events.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

router.use(requireAuth);

router.get('/', ctrl.list);
router.get('/upcoming-count', ctrl.upcomingCount);
router.get('/:id', ctrl.getOne);
router.post('/', validate(ctrl.eventSchema), ctrl.create);
router.put('/:id', validate(ctrl.eventSchema), ctrl.update);
router.delete('/:id', requireRole('owner'), ctrl.remove);
