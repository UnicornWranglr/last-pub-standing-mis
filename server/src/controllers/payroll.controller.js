import { z } from 'zod';
import * as payrollModel from '../models/payroll.model.js';
import { httpError } from '../middleware/errorHandler.js';
import { logAction } from '../lib/audit.js';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');
const money = z.number().nonnegative().max(1_000_000);

export const payrollSchema = z
  .object({
    pay_period_start: dateString,
    pay_period_end: dateString,
    employee_name: z.string().min(1).max(255),
    gross_pay: money,
    ni_contribution: money.optional().default(0),
    pension: money.optional().default(0),
    notes: z.string().max(2000).optional().nullable(),
  })
  .refine((data) => data.pay_period_end >= data.pay_period_start, {
    message: 'pay_period_end must be on or after pay_period_start',
    path: ['pay_period_end'],
  });

export async function list(req, res, next) {
  try {
    const { from, to } = req.query;
    const rows = await payrollModel.list({ from, to });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getSummary(_req, res, next) {
  try {
    res.json(await payrollModel.summary());
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const row = await payrollModel.findById(req.params.id);
    if (!row) return next(httpError(404, 'Payroll entry not found'));
    res.json(row);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const row = await payrollModel.create(req.body, req.user.id);
    await logAction(req, 'create', 'payroll', row.id, {
      employee: row.employee_name,
      period_end: row.pay_period_end,
      net: row.net_pay,
    });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const row = await payrollModel.update(req.params.id, req.body);
    if (!row) return next(httpError(404, 'Payroll entry not found'));
    await logAction(req, 'update', 'payroll', row.id, {
      employee: row.employee_name,
      period_end: row.pay_period_end,
      net: row.net_pay,
    });
    res.json(row);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const ok = await payrollModel.remove(req.params.id);
    if (!ok) return next(httpError(404, 'Payroll entry not found'));
    await logAction(req, 'delete', 'payroll', Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
