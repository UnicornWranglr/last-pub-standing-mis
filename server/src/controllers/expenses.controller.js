import { z } from 'zod';
import * as expensesModel from '../models/expenses.model.js';
import { httpError } from '../middleware/errorHandler.js';
import { logAction } from '../lib/audit.js';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');
const money = z.number().nonnegative().max(1_000_000);

export const expenseSchema = z.object({
  expense_date: dateString,
  category: z.enum(['bar_stock', 'food_stock', 'utilities', 'fixed', 'maintenance', 'other']),
  amount: money,
  supplier: z.string().max(255).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export async function list(req, res, next) {
  try {
    const { from, to, category } = req.query;
    const rows = await expensesModel.list({ from, to, category });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getSummary(_req, res, next) {
  try {
    res.json(await expensesModel.summary());
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const row = await expensesModel.findById(req.params.id);
    if (!row) return next(httpError(404, 'Expense not found'));
    res.json(row);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const row = await expensesModel.create({ ...req.body, created_by: req.user.id });
    await logAction(req, 'create', 'expenses', row.id, {
      date: row.expense_date,
      category: row.category,
      amount: row.amount,
    });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const row = await expensesModel.update(req.params.id, req.body);
    if (!row) return next(httpError(404, 'Expense not found'));
    await logAction(req, 'update', 'expenses', row.id, {
      date: row.expense_date,
      category: row.category,
      amount: row.amount,
    });
    res.json(row);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const ok = await expensesModel.remove(req.params.id);
    if (!ok) return next(httpError(404, 'Expense not found'));
    await logAction(req, 'delete', 'expenses', Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
