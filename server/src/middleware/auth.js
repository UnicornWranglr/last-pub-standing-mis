import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { httpError } from './errorHandler.js';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(httpError(401, 'Missing or invalid Authorization header'));
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, username: payload.username, role: payload.role };
    next();
  } catch {
    next(httpError(401, 'Invalid or expired token'));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(httpError(401, 'Not authenticated'));
    if (!roles.includes(req.user.role)) {
      return next(httpError(403, 'Forbidden'));
    }
    next();
  };
}
