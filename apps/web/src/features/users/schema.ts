import { z } from 'zod';
import { ROLES } from '@4basearch/domain-types';

export interface CreateUserValidationMessages {
  nameRequired: string;
  emailInvalid: string;
  passwordMin: string;
}

export function createUserSchema(messages: CreateUserValidationMessages) {
  return z.object({
    name: z.string().min(1, { error: messages.nameRequired }),
    company: z.string().optional(),
    email: z.email({ error: messages.emailInvalid }),
    password: z.string().min(8, { error: messages.passwordMin }),
    role: z.enum(ROLES),
  });
}

export type CreateUserFormValues = z.infer<ReturnType<typeof createUserSchema>>;

export interface UpdateUserValidationMessages {
  nameRequired: string;
}

export function updateUserSchema(messages: UpdateUserValidationMessages) {
  return z.object({
    name: z.string().min(1, { error: messages.nameRequired }),
    company: z.string().optional(),
    role: z.enum(ROLES),
  });
}

export type UpdateUserFormValues = z.infer<ReturnType<typeof updateUserSchema>>;
