import { IsString, Matches, MinLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MinLength(1)
  name!: string;

  // Uniqueness is enforced by the database (Tenant.slug is @unique) — this
  // only validates shape, never treated as sufficient on its own.
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, alphanumeric, and hyphen-separated.',
  })
  slug!: string;
}
