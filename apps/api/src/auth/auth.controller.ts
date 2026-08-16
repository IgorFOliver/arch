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
import type { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { LoginDto } from './dto/login.dto';
import { SessionGuard } from './guards/session.guard';
import { Auth0AuthGuard } from './guards/auth0-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateLocal(dto.email, dto.password);
    await this.authService.createSession(res, user);
    return { user: this.authService.toPublicUser(user) };
  }

  @UseGuards(SessionGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = this.sessionService.readCookie(req);
    if (token) {
      await this.sessionService.destroy(token);
    }
    this.sessionService.clearCookie(res);
  }

  @UseGuards(SessionGuard)
  @Get('session')
  session(@CurrentUser() user: User) {
    return { user: this.authService.toPublicUser(user) };
  }

  // Doubles as "connect Auth0 to my account" when hit with an existing
  // session cookie — see UsersService.findOrCreateFromAuth0.
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
    await this.authService.createSession(res, user);
    res.redirect(process.env.WEB_APP_URL ?? 'http://localhost:3001');
  }
}
