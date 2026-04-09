import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import * as userModel from '../models/user.model.js';
import { env } from '../config/env.js';
import { httpError } from '../middleware/errorHandler.js';
import { logActionAs } from '../lib/audit.js';

export const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(255),
});

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await userModel.findByUsername(username);
    if (!user) {
      return next(httpError(401, 'Invalid username or password'));
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return next(httpError(401, 'Invalid username or password'));
    }

    // Update last login timestamp and audit the login (best-effort, non-blocking).
    await userModel.updateLastLogin(user.id);
    await logActionAs(
      { id: user.id, username: user.username },
      'login',
      'auth',
      null,
      { role: user.role }
    );

    const token = jwt.sign(
      { sub: user.id, username: user.username, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return next(httpError(404, 'User not found'));
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
