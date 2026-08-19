'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { TenantForm } from './TenantForm';

import { useTenant } from '@/features/tenants/hooks/use-tenant';
import {
  updateTenantSchema,
  UpdateTenantFormValues,
} from '@/features/tenants/schema';
import { useUpdateTenant } from '@/features/tenants/hooks/use-update-tenant';
import { resolveTenantsErrorMessage } from '@/features/tenants/resolve-tenants-error';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';

interface EditTenantPageProps {
  tenantId: string;
}

export function EditTenantPage({ tenantId }: EditTenantPageProps) {
  const router = useRouter();
  const tenantQuery = useTenant(tenantId);

  const dict = useDictionary();
  const { form: t, validation, errors } = dict.tenants;

  const schema = useMemo(() => updateTenantSchema(validation), [validation]);

  const values = useMemo(
    () => (tenantQuery.data ? { name: tenantQuery.data.name } : undefined),
    [tenantQuery.data],
  );

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<UpdateTenantFormValues>({
    resolver: zodResolver(schema),
    values,
  });

  const updateTenantMutation = useUpdateTenant();

  const onSubmit = handleSubmit((values) => {
    updateTenantMutation.mutate(
      { id: tenantId, input: values },
      { onSuccess: () => router.push('/tenants') },
    );
  });

  const errorMessage = tenantQuery.isError
    ? resolveTenantsErrorMessage(
        tenantQuery.error,
        errors,
        'updateTenantFailed',
      )
    : updateTenantMutation.isError
      ? resolveTenantsErrorMessage(
          updateTenantMutation.error,
          errors,
          'updateTenantFailed',
        )
      : undefined;

  if (!tenantQuery.data) {
    return (
      <>
        <h1 className="text-xl font-semibold text-gray-900">
          {dict.tenants.editPage.title}
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
    <TenantForm
      title={dict.tenants.editPage.title}
      submitLabel={dict.tenants.editPage.submitLabel}
      nameLabel={t.nameLabel}
      slugLabel={t.slugLabel}
      nameInputProps={register('name')}
      slugInputProps={{ disabled: true, defaultValue: tenantQuery.data.slug }}
      nameError={formErrors.name?.message}
      error={errorMessage}
      isLoading={updateTenantMutation.isPending}
      onSubmit={onSubmit}
    />
  );
}
