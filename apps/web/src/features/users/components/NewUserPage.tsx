'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { UserForm } from './UserForm';

import {
  createUserSchema,
  CreateUserFormValues,
} from '@/features/users/schema';
import { useCreateUser } from '@/features/users/hooks/use-create-user';
import { resolveUsersErrorMessage } from '@/features/users/resolve-users-error';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';

export function NewUserPage() {
  const router = useRouter();

  const dict = useDictionary();
  const { form: t, validation, errors } = dict.users;

  const schema = useMemo(() => createUserSchema(validation), [validation]);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(schema),
  });

  const createUserMutation = useCreateUser();

  const onSubmit = handleSubmit((values) => {
    createUserMutation.mutate(values, {
      onSuccess: () => router.push('/users'),
    });
  });

  const errorMessage = createUserMutation.isError
    ? resolveUsersErrorMessage(
        createUserMutation.error,
        errors,
        'createUserFailed',
      )
    : undefined;

  return (
    <UserForm
      title={dict.users.createPage.title}
      submitLabel={dict.users.createPage.submitLabel}
      nameLabel={t.nameLabel}
      companyLabel={t.companyLabel}
      emailLabel={t.emailLabel}
      passwordLabel={t.passwordLabel}
      nameInputProps={register('name')}
      companyInputProps={register('company')}
      emailInputProps={register('email')}
      passwordInputProps={register('password')}
      nameError={formErrors.name?.message}
      companyError={formErrors.company?.message}
      emailError={formErrors.email?.message}
      passwordError={formErrors.password?.message}
      error={errorMessage}
      isLoading={createUserMutation.isPending}
      onSubmit={onSubmit}
    />
  );
}
