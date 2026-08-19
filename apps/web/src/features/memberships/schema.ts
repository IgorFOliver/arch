import { z } from 'zod';
import { ROLES } from '@4basearch/domain-types';

export interface CreateMembershipValidationMessages {
  emailInvalid: string;
}

export function createMembershipSchema(
  messages: CreateMembershipValidationMessages,
) {
  return z.object({
    email: z.email({ error: messages.emailInvalid }),
    role: z.enum(ROLES),
  });
}

export type CreateMembershipFormValues = z.infer<
  ReturnType<typeof createMembershipSchema>
>;

export function updateMembershipSchema() {
  return z.object({
    role: z.enum(ROLES),
  });
}

export type UpdateMembershipFormValues = z.infer<
  ReturnType<typeof updateMembershipSchema>
>;
