import { query } from '../config/db.js';

export async function findByUsername(username) {
  const { rows } = await query(
    'SELECT id, username, password_hash, role, created_at FROM users WHERE username = $1',
    [username]
  );
  return rows[0] || null;
}

export async function findById(id) {
  const { rows } = await query(
    'SELECT id, username, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}
