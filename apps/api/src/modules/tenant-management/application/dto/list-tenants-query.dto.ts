import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { TenantStatus } from '@prisma/client';

export type TenantsSortField = 'createdAt' | 'name' | 'slug';
export type SortDirection = 'asc' | 'desc';

export class ListTenantsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @IsOptional()
  @IsIn(['createdAt', 'name', 'slug'])
  sortBy: TenantsSortField = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir: SortDirection = 'desc';
}
