import { ComponentProps } from 'react';

import { Button, FormField, Input, InputProps } from '@4basearch/ui';

export interface TenantFormProps {
  title: string;

  nameLabel: string;
  slugLabel: string;

  nameError?: string;
  slugError?: string;
  error?: string;

  nameInputProps?: Omit<InputProps, 'error'>;
  slugInputProps?: Omit<InputProps, 'error'>;

  onSubmit?: ComponentProps<'form'>['onSubmit'];

  isLoading?: boolean;
  submitLabel: string;

  className?: string;
}

export function TenantForm({
  title,
  nameLabel,
  slugLabel,
  nameError,
  slugError,
  error,
  nameInputProps,
  slugInputProps,
  onSubmit,
  isLoading = false,
  submitLabel,
  className,
}: TenantFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={`w-full max-w-md space-y-6 ${className ?? ''}`}
    >
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        <FormField
          label={nameLabel}
          htmlFor="tenant-name"
          error={nameError}
          required
        >
          <Input
            id="tenant-name"
            type="text"
            fullWidth
            {...nameInputProps}
            error={Boolean(nameError)}
          />
        </FormField>

        <FormField
          label={slugLabel}
          htmlFor="tenant-slug"
          error={slugError}
          required
        >
          <Input
            id="tenant-slug"
            type="text"
            fullWidth
            {...slugInputProps}
            error={Boolean(slugError)}
          />
        </FormField>
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
}
