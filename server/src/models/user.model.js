import { query } from '../config/db.js';

export async function findByUsername(username) {
  const { rows } = await query(
    `SELECT id, username, password_hash, role, created_at, last_login_at
       FROM users
      WHERE username = $1`,
    [username]
  );
  return rows[0] || null;
}

export async function findById(id) {
  const { rows } = await query(
    `SELECT id, username, role, created_at, last_login_at
       FROM users
      WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function updateLastLogin(id) {
  await query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [id]);
}

export async function listAll() {
  const { rows } = await query(
    `SELECT id, username, role, created_at, last_login_at
       FROM users
      ORDER BY role DESC, username ASC`
  );
  return rows;
}

export async function create({ username, password_hash, role }) {
  const { rows } = await query(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, username, role, created_at, last_login_at`,
    [username, password_hash, role]
  );
  return rows[0];
}

export async function updateRole(id, role) {
  const { rows } = await query(
    `UPDATE users SET role = $1 WHERE id = $2
     RETURNING id, username, role, created_at, last_login_at`,
    [role, id]
  );
  return rows[0] || null;
}

export async function updatePassword(id, password_hash) {
  const { rowCount } = await query(
    `UPDATE users SET password_hash = $1 WHERE id = $2`,
    [password_hash, id]
  );
  return rowCount > 0;
}

export async function remove(id) {
  const { rowCount } = await query(`DELETE FROM users WHERE id = $1`, [id]);
  return rowCount > 0;
}
