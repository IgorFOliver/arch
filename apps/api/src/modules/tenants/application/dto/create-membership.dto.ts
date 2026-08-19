import { IsEmail, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateMembershipDto {
  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role!: Role;
}
