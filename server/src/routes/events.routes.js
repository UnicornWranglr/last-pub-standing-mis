import { Router } from 'express';
import * as ctrl from '../controllers/events.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

router.use(requireAuth);

// Everyone authed can view events (staff need to know what's on).
router.get('/', ctrl.list);
router.get('/upcoming-count', ctrl.upcomingCount);
router.get('/:id', ctrl.getOne);

// Managers + owners can create/edit. Staff cannot.
router.post('/', requireRole('manager', 'owner'), validate(ctrl.eventSchema), ctrl.create);
router.put('/:id', requireRole('manager', 'owner'), validate(ctrl.eventSchema), ctrl.update);

// Only owner can delete.
router.delete('/:id', requireRole('owner'), ctrl.remove);
