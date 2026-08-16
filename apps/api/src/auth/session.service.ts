import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { Session, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'arch_session';
const TTL_DAYS = Number(process.env.SESSION_TTL_DAYS ?? 7);
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string): Promise<Session> {
    return this.prisma.session.create({
      data: {
        id: randomBytes(32).toString('hex'),
        userId,
        expiresAt: new Date(Date.now() + TTL_MS),
      },
    });
  }

  async validate(token: string): Promise<User | null> {
    const session = await this.prisma.session.findUnique({
      where: { id: token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  }

  async destroy(token: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { id: token } });
  }

  setCookie(res: Response, token: string): void {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: TTL_MS,
      path: '/',
    });
  }

  clearCookie(res: Response): void {
    res.clearCookie(COOKIE_NAME, { path: '/' });
  }

  readCookie(req: Request): string | undefined {
    return req.cookies?.[COOKIE_NAME] as string | undefined;
  }
}
