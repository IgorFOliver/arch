import { ComponentProps, ReactNode } from 'react';

import { Button } from '@ui/atoms/Button/Button';
import { FormField } from '@ui/molecules/FormField/FormField';
import { Input, InputProps } from '@ui/atoms/Input/Input';

export interface ForgotPasswordFormProps {
  logo?: ReactNode;
  title: string;
  description?: string;

  emailLabel: string;
  emailError?: string;
  error?: string;
  successMessage?: string;

  emailInputProps?: Omit<InputProps, 'error'>;

  onSubmit?: ComponentProps<'form'>['onSubmit'];

  isLoading?: boolean;
  submitLabel: string;

  className?: string;
}

export function ForgotPasswordForm({
  logo,
  title,
  description,
  emailLabel,
  emailError,
  error,
  successMessage,
  emailInputProps,
  onSubmit,
  isLoading = false,
  submitLabel,
  className,
}: ForgotPasswordFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={`w-full max-w-md space-y-6 ${className ?? ''}`}
    >
      <div className="space-y-3 text-center">
        {logo && <div className="flex justify-center">{logo}</div>}

        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>

        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {!successMessage && (
        <>
          <FormField
            label={emailLabel}
            htmlFor="forgot-password-email"
            error={emailError}
            required
          >
            <Input
              id="forgot-password-email"
              type="email"
              autoComplete="email"
              fullWidth
              {...emailInputProps}
              error={Boolean(emailError)}
            />
          </FormField>

          <Button type="submit" fullWidth isLoading={isLoading}>
            {submitLabel}
          </Button>
        </>
      )}
    </form>
  );
}
