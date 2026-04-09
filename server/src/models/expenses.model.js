import { query } from '../config/db.js';

const SELECT_COLS = `id, expense_date, category, amount, supplier, description, notes,
                     created_at, updated_at`;

export async function list({ from, to, category } = {}) {
  const conditions = [];
  const params = [];
  if (from) {
    params.push(from);
    conditions.push(`expense_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`expense_date <= $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ${SELECT_COLS}
       FROM expenses
       ${where}
       ORDER BY expense_date DESC, id DESC`,
    params
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await query(
    `SELECT ${SELECT_COLS} FROM expenses WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function create({ expense_date, category, amount, supplier, description, notes, created_by }) {
  const { rows } = await query(
    `INSERT INTO expenses (expense_date, category, amount, supplier, description, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${SELECT_COLS}`,
    [
      expense_date,
      category,
      amount,
      supplier || null,
      description || null,
      notes || null,
      created_by,
    ]
  );
  return rows[0];
}

export async function update(id, { expense_date, category, amount, supplier, description, notes }) {
  const { rows } = await query(
    `UPDATE expenses
        SET expense_date = $1,
            category     = $2,
            amount       = $3,
            supplier     = $4,
            description  = $5,
            notes        = $6,
            updated_at   = NOW()
      WHERE id = $7
      RETURNING ${SELECT_COLS}`,
    [
      expense_date,
      category,
      amount,
      supplier || null,
      description || null,
      notes || null,
      id,
    ]
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await query('DELETE FROM expenses WHERE id = $1', [id]);
  return rowCount > 0;
}

// Week / month / quarter / year totals plus a per-category breakdown for the current month.
export async function summary() {
  const { rows } = await query(`
    SELECT
      COALESCE(SUM(amount) FILTER (
        WHERE date_trunc('week', expense_date) = date_trunc('week', CURRENT_DATE)
      ), 0) AS week_total,
      COALESCE(SUM(amount) FILTER (
        WHERE date_trunc('month', expense_date) = date_trunc('month', CURRENT_DATE)
      ), 0) AS month_total,
      COALESCE(SUM(amount) FILTER (
        WHERE date_trunc('quarter', expense_date) = date_trunc('quarter', CURRENT_DATE)
      ), 0) AS quarter_total,
      COALESCE(SUM(amount) FILTER (
        WHERE date_trunc('year', expense_date) = date_trunc('year', CURRENT_DATE)
      ), 0) AS year_total
    FROM expenses
  `);

  const { rows: byCategory } = await query(`
    SELECT category, COALESCE(SUM(amount), 0)::numeric AS total
      FROM expenses
     WHERE date_trunc('month', expense_date) = date_trunc('month', CURRENT_DATE)
     GROUP BY category
     ORDER BY total DESC
  `);

  return {
    weekTotal: Number(rows[0].week_total),
    monthTotal: Number(rows[0].month_total),
    quarterTotal: Number(rows[0].quarter_total),
    yearTotal: Number(rows[0].year_total),
    byCategoryThisMonth: byCategory.map((r) => ({
      category: r.category,
      total: Number(r.total),
    })),
  };
}
