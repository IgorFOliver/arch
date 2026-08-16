import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import Strategy from 'passport-auth0';
import { UsersService } from '../../users/users.service';
import { SessionService } from '../session.service';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
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
      const token = this.sessionService.readCookie(req);
      const currentUser = token
        ? ((await this.sessionService.validate(token)) ?? undefined)
        : undefined;

      const user = await this.usersService.findOrCreateFromAuth0(
        { id: profile.id, emails: profile.emails },
        currentUser,
      );
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
