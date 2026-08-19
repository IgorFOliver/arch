import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { AuditModule } from './modules/audit/audit.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { PlatformModule } from './modules/platform/platform.module';
import { TenantManagementModule } from './modules/tenant-management/tenant-management.module';

@Module({
  imports: [
    PrismaModule,
    AuthorizationModule,
    AuditModule,
    UsersModule,
    AuthModule,
    TenantsModule,
    PlatformModule,
    TenantManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
