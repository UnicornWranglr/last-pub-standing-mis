import { query } from '../config/db.js';

/**
 * Log an action to the audit_log table.
 *
 * Never throws — if the audit insert fails, we log to console and continue,
 * so audit failures never break the actual request.
 *
 * @param {object} req   - Express request (uses req.user if available)
 * @param {string} action        - e.g. 'login', 'create', 'update', 'delete'
 * @param {string} resourceType  - e.g. 'takings', 'events', 'expenses', 'payroll', 'user', 'auth'
 * @param {number|null} resourceId
 * @param {object|null} details  - arbitrary metadata; stored as JSONB
 */
export async function logAction(req, action, resourceType, resourceId = null, details = null) {
  try {
    await query(
      `INSERT INTO audit_log (user_id, username, action, resource_type, resource_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user?.id ?? null,
        req.user?.username ?? null,
        action,
        resourceType,
        resourceId,
        details ? JSON.stringify(details) : null,
      ]
    );
  } catch (err) {
    console.error('[audit] failed to log:', err.message);
  }
}

// Convenience for auth flows where req.user isn't populated yet.
export async function logActionAs(user, action, resourceType, resourceId = null, details = null) {
  try {
    await query(
      `INSERT INTO audit_log (user_id, username, action, resource_type, resource_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user?.id ?? null,
        user?.username ?? null,
        action,
        resourceType,
        resourceId,
        details ? JSON.stringify(details) : null,
      ]
    );
  } catch (err) {
    console.error('[audit] failed to log:', err.message);
  }
}
