import { Inject, Injectable } from '@nestjs/common';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../domain/repositories/membership.repository';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../users/domain/repositories/user.repository';
import {
  toMembershipWithUser,
  type MembershipWithUser,
} from '../membership-with-user';

/** Admin CRUD list view: every Membership in the tenant, active or
 *  revoked — revoked ones stay visible so they can be found and
 *  reactivated (see ReactivateMembershipUseCase). */
@Injectable()
export class ListTenantMembersUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(tenantId: string): Promise<MembershipWithUser[]> {
    const memberships =
      await this.membershipRepository.findByTenantId(tenantId);
    const users = await Promise.all(
      memberships.map((membership) =>
        this.userRepository.findById(membership.userId),
      ),
    );

    return memberships.reduce<MembershipWithUser[]>(
      (views, membership, index) => {
        const user = users[index];
        if (user) {
          views.push(toMembershipWithUser(membership, user));
        }
        return views;
      },
      [],
    );
  }
}
