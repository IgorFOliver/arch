'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { UserForm } from '@ui/molecules/UserForm/UserForm';

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

  const roleOptions = useMemo(
    () =>
      Object.entries(dict.shell.roles).map(([value, label]) => ({
        value,
        label,
      })),
    [dict.shell.roles],
  );

  const schema = useMemo(() => updateUserSchema(validation), [validation]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors: formErrors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(schema),
    values: userQuery.data
      ? {
          name: userQuery.data.name ?? '',
          company: userQuery.data.company ?? '',
          role: userQuery.data.role,
        }
      : undefined,
  });

  const updateUserMutation = useUpdateUser();

  const onSubmit = handleSubmit((values) => {
    updateUserMutation.mutate(
      { id: userId, input: values },
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
    <Controller
      name="role"
      control={control}
      render={({ field }) => (
        <UserForm
          title={dict.users.editPage.title}
          submitLabel={dict.users.editPage.submitLabel}
          nameLabel={t.nameLabel}
          companyLabel={t.companyLabel}
          emailLabel={t.emailLabel}
          roleLabel={t.roleLabel}
          roleOptions={roleOptions}
          role={field.value}
          onRoleChange={field.onChange}
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
      )}
    />
  );
}
