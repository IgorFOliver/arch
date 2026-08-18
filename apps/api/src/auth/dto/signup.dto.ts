import {
  Equals,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SignupDto {
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

  @Equals(true, { message: 'You must agree to the terms to continue.' })
  agreeToTerms!: boolean;
}
