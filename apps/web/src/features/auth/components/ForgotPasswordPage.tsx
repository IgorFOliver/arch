'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { AuthLayout } from '@4basearch/ui';

import { ForgotPasswordForm } from './ForgotPasswordForm';

import {
  createForgotPasswordSchema,
  ForgotPasswordFormValues,
} from '@/features/auth/schema';
import { useForgotPassword } from '@/features/auth/use-forgot-password';
import { resolveAuthErrorMessage } from '@/features/auth/resolve-auth-error';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';

export function ForgotPasswordPage() {
  const dict = useDictionary('auth');
  const { forgotPassword: t, validation, errors } = dict;

  const schema = useMemo(
    () => createForgotPasswordSchema(validation),
    [validation],
  );

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(schema) });

  const forgotPasswordMutation = useForgotPassword();

  const onSubmit = handleSubmit((values) =>
    forgotPasswordMutation.mutate(values.email),
  );

  // Never conditioned on whether the account actually exists — the
  // backend's response is generic on purpose (see ForgotPasswordUseCase),
  // and this page must stay just as silent about it.
  const errorMessage = forgotPasswordMutation.isError
    ? resolveAuthErrorMessage(
        forgotPasswordMutation.error,
        errors,
        'resetRequestFailed',
      )
    : undefined;

  return (
    <AuthLayout>
      <ForgotPasswordForm
        title={t.title}
        description={t.description}
        submitLabel={t.submitLabel}
        emailLabel={t.emailLabel}
        emailInputProps={register('email')}
        emailError={formErrors.email?.message}
        error={errorMessage}
        successMessage={
          forgotPasswordMutation.isSuccess ? t.successMessage : undefined
        }
        isLoading={forgotPasswordMutation.isPending}
        onSubmit={onSubmit}
      />
      <p className="mt-4 text-center text-sm text-gray-600">
        <Link
          href="/login"
          className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
        >
          {t.backToLogin}
        </Link>
      </p>
    </AuthLayout>
  );
}
