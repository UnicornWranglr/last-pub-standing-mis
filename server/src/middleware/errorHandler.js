export function errorHandler(err, req, res, _next) {
  // Known HTTP errors thrown by our own code
  if (err.status && err.message) {
    return res.status(err.status).json({ error: err.message });
  }

  // Postgres unique_violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }

  // Postgres check_violation / foreign_key_violation
  if (err.code === '23514' || err.code === '23503') {
    return res.status(400).json({ error: 'Invalid data: ' + err.detail });
  }

  console.error('[unhandled error]', err);
  res.status(500).json({ error: 'Internal server error' });
}

export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
