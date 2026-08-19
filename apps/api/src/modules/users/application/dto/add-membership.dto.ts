import { IsEnum, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

export class AddMembershipDto {
  @IsUUID()
  tenantId!: string;

  @IsEnum(Role)
  role!: Role;
}
