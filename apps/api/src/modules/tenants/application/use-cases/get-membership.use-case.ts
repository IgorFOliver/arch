import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class GetMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(tenantId: string, id: string): Promise<MembershipWithUser> {
    const membership = await this.membershipRepository.findById(tenantId, id);
    if (!membership) {
      throw new NotFoundException('Membership not found.');
    }
    const user = await this.userRepository.findById(membership.userId);
    if (!user) {
      throw new NotFoundException('Membership not found.');
    }
    return toMembershipWithUser(membership, user);
  }
}
