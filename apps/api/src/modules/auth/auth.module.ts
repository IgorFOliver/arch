import { Logger, Module, Provider, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './presentation/controllers/auth.controller';
import { SessionGuard } from './presentation/guards/session.guard';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { SignupUseCase } from './application/use-cases/signup.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { ValidateSessionUseCase } from './application/use-cases/validate-session.use-case';
import { CreateSessionUseCase } from './application/use-cases/create-session.use-case';
import { SESSION_REPOSITORY } from './domain/repositories/session.repository';
import { PrismaSessionRepository } from './infrastructure/persistence/prisma/prisma-session.repository';
import { Auth0Strategy } from './infrastructure/strategies/auth0.strategy';

const auth0Configured = Boolean(
  process.env.AUTH0_DOMAIN &&
  process.env.AUTH0_CLIENT_ID &&
  process.env.AUTH0_CLIENT_SECRET,
);

if (!auth0Configured) {
  new Logger('AuthModule').warn(
    'AUTH0_DOMAIN/AUTH0_CLIENT_ID/AUTH0_CLIENT_SECRET are not set — /auth/auth0/* routes will be unavailable.',
  );
}

const auth0Providers: Provider[] = auth0Configured ? [Auth0Strategy] : [];

@Module({
  imports: [PassportModule, forwardRef(() => UsersModule)],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    SignupUseCase,
    LogoutUseCase,
    ValidateSessionUseCase,
    CreateSessionUseCase,
    SessionGuard,
    { provide: SESSION_REPOSITORY, useClass: PrismaSessionRepository },
    ...auth0Providers,
  ],
  exports: [ValidateSessionUseCase, SessionGuard],
})
export class AuthModule {}
