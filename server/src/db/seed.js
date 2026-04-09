import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';

async function seedUser({ username, password, role }) {
  if (!password) {
    console.log(`[seed] no password set for "${username}" (${role}), skipping`);
    return;
  }
  const { rows } = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
  if (rows.length > 0) {
    console.log(`[seed] user "${username}" already exists, skipping`);
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
    [username, hash, role]
  );
  console.log(`[seed] created ${role} "${username}"`);
}

async function run() {
  console.log('[seed] starting');
  try {
    await seedUser({
      username: env.seedOwnerUsername,
      password: env.seedOwnerPassword,
      role: 'owner',
    });
    await seedUser({
      username: env.seedManagerUsername,
      password: env.seedManagerPassword,
      role: 'manager',
    });
    await seedUser({
      username: env.seedStaffUsername,
      password: env.seedStaffPassword,
      role: 'staff',
    });
  } finally {
    await pool.end();
  }
  console.log('[seed] done');
}

run().catch((err) => {
  console.error('[seed] fatal', err);
  process.exit(1);
});
