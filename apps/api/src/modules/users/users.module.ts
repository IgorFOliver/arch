import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { TenantsModule } from '../tenants/tenants.module';
import { AuditModule } from '../audit/audit.module';
import { UsersController } from './presentation/controllers/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { FindOrCreateFromAuth0UseCase } from './application/use-cases/find-or-create-from-auth0.use-case';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infrastructure/persistence/prisma/prisma-user.repository';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    AuthorizationModule,
    TenantsModule,
    AuditModule,
  ],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    UpdateUserUseCase,
    ListUsersUseCase,
    GetUserUseCase,
    FindOrCreateFromAuth0UseCase,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  exports: [FindOrCreateFromAuth0UseCase, USER_REPOSITORY],
})
export class UsersModule {}
