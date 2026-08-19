'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { AuthLayout } from '@ui/templates/AuthLayout/AuthLayout';

import { LoginForm } from './LoginForm';

import { createLoginSchema, LoginFormValues } from '@/features/auth/schema';
import { useSession } from '@/infrastructure/auth/SessionProvider';
import { useLogin } from '@/features/auth/use-login';
import { resolveAuthErrorMessage } from '@/features/auth/resolve-auth-error';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';

export function LoginPage() {
  const router = useRouter();
  const dict = useDictionary('auth');
  const { login: t, validation, errors } = dict;
  const { isBlocked } = useSession();

  const loginSchema = useMemo(
    () => createLoginSchema(validation),
    [validation],
  );

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const loginMutation = useLogin();

  const onSubmit = handleSubmit((values) => loginMutation.mutate(values));

  useEffect(() => {
    if (loginMutation.isSuccess) {
      router.push('/');
    }
  }, [loginMutation.isSuccess, router]);

  const errorMessage = loginMutation.isError
    ? resolveAuthErrorMessage(loginMutation.error, errors, 'loginFailed')
    : isBlocked
      ? errors.accountInactive
      : undefined;

  return (
    <AuthLayout>
      <LoginForm
        title={t.title}
        submitLabel={t.submitLabel}
        emailLabel={t.emailLabel}
        passwordLabel={t.passwordLabel}
        emailInputProps={register('email')}
        passwordInputProps={register('password')}
        emailError={formErrors.email?.message}
        passwordError={formErrors.password?.message}
        error={errorMessage}
        isLoading={loginMutation.isPending}
        onSubmit={onSubmit}
      />
      <p className="mt-4 text-center text-sm text-gray-600">
        {t.noAccount}{' '}
        <Link
          href="/signup"
          className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
        >
          {t.createOne}
        </Link>
      </p>
    </AuthLayout>
  );
}
