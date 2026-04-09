import { query } from '../config/db.js';

const SELECT_COLS = `id, pay_period_start, pay_period_end, employee_name,
                     gross_pay, ni_contribution, pension, net_pay, notes,
                     created_at, updated_at`;

export async function list({ from, to } = {}) {
  const conditions = [];
  const params = [];
  if (from) {
    params.push(from);
    conditions.push(`pay_period_end >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`pay_period_end <= $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ${SELECT_COLS}
       FROM payroll
       ${where}
       ORDER BY pay_period_end DESC, employee_name ASC`,
    params
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await query(
    `SELECT ${SELECT_COLS} FROM payroll WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function create(data, createdBy) {
  const { rows } = await query(
    `INSERT INTO payroll
       (pay_period_start, pay_period_end, employee_name,
        gross_pay, ni_contribution, pension, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${SELECT_COLS}`,
    [
      data.pay_period_start,
      data.pay_period_end,
      data.employee_name,
      data.gross_pay,
      data.ni_contribution ?? 0,
      data.pension ?? 0,
      data.notes || null,
      createdBy,
    ]
  );
  return rows[0];
}

export async function update(id, data) {
  const { rows } = await query(
    `UPDATE payroll
        SET pay_period_start = $1,
            pay_period_end   = $2,
            employee_name    = $3,
            gross_pay        = $4,
            ni_contribution  = $5,
            pension          = $6,
            notes            = $7,
            updated_at       = NOW()
      WHERE id = $8
      RETURNING ${SELECT_COLS}`,
    [
      data.pay_period_start,
      data.pay_period_end,
      data.employee_name,
      data.gross_pay,
      data.ni_contribution ?? 0,
      data.pension ?? 0,
      data.notes || null,
      id,
    ]
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await query('DELETE FROM payroll WHERE id = $1', [id]);
  return rowCount > 0;
}

// Totals by period_end falling into current week/month/quarter/year.
export async function summary() {
  const { rows } = await query(`
    SELECT
      COALESCE(SUM(net_pay) FILTER (
        WHERE date_trunc('week', pay_period_end) = date_trunc('week', CURRENT_DATE)
      ), 0) AS week_net,
      COALESCE(SUM(net_pay) FILTER (
        WHERE date_trunc('month', pay_period_end) = date_trunc('month', CURRENT_DATE)
      ), 0) AS month_net,
      COALESCE(SUM(net_pay) FILTER (
        WHERE date_trunc('quarter', pay_period_end) = date_trunc('quarter', CURRENT_DATE)
      ), 0) AS quarter_net,
      COALESCE(SUM(net_pay) FILTER (
        WHERE date_trunc('year', pay_period_end) = date_trunc('year', CURRENT_DATE)
      ), 0) AS year_net,
      COALESCE(SUM(gross_pay) FILTER (
        WHERE date_trunc('month', pay_period_end) = date_trunc('month', CURRENT_DATE)
      ), 0) AS month_gross
    FROM payroll
  `);
  return {
    weekNet: Number(rows[0].week_net),
    monthNet: Number(rows[0].month_net),
    quarterNet: Number(rows[0].quarter_net),
    yearNet: Number(rows[0].year_net),
    monthGross: Number(rows[0].month_gross),
  };
}
