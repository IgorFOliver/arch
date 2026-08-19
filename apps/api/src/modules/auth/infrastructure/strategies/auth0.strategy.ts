import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import Strategy from 'passport-auth0';
import { FindOrCreateFromAuth0UseCase } from '../../../users/application/use-cases/find-or-create-from-auth0.use-case';
import { ValidateSessionUseCase } from '../../application/use-cases/validate-session.use-case';
import { readSessionCookie } from '../cookies/session-cookie';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor(
    private readonly findOrCreateFromAuth0UseCase: FindOrCreateFromAuth0UseCase,
    private readonly validateSessionUseCase: ValidateSessionUseCase,
  ) {
    super({
      domain: process.env.AUTH0_DOMAIN ?? '',
      clientID: process.env.AUTH0_CLIENT_ID ?? '',
      clientSecret: process.env.AUTH0_CLIENT_SECRET ?? '',
      callbackURL: process.env.AUTH0_CALLBACK_URL ?? '',
      passReqToCallback: true,
      // passport-auth0 stores the OAuth `state` param in req.session by
      // default; we don't run express-session (sessions live in Postgres),
      // so state validation must be disabled here.
      state: false,
    });
  }

  async validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    _extraParams: unknown,
    profile: Strategy.Profile,
    done: (error: unknown, user?: unknown, info?: unknown) => void,
  ): Promise<void> {
    try {
      const token = readSessionCookie(req);
      const currentUser = token
        ? ((await this.validateSessionUseCase.execute(token)) ?? undefined)
        : undefined;

      const user = await this.findOrCreateFromAuth0UseCase.execute(
        { id: profile.id, emails: profile.emails },
        currentUser,
      );
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
