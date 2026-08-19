import type { Membership } from './entities/membership.entity';

/**
 * The single place that decides whether a Membership grants access — never
 * compare `membership.status === 'ACTIVE'` anywhere else.
 */
export function isMembershipActive(membership: Membership): boolean {
  return membership.status === 'ACTIVE';
}
