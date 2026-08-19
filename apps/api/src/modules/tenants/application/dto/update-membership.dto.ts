import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

// Deliberately just `role` — status changes go through the explicit
// reactivate/revoke endpoints, never a generic field-level PATCH.
export class UpdateMembershipDto {
  @IsEnum(Role)
  role!: Role;
}
