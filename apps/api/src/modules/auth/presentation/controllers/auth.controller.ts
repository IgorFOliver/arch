import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { Role } from '@4basearch/domain-types';
import type { User } from '../../../users/domain/entities/user.entity';
import { toPublicUser } from '../../../users/application/mappers/user.mapper';
import { ResolveTenantContextUseCase } from '../../../tenants/application/use-cases/resolve-tenant-context.use-case';
import {
  PLATFORM_ADMIN_REPOSITORY,
  type PlatformAdminRepository,
} from '../../../platform/domain/repositories/platform-admin.repository';
import { LoginDto } from '../../application/dto/login.dto';
import { SignupDto } from '../../application/dto/signup.dto';
import { SwitchTenantDto } from '../../application/dto/switch-tenant.dto';
import { ForgotPasswordDto } from '../../application/dto/forgot-password.dto';
import { ResetPasswordDto } from '../../application/dto/reset-password.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { SignupUseCase } from '../../application/use-cases/signup.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { CreateSessionUseCase } from '../../application/use-cases/create-session.use-case';
import { SwitchActiveTenantUseCase } from '../../application/use-cases/switch-active-tenant.use-case';
import { ListMyTenantsUseCase } from '../../application/use-cases/list-my-tenants.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { SessionGuard } from '../guards/session.guard';
import { Auth0AuthGuard } from '../guards/auth0-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  clearSessionCookie,
  readSessionCookie,
  setSessionCookie,
} from '../../infrastructure/cookies/session-cookie';

type AuthenticatedRequest = Request & {
  activeTenantId?: string | null;
  sessionToken?: string;
};

// PUBLIC: login/signup. AUTHENTICATED (no TenantGuard): everything else
// here — a session must stay valid even for a user with zero or several
// tenants, so none of these routes can fail-closed on tenant resolution.
// `role` in the response is a best-effort convenience for the frontend
// (nav visibility only) — never an authorization decision. Real
// tenant-scoped authorization always goes through TenantGuard + RolesGuard
// on the routes that actually need it (see UsersController).
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly signupUseCase: SignupUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly resolveTenantContextUseCase: ResolveTenantContextUseCase,
    private readonly switchActiveTenantUseCase: SwitchActiveTenantUseCase,
    private readonly listMyTenantsUseCase: ListMyTenantsUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    @Inject(PLATFORM_ADMIN_REPOSITORY)
    private readonly platformAdminRepository: PlatformAdminRepository,
  ) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, session } = await this.loginUseCase.execute(dto);
    setSessionCookie(res, session.token);
    const role = await this.resolveOptionalRole(
      user.id,
      session.activeTenantId,
    );
    const isPlatformAdmin = await this.resolveIsPlatformAdmin(user.id);
    return { user: { ...toPublicUser(user, role), isPlatformAdmin } };
  }

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, session } = await this.signupUseCase.execute(dto);
    setSessionCookie(res, session.token);
    const role = await this.resolveOptionalRole(
      user.id,
      session.activeTenantId,
    );
    const isPlatformAdmin = await this.resolveIsPlatformAdmin(user.id);
    return { user: { ...toPublicUser(user, role), isPlatformAdmin } };
  }

  // Generic response no matter what — same message whether the email
  // exists, is on cooldown, or was never registered. Never let this
  // endpoint answer "does this account exist?".
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(ThrottlerGuard)
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.forgotPasswordUseCase.execute(dto);
    return {
      message:
        'If an account exists with this email, a password reset link has been sent.',
    };
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseGuards(ThrottlerGuard)
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.resetPasswordUseCase.execute(dto);
    return { message: 'Your password has been reset successfully.' };
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
  async session(@CurrentUser() user: User, @Req() req: AuthenticatedRequest) {
    const role = await this.resolveOptionalRole(
      user.id,
      req.activeTenantId ?? null,
    );
    const isPlatformAdmin = await this.resolveIsPlatformAdmin(user.id);
    return { user: { ...toPublicUser(user, role), isPlatformAdmin } };
  }

  /**
   * The only way the Current Tenant ever changes. The frontend sends
   * nothing but the tenantId it wants — existence, status, and Membership
   * are all re-verified here (see SwitchActiveTenantUseCase) before the
   * session is touched; a client can't grant itself access to a tenant
   * just by asking.
   */
  @UseGuards(SessionGuard)
  @Post('session/tenant')
  async switchTenant(
    @CurrentUser() user: User,
    @Req() req: AuthenticatedRequest,
    @Body() dto: SwitchTenantDto,
  ) {
    const { tenant, membership } = await this.switchActiveTenantUseCase.execute(
      {
        userId: user.id,
        sessionToken: req.sessionToken as string,
        tenantId: dto.tenantId,
      },
    );
    return { tenant, role: membership.role };
  }

  /**
   * Every Tenant the caller could switch into — the data source for a
   * frontend tenant picker. Listing is AUTHENTICATED only (no TenantGuard):
   * it must work even for a user with zero or several Tenants, since its
   * entire purpose is helping them get *to* one.
   */
  @UseGuards(SessionGuard)
  @Get('session/tenants')
  async myTenants(@CurrentUser() user: User) {
    const tenants = await this.listMyTenantsUseCase.execute(user.id);
    return { tenants };
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

  /**
   * Best-effort: resolves the caller's role in their current tenant when
   * unambiguous, or null otherwise. Never throws — this endpoint is
   * AUTHENTICATED, not TENANT_SCOPED, so it must succeed regardless of
   * whether a tenant can be resolved.
   */
  private async resolveOptionalRole(
    userId: string,
    activeTenantId: string | null,
  ): Promise<Role | null> {
    try {
      const tenantContext = await this.resolveTenantContextUseCase.execute({
        userId,
        activeTenantId,
      });
      return tenantContext.role;
    } catch {
      return null;
    }
  }

  /**
   * Same "convenience, informational only" contract as resolveOptionalRole
   * above, for Platform Scope instead of Tenant Scope — a simple lookup,
   * never a Membership concern, so it needs no try/catch to stay
   * AUTHENTICATED-safe. Real Platform authorization is always re-checked
   * independently by PlatformGuard on the routes that need it (see
   * TenantsController under modules/tenant-management).
   */
  private async resolveIsPlatformAdmin(userId: string): Promise<boolean> {
    const platformAdmin =
      await this.platformAdminRepository.findByUserId(userId);
    return platformAdmin !== null;
  }
}
