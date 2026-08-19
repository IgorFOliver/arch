import { z } from 'zod';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export interface CreateTenantValidationMessages {
  nameRequired: string;
  slugRequired: string;
  slugInvalid: string;
}

export function createTenantSchema(messages: CreateTenantValidationMessages) {
  return z.object({
    name: z.string().min(1, { error: messages.nameRequired }),
    slug: z
      .string()
      .min(1, { error: messages.slugRequired })
      .regex(SLUG_PATTERN, { error: messages.slugInvalid }),
  });
}

export type CreateTenantFormValues = z.infer<
  ReturnType<typeof createTenantSchema>
>;

export interface UpdateTenantValidationMessages {
  nameRequired: string;
}

export function updateTenantSchema(messages: UpdateTenantValidationMessages) {
  return z.object({
    name: z.string().min(1, { error: messages.nameRequired }),
  });
}

export type UpdateTenantFormValues = z.infer<
  ReturnType<typeof updateTenantSchema>
>;
