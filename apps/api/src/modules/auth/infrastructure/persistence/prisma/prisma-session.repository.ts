import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../../../../prisma/prisma.service';
import type {
  CreatedSession,
  SessionRecord,
  SessionRepository,
} from '../../../domain/repositories/session.repository';
import { hashToken } from '../../hashing/token-hasher';
import { SESSION_TTL_MS } from '../../../session.constants';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    activeTenantId: string | null,
  ): Promise<CreatedSession> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await this.prisma.session.create({
      data: { tokenHash: hashToken(token), userId, expiresAt, activeTenantId },
    });

    return { token, expiresAt, activeTenantId };
  }

  async findByToken(token: string): Promise<SessionRecord | null> {
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return { userId: session.userId, activeTenantId: session.activeTenantId };
  }

  async setActiveTenant(token: string, tenantId: string | null): Promise<void> {
    await this.prisma.session.updateMany({
      where: { tokenHash: hashToken(token) },
      data: { activeTenantId: tenantId },
    });
  }

  async revoke(token: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }
}
