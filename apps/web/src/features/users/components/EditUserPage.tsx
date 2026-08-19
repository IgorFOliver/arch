'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { UserForm } from './UserForm';
import { UserMemberships } from './UserMemberships';

import { useUser } from '@/features/users/hooks/use-user';
import {
  updateUserSchema,
  UpdateUserFormValues,
} from '@/features/users/schema';
import { useUpdateUser } from '@/features/users/hooks/use-update-user';
import { resolveUsersErrorMessage } from '@/features/users/resolve-users-error';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';

interface EditUserPageProps {
  userId: string;
}

export function EditUserPage({ userId }: EditUserPageProps) {
  const router = useRouter();
  const userQuery = useUser(userId);

  const dict = useDictionary();
  const { form: t, validation, errors } = dict.users;

  const schema = useMemo(() => updateUserSchema(validation), [validation]);

  const values = useMemo(
    () =>
      userQuery.data
        ? {
            name: userQuery.data.name ?? '',
            company: userQuery.data.company ?? '',
          }
        : undefined,
    [userQuery.data],
  );

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(schema),
    values,
  });

  const updateUserMutation = useUpdateUser();

  const onSubmit = handleSubmit((formValues) => {
    updateUserMutation.mutate(
      { id: userId, input: formValues },
      { onSuccess: () => router.push('/users') },
    );
  });

  const errorMessage = userQuery.isError
    ? resolveUsersErrorMessage(userQuery.error, errors, 'updateUserFailed')
    : updateUserMutation.isError
      ? resolveUsersErrorMessage(
          updateUserMutation.error,
          errors,
          'updateUserFailed',
        )
      : undefined;

  if (!userQuery.data) {
    return (
      <>
        <h1 className="text-xl font-semibold text-gray-900">
          {dict.users.editPage.title}
        </h1>
        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <UserForm
        title={dict.users.editPage.title}
        submitLabel={dict.users.editPage.submitLabel}
        nameLabel={t.nameLabel}
        companyLabel={t.companyLabel}
        emailLabel={t.emailLabel}
        nameInputProps={register('name')}
        companyInputProps={register('company')}
        emailInputProps={{
          disabled: true,
          defaultValue: userQuery.data.email,
        }}
        nameError={formErrors.name?.message}
        companyError={formErrors.company?.message}
        error={errorMessage}
        isLoading={updateUserMutation.isPending}
        onSubmit={onSubmit}
      />

      <UserMemberships userId={userId} />
    </>
  );
}
