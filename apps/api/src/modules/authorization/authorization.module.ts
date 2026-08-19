import { Module } from '@nestjs/common';
import { PermissionsService } from './application/permissions.service';
import { RolesGuard } from './presentation/guards/roles.guard';

@Module({
  providers: [PermissionsService, RolesGuard],
  exports: [PermissionsService, RolesGuard],
})
export class AuthorizationModule {}
