'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { MembershipForm } from './MembershipForm';
import { Role } from '@4basearch/domain-types';

import {
  createMembershipSchema,
  CreateMembershipFormValues,
} from '@/features/memberships/schema';
import { useCreateMembership } from '@/features/memberships/hooks/use-create-membership';
import { resolveMembershipsErrorMessage } from '@/features/memberships/resolve-memberships-error';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';

export function NewMembershipPage() {
  const router = useRouter();

  const dict = useDictionary();
  const { form: t, validation, errors } = dict.memberships;

  const roleOptions = useMemo(
    () =>
      Object.entries(dict.shell.roles)
        .filter(([value]) => value !== 'PLATFORM_ADMIN')
        .map(([value, label]) => ({ value, label })),
    [dict.shell.roles],
  );

  const schema = useMemo(
    () => createMembershipSchema(validation),
    [validation],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors: formErrors },
  } = useForm<CreateMembershipFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: Role.USER },
  });

  const createMembershipMutation = useCreateMembership();

  const onSubmit = handleSubmit((values) => {
    createMembershipMutation.mutate(values, {
      onSuccess: () => router.push('/memberships'),
    });
  });

  const errorMessage = createMembershipMutation.isError
    ? resolveMembershipsErrorMessage(
        createMembershipMutation.error,
        errors,
        'createMembershipFailed',
      )
    : undefined;

  return (
    <Controller
      name="role"
      control={control}
      render={({ field }) => (
        <MembershipForm
          title={dict.memberships.createPage.title}
          submitLabel={dict.memberships.createPage.submitLabel}
          emailLabel={t.emailLabel}
          roleLabel={t.roleLabel}
          roleOptions={roleOptions}
          role={field.value}
          onRoleChange={field.onChange}
          emailInputProps={register('email')}
          emailError={formErrors.email?.message}
          error={errorMessage}
          isLoading={createMembershipMutation.isPending}
          onSubmit={onSubmit}
        />
      )}
    />
  );
}
