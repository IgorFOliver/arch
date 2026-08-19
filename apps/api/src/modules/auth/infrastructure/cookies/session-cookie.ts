import type { Request, Response } from 'express';
import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from '../../session.constants';

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
}

export function readSessionCookie(req: Request): string | undefined {
  return req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
}
