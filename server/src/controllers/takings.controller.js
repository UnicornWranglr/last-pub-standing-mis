import { z } from 'zod';
import * as takingsModel from '../models/takings.model.js';
import { httpError } from '../middleware/errorHandler.js';
import { logAction } from '../lib/audit.js';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');
const money = z.number().nonnegative().max(1_000_000);

export const takingsSchema = z.object({
  takings_date: dateString,
  cash_takings: money,
  card_takings: money,
  notes: z.string().max(2000).optional().nullable(),
});

export async function list(req, res, next) {
  try {
    const { from, to } = req.query;
    const rows = await takingsModel.list({ from, to });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getSummary(_req, res, next) {
  try {
    res.json(await takingsModel.summary());
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const row = await takingsModel.findById(req.params.id);
    if (!row) return next(httpError(404, 'Takings entry not found'));
    res.json(row);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const row = await takingsModel.create({ ...req.body, created_by: req.user.id });
    await logAction(req, 'create', 'takings', row.id, {
      date: row.takings_date,
      total: row.total,
    });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const row = await takingsModel.update(req.params.id, req.body);
    if (!row) return next(httpError(404, 'Takings entry not found'));
    await logAction(req, 'update', 'takings', row.id, {
      date: row.takings_date,
      total: row.total,
    });
    res.json(row);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const ok = await takingsModel.remove(req.params.id);
    if (!ok) return next(httpError(404, 'Takings entry not found'));
    await logAction(req, 'delete', 'takings', Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
