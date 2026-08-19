import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;
}
