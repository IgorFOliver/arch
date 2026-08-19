import { Inject, Injectable } from '@nestjs/common';
import type {
  RequestContext,
  TenantResolver,
} from '../../domain/ports/tenant-resolver';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../domain/repositories/membership.repository';
import { resolveDefaultTenantId } from '../../domain/resolve-default-tenant';

/**
 * Primary path: the Current Tenant already recorded on the session
 * (`context.activeTenantId`) — set at login/signup and kept up to date
 * by the explicit switch-tenant endpoint, so this is normally a
 * zero-query read.
 *
 * Fallback path: sessions that predate this field, or were created
 * before the user had any Membership yet, fall back to the same
 * single-active-Membership convenience CreateSessionUseCase uses.
 * `hostname`/`headers` on the RequestContext remain unused for now —
 * still the boundary that lets a subdomain/API-key/OAuth-client resolver
 * be dropped in later without touching TenantGuard or anything upstream.
 */
@Injectable()
export class MembershipTenantResolver implements TenantResolver {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async resolve(context: RequestContext): Promise<string | null> {
    if (context.activeTenantId) {
      return context.activeTenantId;
    }

    const memberships = await this.membershipRepository.findActiveByUserId(
      context.userId,
    );
    return resolveDefaultTenantId(memberships);
  }
}
