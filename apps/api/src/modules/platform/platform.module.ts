import { Module } from '@nestjs/common';
import { PLATFORM_ADMIN_REPOSITORY } from './domain/repositories/platform-admin.repository';
import { PrismaPlatformAdminRepository } from './infrastructure/persistence/prisma/prisma-platform-admin.repository';
import { PlatformGuard } from './presentation/guards/platform.guard';

@Module({
  providers: [
    {
      provide: PLATFORM_ADMIN_REPOSITORY,
      useClass: PrismaPlatformAdminRepository,
    },
    PlatformGuard,
  ],
  exports: [PLATFORM_ADMIN_REPOSITORY, PlatformGuard],
})
export class PlatformModule {}
