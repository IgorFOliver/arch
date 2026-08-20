import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../../../../prisma/prisma.service';
import type {
  CreatedPasswordResetToken,
  PasswordResetTokenRecord,
  PasswordResetTokenRepository,
} from '../../../domain/repositories/password-reset-token.repository';
import { hashToken } from '../../hashing/token-hasher';

@Injectable()
export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    expiresAt: Date,
  ): Promise<CreatedPasswordResetToken> {
    const token = randomBytes(32).toString('hex');

    await this.prisma.passwordResetToken.create({
      data: { userId, tokenHash: hashToken(token), expiresAt },
    });

    return { token, expiresAt };
  }

  async findByToken(token: string): Promise<PasswordResetTokenRecord | null> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!record) return null;

    return {
      id: record.id,
      userId: record.userId,
      expiresAt: record.expiresAt,
      usedAt: record.usedAt,
    };
  }

  async markUsed(id: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async invalidateAllForUser(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
  }

  async findMostRecentForUser(
    userId: string,
  ): Promise<{ createdAt: Date } | null> {
    return this.prisma.passwordResetToken.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
  }
}
