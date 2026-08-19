import { Module } from '@nestjs/common';
import { AUDIT_PORT } from './domain/audit.port';
import { PrismaAuditLogger } from './infrastructure/persistence/prisma/prisma-audit.repository';

@Module({
  providers: [{ provide: AUDIT_PORT, useClass: PrismaAuditLogger }],
  exports: [AUDIT_PORT],
})
export class AuditModule {}
