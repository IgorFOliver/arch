import { ComponentProps, ReactNode } from 'react';

import { Button } from '../../atoms/Button/Button';
import { FormField } from '../../molecules/FormField/FormField';
import { Input, InputProps } from '../../atoms/Input/Input';

export interface LoginFormProps {
  logo?: ReactNode;
  title: string;

  emailLabel: string;
  passwordLabel: string;

  emailError?: string;
  passwordError?: string;
  error?: string;

  emailInputProps?: Omit<InputProps, 'error'>;
  passwordInputProps?: Omit<InputProps, 'error'>;

  onSubmit?: ComponentProps<'form'>['onSubmit'];

  isLoading?: boolean;
  submitLabel: string;

  className?: string;
}

export function LoginForm({
  logo,
  title,
  emailLabel,
  passwordLabel,
  emailError,
  passwordError,
  error,
  emailInputProps,
  passwordInputProps,
  onSubmit,
  isLoading = false,
  submitLabel,
  className,
}: LoginFormProps) {
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
          label={emailLabel}
          htmlFor="login-email"
          error={emailError}
          required
        >
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            fullWidth
            {...emailInputProps}
            error={Boolean(emailError)}
          />
        </FormField>

        <FormField
          label={passwordLabel}
          htmlFor="login-password"
          error={passwordError}
          required
        >
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            fullWidth
            {...passwordInputProps}
            error={Boolean(passwordError)}
          />
        </FormField>
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
}
