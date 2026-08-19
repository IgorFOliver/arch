'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { MembershipForm } from './MembershipForm';

import { useMembership } from '@/features/memberships/hooks/use-membership';
import {
  updateMembershipSchema,
  UpdateMembershipFormValues,
} from '@/features/memberships/schema';
import { useUpdateMembership } from '@/features/memberships/hooks/use-update-membership';
import { resolveMembershipsErrorMessage } from '@/features/memberships/resolve-memberships-error';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';

interface EditMembershipPageProps {
  membershipId: string;
}

export function EditMembershipPage({ membershipId }: EditMembershipPageProps) {
  const router = useRouter();
  const membershipQuery = useMembership(membershipId);

  const dict = useDictionary();
  const { form: t, errors } = dict.memberships;

  const roleOptions = useMemo(
    () =>
      Object.entries(dict.shell.roles)
        .filter(([value]) => value !== 'PLATFORM_ADMIN')
        .map(([value, label]) => ({ value, label })),
    [dict.shell.roles],
  );

  const schema = useMemo(() => updateMembershipSchema(), []);

  const values = useMemo(
    () =>
      membershipQuery.data ? { role: membershipQuery.data.role } : undefined,
    [membershipQuery.data],
  );

  const { handleSubmit, control } = useForm<UpdateMembershipFormValues>({
    resolver: zodResolver(schema),
    values,
  });

  const updateMembershipMutation = useUpdateMembership();

  const onSubmit = handleSubmit((values) => {
    updateMembershipMutation.mutate(
      { id: membershipId, input: values },
      { onSuccess: () => router.push('/memberships') },
    );
  });

  const errorMessage = membershipQuery.isError
    ? resolveMembershipsErrorMessage(
        membershipQuery.error,
        errors,
        'updateMembershipFailed',
      )
    : updateMembershipMutation.isError
      ? resolveMembershipsErrorMessage(
          updateMembershipMutation.error,
          errors,
          'updateMembershipFailed',
        )
      : undefined;

  if (!membershipQuery.data) {
    return (
      <>
        <h1 className="text-xl font-semibold text-gray-900">
          {dict.memberships.editPage.title}
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
    // defaultValue seeds the field on its very first mount — Controller
    // mounts only once membershipQuery.data resolves, so without it the
    // Select briefly renders with an undefined value and gets stuck
    // showing nothing even after the RHF value updates.
    <Controller
      name="role"
      control={control}
      defaultValue={membershipQuery.data.role}
      render={({ field }) => (
        <MembershipForm
          title={dict.memberships.editPage.title}
          submitLabel={dict.memberships.editPage.submitLabel}
          emailLabel={t.emailLabel}
          roleLabel={t.roleLabel}
          roleOptions={roleOptions}
          role={field.value}
          onRoleChange={field.onChange}
          emailInputProps={{
            disabled: true,
            defaultValue: membershipQuery.data.userEmail,
          }}
          error={errorMessage}
          isLoading={updateMembershipMutation.isPending}
          onSubmit={onSubmit}
        />
      )}
    />
  );
}
