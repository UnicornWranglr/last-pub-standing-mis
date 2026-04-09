import { z } from 'zod';
import * as eventsModel from '../models/events.model.js';
import { httpError } from '../middleware/errorHandler.js';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');
const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Expected HH:MM or HH:MM:SS');

export const eventSchema = z
  .object({
    name: z.string().min(1).max(255),
    theme: z.string().max(255).optional().nullable(),
    event_date: dateString,
    event_time: timeString.optional().nullable(),
    entry_type: z.enum(['paid', 'free']),
    ticket_price: z.number().nonnegative().max(1_000_000).optional().nullable(),
    contact_name: z.string().max(255).optional().nullable(),
    contact_info: z.string().max(255).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
  })
  .refine(
    (data) => data.entry_type !== 'paid' || (data.ticket_price != null && data.ticket_price >= 0),
    { message: 'ticket_price is required when entry_type is "paid"', path: ['ticket_price'] }
  );

export async function list(req, res, next) {
  try {
    const rows = await eventsModel.list({ month: req.query.month });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const row = await eventsModel.findById(req.params.id);
    if (!row) return next(httpError(404, 'Event not found'));
    res.json(row);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const row = await eventsModel.create(req.body, req.user.id);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const row = await eventsModel.update(req.params.id, req.body);
    if (!row) return next(httpError(404, 'Event not found'));
    res.json(row);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const ok = await eventsModel.remove(req.params.id);
    if (!ok) return next(httpError(404, 'Event not found'));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function upcomingCount(_req, res, next) {
  try {
    res.json({ count: await eventsModel.countUpcomingThisMonth() });
  } catch (err) {
    next(err);
  }
}
