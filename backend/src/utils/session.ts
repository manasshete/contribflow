import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';

export const SESSION_COOKIE_NAME = 'contribflow_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SessionPayload {
  userId: string;
}

export function signSession(payload: SessionPayload): string {
  if (!env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not configured');
  }
  return jwt.sign(payload, env.SESSION_SECRET, { expiresIn: '30d' });
}

export function verifySession(token: string): SessionPayload | null {
  if (!env.SESSION_SECRET) return null;
  try {
    return jwt.verify(token, env.SESSION_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
}
