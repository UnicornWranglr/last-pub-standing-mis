import bcrypt from 'bcryptjs';
import { z } from 'zod';
import * as userModel from '../models/user.model.js';
import * as auditModel from '../models/audit.model.js';
import * as takingsModel from '../models/takings.model.js';
import * as eventsModel from '../models/events.model.js';
import * as expensesModel from '../models/expenses.model.js';
import * as payrollModel from '../models/payroll.model.js';
import { query } from '../config/db.js';
import { httpError } from '../middleware/errorHandler.js';
import { logAction } from '../lib/audit.js';
import { buildCsv, sendCsv } from '../lib/csv.js';

// ─── User management ────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(6).max(255),
  role: z.enum(['owner', 'manager', 'staff']),
});

export const updateUserSchema = z.object({
  role: z.enum(['owner', 'manager', 'staff']),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6).max(255),
});

export async function listUsers(_req, res, next) {
  try {
    const users = await userModel.listAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const { username, password, role } = req.body;
    const existing = await userModel.findByUsername(username);
    if (existing) return next(httpError(409, 'That username is already taken'));
    const password_hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({ username, password_hash, role });
    await logAction(req, 'create', 'user', user.id, { username: user.username, role });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user.id) {
      return next(httpError(400, "You can't change your own role"));
    }
    const user = await userModel.updateRole(targetId, req.body.role);
    if (!user) return next(httpError(404, 'User not found'));
    await logAction(req, 'update', 'user', user.id, {
      username: user.username,
      new_role: req.body.role,
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function resetUserPassword(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    const password_hash = await bcrypt.hash(req.body.password, 10);
    const ok = await userModel.updatePassword(targetId, password_hash);
    if (!ok) return next(httpError(404, 'User not found'));
    await logAction(req, 'update', 'user', targetId, { action: 'reset_password' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user.id) {
      return next(httpError(400, "You can't delete your own account"));
    }
    const ok = await userModel.remove(targetId);
    if (!ok) return next(httpError(404, 'User not found'));
    await logAction(req, 'delete', 'user', targetId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// ─── Audit log ──────────────────────────────────────────────────────────────

export async function listAuditLog(req, res, next) {
  try {
    const { limit, user_id, action } = req.query;
    const rows = await auditModel.list({
      limit,
      userId: user_id ? Number(user_id) : undefined,
      action: action || undefined,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// ─── Business totals ────────────────────────────────────────────────────────

export async function businessTotals(_req, res, next) {
  try {
    const { rows: revenueRows } = await query(`
      SELECT
        COALESCE(SUM(total), 0)                                           AS all_time,
        COALESCE(SUM(total) FILTER (
          WHERE date_trunc('year', takings_date) = date_trunc('year', CURRENT_DATE)
        ), 0)                                                              AS year_total,
        COALESCE(SUM(total) FILTER (
          WHERE date_trunc('quarter', takings_date) = date_trunc('quarter', CURRENT_DATE)
        ), 0)                                                              AS quarter_total,
        COALESCE(SUM(total) FILTER (
          WHERE date_trunc('month', takings_date) = date_trunc('month', CURRENT_DATE)
        ), 0)                                                              AS month_total,
        COALESCE(SUM(total) FILTER (
          WHERE date_trunc('week', takings_date) = date_trunc('week', CURRENT_DATE)
        ), 0)                                                              AS week_total,
        MIN(takings_date)                                                  AS oldest,
        MAX(takings_date)                                                  AS newest
      FROM takings
    `);

    const { rows: expenseRows } = await query(`
      SELECT
        COALESCE(SUM(amount), 0)                                           AS all_time,
        COALESCE(SUM(amount) FILTER (
          WHERE date_trunc('year', expense_date) = date_trunc('year', CURRENT_DATE)
        ), 0)                                                              AS year_total,
        COALESCE(SUM(amount) FILTER (
          WHERE date_trunc('month', expense_date) = date_trunc('month', CURRENT_DATE)
        ), 0)                                                              AS month_total
      FROM expenses
    `);

    const { rows: payrollRows } = await query(`
      SELECT
        COALESCE(SUM(net_pay), 0)                                          AS all_time,
        COALESCE(SUM(net_pay) FILTER (
          WHERE date_trunc('year', pay_period_end) = date_trunc('year', CURRENT_DATE)
        ), 0)                                                              AS year_total,
        COALESCE(SUM(net_pay) FILTER (
          WHERE date_trunc('month', pay_period_end) = date_trunc('month', CURRENT_DATE)
        ), 0)                                                              AS month_total
      FROM payroll
    `);

    const { rows: eventRows } = await query(`
      SELECT
        COUNT(*)                                                           AS all_time,
        COUNT(*) FILTER (
          WHERE date_trunc('year', event_date) = date_trunc('year', CURRENT_DATE)
        )                                                                  AS year_total
      FROM events
    `);

    const r = revenueRows[0];
    const e = expenseRows[0];
    const p = payrollRows[0];
    const ev = eventRows[0];

    res.json({
      revenue: {
        week: Number(r.week_total),
        month: Number(r.month_total),
        quarter: Number(r.quarter_total),
        year: Number(r.year_total),
        allTime: Number(r.all_time),
      },
      expenses: {
        month: Number(e.month_total),
        year: Number(e.year_total),
        allTime: Number(e.all_time),
      },
      payroll: {
        month: Number(p.month_total),
        year: Number(p.year_total),
        allTime: Number(p.all_time),
      },
      profit: {
        month: Number(r.month_total) - Number(e.month_total) - Number(p.month_total),
        year: Number(r.year_total) - Number(e.year_total) - Number(p.year_total),
        allTime: Number(r.all_time) - Number(e.all_time) - Number(p.all_time),
      },
      events: {
        thisYear: Number(ev.year_total),
        allTime: Number(ev.all_time),
      },
      takings: {
        oldest: r.oldest,
        newest: r.newest,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Data export ────────────────────────────────────────────────────────────

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export async function exportTakings(_req, res, next) {
  try {
    const rows = await takingsModel.list();
    const csv = buildCsv(
      ['id', 'date', 'cash', 'card', 'total', 'notes', 'created_at'],
      rows.map((r) => [
        r.id,
        r.takings_date,
        r.cash_takings,
        r.card_takings,
        r.total,
        r.notes,
        r.created_at,
      ])
    );
    sendCsv(res, `takings-${todayStamp()}.csv`, csv);
  } catch (err) {
    next(err);
  }
}

export async function exportEvents(_req, res, next) {
  try {
    const rows = await eventsModel.list();
    const csv = buildCsv(
      [
        'id',
        'name',
        'theme',
        'date',
        'time',
        'entry_type',
        'ticket_price',
        'contact_name',
        'contact_info',
        'notes',
        'created_at',
      ],
      rows.map((r) => [
        r.id,
        r.name,
        r.theme,
        r.event_date,
        r.event_time,
        r.entry_type,
        r.ticket_price,
        r.contact_name,
        r.contact_info,
        r.notes,
        r.created_at,
      ])
    );
    sendCsv(res, `events-${todayStamp()}.csv`, csv);
  } catch (err) {
    next(err);
  }
}

export async function exportExpenses(_req, res, next) {
  try {
    const rows = await expensesModel.list();
    const csv = buildCsv(
      ['id', 'date', 'category', 'amount', 'supplier', 'description', 'notes', 'created_at'],
      rows.map((r) => [
        r.id,
        r.expense_date,
        r.category,
        r.amount,
        r.supplier,
        r.description,
        r.notes,
        r.created_at,
      ])
    );
    sendCsv(res, `expenses-${todayStamp()}.csv`, csv);
  } catch (err) {
    next(err);
  }
}

export async function exportPayroll(_req, res, next) {
  try {
    const rows = await payrollModel.list();
    const csv = buildCsv(
      [
        'id',
        'employee_name',
        'period_start',
        'period_end',
        'gross_pay',
        'ni_contribution',
        'pension',
        'net_pay',
        'notes',
        'created_at',
      ],
      rows.map((r) => [
        r.id,
        r.employee_name,
        r.pay_period_start,
        r.pay_period_end,
        r.gross_pay,
        r.ni_contribution,
        r.pension,
        r.net_pay,
        r.notes,
        r.created_at,
      ])
    );
    sendCsv(res, `payroll-${todayStamp()}.csv`, csv);
  } catch (err) {
    next(err);
  }
}
