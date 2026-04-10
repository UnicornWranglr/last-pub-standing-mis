import { query } from '../config/db.js';

const SELECT_COLS = `id, name, theme, event_date, event_time, entry_type,
                     ticket_price, contact_name, contact_info, notes,
                     created_at, updated_at`;

export async function list({ month } = {}) {
  if (month) {
    // month = "YYYY-MM" - filter to that calendar month
    const [y, m] = month.split('-').map(Number);
    if (!y || !m || m < 1 || m > 12) {
      throw Object.assign(new Error('Invalid month parameter'), { status: 400 });
    }
    const start = `${y}-${String(m).padStart(2, '0')}-01`;
    const endMonth = m === 12 ? 1 : m + 1;
    const endYear = m === 12 ? y + 1 : y;
    const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
    const { rows } = await query(
      `SELECT ${SELECT_COLS}
         FROM events
        WHERE event_date >= $1 AND event_date < $2
        ORDER BY event_date ASC, event_time ASC NULLS LAST`,
      [start, end]
    );
    return rows;
  }

  const { rows } = await query(
    `SELECT ${SELECT_COLS}
       FROM events
      ORDER BY event_date ASC, event_time ASC NULLS LAST`
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await query(
    `SELECT ${SELECT_COLS} FROM events WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function create(data, createdBy) {
  const { rows } = await query(
    `INSERT INTO events
       (name, theme, event_date, event_time, entry_type,
        ticket_price, contact_name, contact_info, notes, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING ${SELECT_COLS}`,
    [
      data.name,
      data.theme || null,
      data.event_date,
      data.event_time || null,
      data.entry_type,
      data.entry_type === 'paid' ? data.ticket_price ?? null : null,
      data.contact_name || null,
      data.contact_info || null,
      data.notes || null,
      createdBy,
    ]
  );
  return rows[0];
}

export async function update(id, data) {
  const { rows } = await query(
    `UPDATE events
        SET name         = $1,
            theme        = $2,
            event_date   = $3,
            event_time   = $4,
            entry_type   = $5,
            ticket_price = $6,
            contact_name = $7,
            contact_info = $8,
            notes        = $9,
            updated_at   = NOW()
      WHERE id = $10
      RETURNING ${SELECT_COLS}`,
    [
      data.name,
      data.theme || null,
      data.event_date,
      data.event_time || null,
      data.entry_type,
      data.entry_type === 'paid' ? data.ticket_price ?? null : null,
      data.contact_name || null,
      data.contact_info || null,
      data.notes || null,
      id,
    ]
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await query('DELETE FROM events WHERE id = $1', [id]);
  return rowCount > 0;
}

// Count all events in the current calendar month — past and future.
// The dashboard widget originally filtered to event_date >= CURRENT_DATE,
// but that surprised users who logged an event earlier in the same month
// and then saw a count of zero. "Events this month" is the more
// intuitive metric.
export async function countThisMonth() {
  const { rows } = await query(`
    SELECT COUNT(*)::int AS count
      FROM events
     WHERE date_trunc('month', event_date) = date_trunc('month', CURRENT_DATE)
  `);
  return rows[0].count;
}
