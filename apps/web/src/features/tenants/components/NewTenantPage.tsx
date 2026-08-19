'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { TenantForm } from '@4basearch/ui';

import {
  createTenantSchema,
  CreateTenantFormValues,
} from '@/features/tenants/schema';
import { useCreateTenant } from '@/features/tenants/hooks/use-create-tenant';
import { resolveTenantsErrorMessage } from '@/features/tenants/resolve-tenants-error';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';

export function NewTenantPage() {
  const router = useRouter();

  const dict = useDictionary();
  const { form: t, validation, errors } = dict.tenants;

  const schema = useMemo(() => createTenantSchema(validation), [validation]);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<CreateTenantFormValues>({
    resolver: zodResolver(schema),
  });

  const createTenantMutation = useCreateTenant();

  const onSubmit = handleSubmit((values) => {
    createTenantMutation.mutate(values, {
      onSuccess: () => router.push('/tenants'),
    });
  });

  const errorMessage = createTenantMutation.isError
    ? resolveTenantsErrorMessage(
        createTenantMutation.error,
        errors,
        'createTenantFailed',
      )
    : undefined;

  return (
    <TenantForm
      title={dict.tenants.createPage.title}
      submitLabel={dict.tenants.createPage.submitLabel}
      nameLabel={t.nameLabel}
      slugLabel={t.slugLabel}
      nameInputProps={register('name')}
      slugInputProps={register('slug')}
      nameError={formErrors.name?.message}
      slugError={formErrors.slug?.message}
      error={errorMessage}
      isLoading={createTenantMutation.isPending}
      onSubmit={onSubmit}
    />
  );
}
