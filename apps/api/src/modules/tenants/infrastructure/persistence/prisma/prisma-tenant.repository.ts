import { Injectable } from '@nestjs/common';
import type { Prisma, Tenant as PrismaTenant } from '@prisma/client';
import { PrismaService } from '../../../../../prisma/prisma.service';
import type {
  CreateTenantData,
  ListTenantsFilter,
  TenantRepository,
  UpdateTenantData,
} from '../../../domain/repositories/tenant.repository';
import type {
  Tenant,
  TenantStatus,
} from '../../../domain/entities/tenant.entity';

function toDomainTenant(tenant: PrismaTenant): Tenant {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    status: tenant.status,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  };
}

@Injectable()
export class PrismaTenantRepository implements TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    return tenant ? toDomainTenant(tenant) : null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    return tenant ? toDomainTenant(tenant) : null;
  }

  async create(data: CreateTenantData): Promise<Tenant> {
    const tenant = await this.prisma.tenant.create({
      data: { name: data.name, slug: data.slug },
    });
    return toDomainTenant(tenant);
  }

  async list(
    filter: ListTenantsFilter,
  ): Promise<{ tenants: Tenant[]; total: number }> {
    const where: Prisma.TenantWhereInput = {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.search
        ? {
            OR: [
              { name: { contains: filter.search, mode: 'insensitive' } },
              { slug: { contains: filter.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [tenants, total] = await this.prisma.$transaction([
      this.prisma.tenant.findMany({
        where,
        orderBy: { [filter.sortBy]: filter.sortDir },
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return { tenants: tenants.map(toDomainTenant), total };
  }

  async update(id: string, data: UpdateTenantData): Promise<Tenant> {
    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: { name: data.name },
    });
    return toDomainTenant(tenant);
  }

  async updateStatus(id: string, status: TenantStatus): Promise<Tenant> {
    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: { status },
    });
    return toDomainTenant(tenant);
  }
}
