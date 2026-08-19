import { Inject, Injectable } from '@nestjs/common';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../domain/repositories/membership.repository';
import type { Membership } from '../../domain/entities/membership.entity';

@Injectable()
export class ListTenantMembersUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  execute(tenantId: string): Promise<Membership[]> {
    return this.membershipRepository.findActiveByTenantId(tenantId);
  }
}
