import { Injectable, NotFoundException } from '@nestjs/common';
import type { Membership as PrismaMembership } from '@prisma/client';
import type { Role } from '@4basearch/domain-types';
import { PrismaService } from '../../../../../prisma/prisma.service';
import type {
  CreateMembershipData,
  MembershipRepository,
} from '../../../domain/repositories/membership.repository';
import type { Membership } from '../../../domain/entities/membership.entity';

function toDomainMembership(membership: PrismaMembership): Membership {
  return {
    id: membership.id,
    userId: membership.userId,
    tenantId: membership.tenantId,
    role: membership.role,
    status: membership.status,
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
  };
}

@Injectable()
export class PrismaMembershipRepository implements MembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(tenantId: string, id: string): Promise<Membership | null> {
    // `findFirst`, not `findUnique`: the whole point is to require both
    // `id` and `tenantId` to match — a membership id from another tenant
    // must resolve to null, never leak the row.
    const membership = await this.prisma.membership.findFirst({
      where: { id, tenantId },
    });
    return membership ? toDomainMembership(membership) : null;
  }

  async findByUserAndTenant(
    userId: string,
    tenantId: string,
  ): Promise<Membership | null> {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
    });
    return membership ? toDomainMembership(membership) : null;
  }

  async findActiveByUserId(userId: string): Promise<Membership[]> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId, status: 'ACTIVE' },
    });
    return memberships.map(toDomainMembership);
  }

  async findActiveByTenantId(tenantId: string): Promise<Membership[]> {
    const memberships = await this.prisma.membership.findMany({
      where: { tenantId, status: 'ACTIVE' },
    });
    return memberships.map(toDomainMembership);
  }

  async findByTenantId(tenantId: string): Promise<Membership[]> {
    const memberships = await this.prisma.membership.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return memberships.map(toDomainMembership);
  }

  async findAllByUserId(userId: string): Promise<Membership[]> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return memberships.map(toDomainMembership);
  }

  async findByIdUnscoped(id: string): Promise<Membership | null> {
    const membership = await this.prisma.membership.findUnique({
      where: { id },
    });
    return membership ? toDomainMembership(membership) : null;
  }

  async create(data: CreateMembershipData): Promise<Membership> {
    const membership = await this.prisma.membership.create({
      data: { userId: data.userId, tenantId: data.tenantId, role: data.role },
    });
    return toDomainMembership(membership);
  }

  async reactivate(
    tenantId: string,
    id: string,
    role: Role,
  ): Promise<Membership> {
    return this.mutateWithinTenant(tenantId, id, { status: 'ACTIVE', role });
  }

  async revoke(tenantId: string, id: string): Promise<Membership> {
    return this.mutateWithinTenant(tenantId, id, { status: 'REVOKED' });
  }

  async updateRole(
    tenantId: string,
    id: string,
    role: Role,
  ): Promise<Membership> {
    return this.mutateWithinTenant(tenantId, id, { role });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.membership.delete({ where: { id } });
  }

  /**
   * `updateMany` (not `update`) so the `tenantId` filter actually
   * participates in the WHERE clause — `update({ where: { id } })` would
   * happily mutate a membership from another tenant if the id matched.
   * `count !== 1` means `id` didn't belong to `tenantId`, which is treated
   * exactly like "not found" (never revealed as "found, but not yours").
   */
  private async mutateWithinTenant(
    tenantId: string,
    id: string,
    data: { status?: 'ACTIVE' | 'REVOKED'; role?: Role },
  ): Promise<Membership> {
    const { count } = await this.prisma.membership.updateMany({
      where: { id, tenantId },
      data,
    });
    if (count !== 1) {
      throw new NotFoundException('Membership not found.');
    }

    const membership = await this.prisma.membership.findFirst({
      where: { id, tenantId },
    });
    if (!membership) {
      throw new NotFoundException('Membership not found.');
    }
    return toDomainMembership(membership);
  }
}
