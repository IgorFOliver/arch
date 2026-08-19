import { Injectable } from '@nestjs/common';
import type { PlatformAdmin as PrismaPlatformAdmin } from '@prisma/client';
import { PrismaService } from '../../../../../prisma/prisma.service';
import type { PlatformAdminRepository } from '../../../domain/repositories/platform-admin.repository';
import type { PlatformAdmin } from '../../../domain/entities/platform-admin.entity';

function toDomainPlatformAdmin(row: PrismaPlatformAdmin): PlatformAdmin {
  return {
    id: row.id,
    userId: row.userId,
    role: row.role,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class PrismaPlatformAdminRepository implements PlatformAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<PlatformAdmin | null> {
    const row = await this.prisma.platformAdmin.findUnique({
      where: { userId },
    });
    return row ? toDomainPlatformAdmin(row) : null;
  }
}
