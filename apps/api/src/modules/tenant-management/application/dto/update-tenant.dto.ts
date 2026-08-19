import { IsOptional, IsString, MinLength } from 'class-validator';

// Deliberately no `slug` and no `status` here — slug is the external
// identifier and stays immutable after creation, and lifecycle status
// only changes through the explicit Activate/Suspend endpoints, never a
// generic field-level PATCH.
export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;
}
