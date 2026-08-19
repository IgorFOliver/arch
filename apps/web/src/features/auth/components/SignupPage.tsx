'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { AuthLayout } from '@ui/templates/AuthLayout/AuthLayout';

import { SignupForm } from './SignupForm';

import { createSignupSchema, SignupFormValues } from '@/features/auth/schema';
import { useSignup } from '@/features/auth/use-signup';
import { resolveAuthErrorMessage } from '@/features/auth/resolve-auth-error';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';

export function SignupPage() {
  const router = useRouter();
  const dict = useDictionary('auth');
  const { signup: t, validation, errors } = dict;

  const signupSchema = useMemo(
    () => createSignupSchema(validation),
    [validation],
  );

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const signupMutation = useSignup();

  const onSubmit = handleSubmit((values) => signupMutation.mutate(values));

  useEffect(() => {
    if (signupMutation.isSuccess) {
      router.push('/');
    }
  }, [signupMutation.isSuccess, router]);

  const errorMessage = signupMutation.isError
    ? resolveAuthErrorMessage(signupMutation.error, errors, 'signupFailed')
    : undefined;

  return (
    <AuthLayout>
      <SignupForm
        title={t.title}
        submitLabel={t.submitLabel}
        nameLabel={t.nameLabel}
        companyLabel={t.companyLabel}
        emailLabel={t.emailLabel}
        passwordLabel={t.passwordLabel}
        agreeToTermsLabel={t.agreeToTermsLabel}
        nameInputProps={register('name')}
        companyInputProps={register('company')}
        emailInputProps={register('email')}
        passwordInputProps={register('password')}
        agreeToTermsInputProps={register('agreeToTerms')}
        nameError={formErrors.name?.message}
        companyError={formErrors.company?.message}
        emailError={formErrors.email?.message}
        passwordError={formErrors.password?.message}
        agreeToTermsError={formErrors.agreeToTerms?.message}
        error={errorMessage}
        isLoading={signupMutation.isPending}
        onSubmit={onSubmit}
      />
      <p className="mt-4 text-center text-sm text-gray-600">
        {t.haveAccount}{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
        >
          {t.signIn}
        </Link>
      </p>
    </AuthLayout>
  );
}
