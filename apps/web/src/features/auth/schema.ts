import { z } from 'zod';

export interface LoginValidationMessages {
  emailInvalid: string;
  passwordMin: string;
}

export function createLoginSchema(messages: LoginValidationMessages) {
  return z.object({
    email: z.email({ error: messages.emailInvalid }),
    password: z.string().min(8, { error: messages.passwordMin }),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export interface SignupValidationMessages {
  nameRequired: string;
  emailInvalid: string;
  passwordMin: string;
  agreeToTermsRequired: string;
}

export function createSignupSchema(messages: SignupValidationMessages) {
  return z.object({
    name: z.string().min(1, { error: messages.nameRequired }),
    company: z.string().optional(),
    email: z.email({ error: messages.emailInvalid }),
    password: z.string().min(8, { error: messages.passwordMin }),
    agreeToTerms: z.literal(true, { error: messages.agreeToTermsRequired }),
  });
}

export type SignupFormValues = z.infer<ReturnType<typeof createSignupSchema>>;

export interface ForgotPasswordValidationMessages {
  emailInvalid: string;
}

export function createForgotPasswordSchema(
  messages: ForgotPasswordValidationMessages,
) {
  return z.object({
    email: z.email({ error: messages.emailInvalid }),
  });
}

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;

export interface ResetPasswordValidationMessages {
  passwordMin: string;
  passwordMismatch: string;
}

export function createResetPasswordSchema(
  messages: ResetPasswordValidationMessages,
) {
  return z
    .object({
      password: z.string().min(8, { error: messages.passwordMin }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      error: messages.passwordMismatch,
      path: ['confirmPassword'],
    });
}

export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;
