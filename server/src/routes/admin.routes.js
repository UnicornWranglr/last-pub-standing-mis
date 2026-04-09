import { Router } from 'express';
import * as ctrl from '../controllers/admin.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

// Everything on /api/admin/* is owner-only.
router.use(requireAuth);
router.use(requireRole('owner'));

// ─── User management ───────────────────────────────
router.get('/users', ctrl.listUsers);
router.post('/users', validate(ctrl.createUserSchema), ctrl.createUser);
router.put('/users/:id', validate(ctrl.updateUserSchema), ctrl.updateUser);
router.post(
  '/users/:id/reset-password',
  validate(ctrl.resetPasswordSchema),
  ctrl.resetUserPassword
);
router.delete('/users/:id', ctrl.deleteUser);

// ─── Audit log ─────────────────────────────────────
router.get('/audit-log', ctrl.listAuditLog);

// ─── Business totals ───────────────────────────────
router.get('/business-totals', ctrl.businessTotals);

// ─── CSV exports ───────────────────────────────────
router.get('/export/takings.csv', ctrl.exportTakings);
router.get('/export/events.csv', ctrl.exportEvents);
router.get('/export/expenses.csv', ctrl.exportExpenses);
router.get('/export/payroll.csv', ctrl.exportPayroll);
