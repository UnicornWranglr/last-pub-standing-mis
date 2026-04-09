import pg from 'pg';
import { env } from './env.js';

const { Pool, types } = pg;

// Keep Postgres DATE columns as raw 'YYYY-MM-DD' strings instead of
// letting node-postgres convert them to JS Date objects (which then
// serialize to JSON as full ISO datetime strings and break our
// client-side YYYY-MM-DD parsing). OID 1082 = DATE.
types.setTypeParser(1082, (val) => val);

// Render's External Postgres URL contains 'render.com' and requires SSL.
// The Internal URL is a short hostname (e.g. 'dpg-xxx-a') that resolves
// only on Render's private network and uses plaintext. Local Postgres
// (docker-compose or host install) doesn't use SSL either.
const needsSSL = /render\.com/i.test(env.databaseUrl);

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
});

export function query(text, params) {
  return pool.query(text, params);
}
