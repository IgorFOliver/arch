'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { AuthLayout } from '@ui/templates/AuthLayout/AuthLayout';
import { Button } from '@ui/atoms/Button/Button';

import { ResetPasswordForm } from './ResetPasswordForm';

import {
  createResetPasswordSchema,
  ResetPasswordFormValues,
} from '@/features/auth/schema';
import { useResetPassword } from '@/features/auth/use-reset-password';
import { resolveAuthErrorMessage } from '@/features/auth/resolve-auth-error';
import { AuthApiError } from '@/features/auth/api';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';

export function ResetPasswordPage() {
  const dict = useDictionary('auth');
  const { resetPassword: t, validation, errors } = dict;

  // The token only ever needs to travel from the URL to the one POST
  // request that consumes it — it's read here and nowhere else gets to
  // hold onto it (no context, no query cache key, nothing beyond this
  // component's own closure).
  const token = useSearchParams().get('token');

  const schema = useMemo(
    () => createResetPasswordSchema(validation),
    [validation],
  );

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(schema) });

  const resetPasswordMutation = useResetPassword();

  const onSubmit = handleSubmit((values) => {
    if (!token) return;
    resetPasswordMutation.mutate({ token, password: values.password });
  });

  if (!token) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t.missingTokenTitle}
          </h1>
          <p className="text-sm text-gray-600">{t.missingTokenDescription}</p>
          <Link href="/forgot-password">
            <Button type="button" fullWidth>
              {t.requestNewLink}
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (resetPasswordMutation.isSuccess) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t.successTitle}
          </h1>
          <p className="text-sm text-gray-600">{t.successDescription}</p>
          <Link href="/login">
            <Button type="button" fullWidth>
              {t.goToLogin}
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const isTokenInvalid =
    resetPasswordMutation.error instanceof AuthApiError &&
    resetPasswordMutation.error.code === 'resetTokenInvalid';

  if (isTokenInvalid) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t.invalidTokenTitle}
          </h1>
          <p className="text-sm text-gray-600">{t.invalidTokenDescription}</p>
          <Link href="/forgot-password">
            <Button type="button" fullWidth>
              {t.requestNewLink}
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const errorMessage = resetPasswordMutation.isError
    ? resolveAuthErrorMessage(
        resetPasswordMutation.error,
        errors,
        'resetFailed',
      )
    : undefined;

  return (
    <AuthLayout>
      <ResetPasswordForm
        title={t.title}
        submitLabel={t.submitLabel}
        passwordLabel={t.passwordLabel}
        confirmPasswordLabel={t.confirmPasswordLabel}
        passwordInputProps={register('password')}
        confirmPasswordInputProps={register('confirmPassword')}
        passwordError={formErrors.password?.message}
        confirmPasswordError={formErrors.confirmPassword?.message}
        error={errorMessage}
        isLoading={resetPasswordMutation.isPending}
        onSubmit={onSubmit}
      />
    </AuthLayout>
  );
}
