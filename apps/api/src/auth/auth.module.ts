import { Logger, Module, Provider } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { Auth0Strategy } from './strategies/auth0.strategy';

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
  imports: [PassportModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, SessionService, ...auth0Providers],
})
export class AuthModule {}
