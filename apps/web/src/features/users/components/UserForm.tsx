import { ComponentProps, ReactNode } from 'react';

import { Button, FormField, Input, InputProps } from '@4basearch/ui';

export interface UserFormProps {
  logo?: ReactNode;
  title: string;

  nameLabel: string;
  companyLabel: string;
  emailLabel: string;
  passwordLabel?: string;

  nameError?: string;
  companyError?: string;
  emailError?: string;
  passwordError?: string;
  error?: string;

  nameInputProps?: Omit<InputProps, 'error'>;
  companyInputProps?: Omit<InputProps, 'error'>;
  emailInputProps?: Omit<InputProps, 'error'>;
  passwordInputProps?: Omit<InputProps, 'error'>;

  onSubmit?: ComponentProps<'form'>['onSubmit'];

  isLoading?: boolean;
  submitLabel: string;

  className?: string;
}

export function UserForm({
  logo,
  title,
  nameLabel,
  companyLabel,
  emailLabel,
  passwordLabel,
  nameError,
  companyError,
  emailError,
  passwordError,
  error,
  nameInputProps,
  companyInputProps,
  emailInputProps,
  passwordInputProps,
  onSubmit,
  isLoading = false,
  submitLabel,
  className,
}: UserFormProps) {
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
          label={nameLabel}
          htmlFor="user-name"
          error={nameError}
          required
        >
          <Input
            id="user-name"
            type="text"
            autoComplete="name"
            fullWidth
            {...nameInputProps}
            error={Boolean(nameError)}
          />
        </FormField>

        <FormField
          label={companyLabel}
          htmlFor="user-company"
          error={companyError}
        >
          <Input
            id="user-company"
            type="text"
            autoComplete="organization"
            fullWidth
            {...companyInputProps}
            error={Boolean(companyError)}
          />
        </FormField>

        <FormField
          label={emailLabel}
          htmlFor="user-email"
          error={emailError}
          required
        >
          <Input
            id="user-email"
            type="email"
            autoComplete="email"
            fullWidth
            {...emailInputProps}
            error={Boolean(emailError)}
          />
        </FormField>

        {passwordLabel && (
          <FormField
            label={passwordLabel}
            htmlFor="user-password"
            error={passwordError}
            required
          >
            <Input
              id="user-password"
              type="password"
              autoComplete="new-password"
              fullWidth
              {...passwordInputProps}
              error={Boolean(passwordError)}
            />
          </FormField>
        )}
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
}
