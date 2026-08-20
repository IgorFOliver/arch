import { ComponentProps, ReactNode } from 'react';

import { Button, FormField, Input, InputProps } from '@4basearch/ui';

export interface ResetPasswordFormProps {
  logo?: ReactNode;
  title: string;

  passwordLabel: string;
  confirmPasswordLabel: string;

  passwordError?: string;
  confirmPasswordError?: string;
  error?: string;

  passwordInputProps?: Omit<InputProps, 'error'>;
  confirmPasswordInputProps?: Omit<InputProps, 'error'>;

  onSubmit?: ComponentProps<'form'>['onSubmit'];

  isLoading?: boolean;
  submitLabel: string;

  className?: string;
}

export function ResetPasswordForm({
  logo,
  title,
  passwordLabel,
  confirmPasswordLabel,
  passwordError,
  confirmPasswordError,
  error,
  passwordInputProps,
  confirmPasswordInputProps,
  onSubmit,
  isLoading = false,
  submitLabel,
  className,
}: ResetPasswordFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={`w-full max-w-md space-y-6 ${className ?? ''}`}
    >
      <div className="space-y-3 text-center">
        {logo && <div className="flex justify-center">{logo}</div>}

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
          label={passwordLabel}
          htmlFor="reset-password-password"
          error={passwordError}
          required
        >
          <Input
            id="reset-password-password"
            type="password"
            autoComplete="new-password"
            fullWidth
            {...passwordInputProps}
            error={Boolean(passwordError)}
          />
        </FormField>

        <FormField
          label={confirmPasswordLabel}
          htmlFor="reset-password-confirm-password"
          error={confirmPasswordError}
          required
        >
          <Input
            id="reset-password-confirm-password"
            type="password"
            autoComplete="new-password"
            fullWidth
            {...confirmPasswordInputProps}
            error={Boolean(confirmPasswordError)}
          />
        </FormField>
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
}
