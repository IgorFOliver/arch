import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../prisma/prisma.service';
import type { AuditEvent } from '../../../domain/audit-event';
import type { AuditPort } from '../../../domain/audit.port';

@Injectable()
export class PrismaAuditLogger implements AuditPort {
  constructor(private readonly prisma: PrismaService) {}

  async record(event: AuditEvent): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        tenantId: event.tenantId,
        actorUserId: event.actorUserId,
        action: event.action,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        metadata: event.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
