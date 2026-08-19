import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { User } from '../../../users/domain/entities/user.entity';
import { toPublicUser } from '../../../users/application/mappers/user.mapper';
import { LoginDto } from '../../application/dto/login.dto';
import { SignupDto } from '../../application/dto/signup.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { SignupUseCase } from '../../application/use-cases/signup.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { CreateSessionUseCase } from '../../application/use-cases/create-session.use-case';
import { SessionGuard } from '../guards/session.guard';
import { Auth0AuthGuard } from '../guards/auth0-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  clearSessionCookie,
  readSessionCookie,
  setSessionCookie,
} from '../../infrastructure/cookies/session-cookie';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly signupUseCase: SignupUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, session } = await this.loginUseCase.execute(dto);
    setSessionCookie(res, session.token);
    return { user: toPublicUser(user) };
  }

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, session } = await this.signupUseCase.execute(dto);
    setSessionCookie(res, session.token);
    return { user: toPublicUser(user) };
  }

  @UseGuards(SessionGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = readSessionCookie(req);
    if (token) {
      await this.logoutUseCase.execute(token);
    }
    clearSessionCookie(res);
  }

  @UseGuards(SessionGuard)
  @Get('session')
  session(@CurrentUser() user: User) {
    return { user: toPublicUser(user) };
  }

  // Doubles as "connect Auth0 to my account" when hit with an existing
  // session cookie — see FindOrCreateFromAuth0UseCase.
  @UseGuards(Auth0AuthGuard)
  @Get('auth0/login')
  auth0Login(): void {
    // Passport intercepts this request and redirects to Auth0; this body never runs.
  }

  @UseGuards(Auth0AuthGuard)
  @Get('auth0/callback')
  async auth0Callback(
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    const session = await this.createSessionUseCase.execute(user);
    setSessionCookie(res, session.token);
    res.redirect(process.env.WEB_APP_URL ?? 'http://localhost:3001');
  }
}
