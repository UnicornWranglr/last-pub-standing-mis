import { query } from '../config/db.js';

export async function list({ from, to } = {}) {
  const conditions = [];
  const params = [];
  if (from) {
    params.push(from);
    conditions.push(`takings_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`takings_date <= $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT id, takings_date, cash_takings, card_takings, total, notes, created_at, updated_at
       FROM takings
       ${where}
       ORDER BY takings_date DESC`,
    params
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await query(
    `SELECT id, takings_date, cash_takings, card_takings, total, notes, created_at, updated_at
       FROM takings WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function create({ takings_date, cash_takings, card_takings, notes, created_by }) {
  const { rows } = await query(
    `INSERT INTO takings (takings_date, cash_takings, card_takings, notes, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, takings_date, cash_takings, card_takings, total, notes, created_at, updated_at`,
    [takings_date, cash_takings, card_takings, notes || null, created_by]
  );
  return rows[0];
}

export async function update(id, { takings_date, cash_takings, card_takings, notes }) {
  const { rows } = await query(
    `UPDATE takings
        SET takings_date = $1,
            cash_takings = $2,
            card_takings = $3,
            notes        = $4,
            updated_at   = NOW()
      WHERE id = $5
      RETURNING id, takings_date, cash_takings, card_takings, total, notes, created_at, updated_at`,
    [takings_date, cash_takings, card_takings, notes || null, id]
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await query('DELETE FROM takings WHERE id = $1', [id]);
  return rowCount > 0;
}

// Totals for current ISO week and current calendar month, based on server local date (UTC in container).
export async function summary() {
  const { rows } = await query(`
    SELECT
      COALESCE(SUM(total) FILTER (
        WHERE date_trunc('week', takings_date) = date_trunc('week', CURRENT_DATE)
      ), 0) AS week_total,
      COALESCE(SUM(total) FILTER (
        WHERE date_trunc('month', takings_date) = date_trunc('month', CURRENT_DATE)
      ), 0) AS month_total
    FROM takings
  `);
  return {
    weekTotal: Number(rows[0].week_total),
    monthTotal: Number(rows[0].month_total),
  };
}
