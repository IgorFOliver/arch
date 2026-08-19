import { ComponentProps, ReactNode } from 'react';

import { Button } from '@ui/atoms/Button/Button';
import { Checkbox, CheckboxProps } from '@ui/atoms/Checkbox/Checkbox';
import { FormField } from '@ui/molecules/FormField/FormField';
import { Input, InputProps } from '@ui/atoms/Input/Input';

export interface SignupFormProps {
  logo?: ReactNode;
  title: string;

  nameLabel: string;
  companyLabel: string;
  emailLabel: string;
  passwordLabel: string;
  agreeToTermsLabel: string;

  nameError?: string;
  companyError?: string;
  emailError?: string;
  passwordError?: string;
  agreeToTermsError?: string;
  error?: string;

  nameInputProps?: Omit<InputProps, 'error'>;
  companyInputProps?: Omit<InputProps, 'error'>;
  emailInputProps?: Omit<InputProps, 'error'>;
  passwordInputProps?: Omit<InputProps, 'error'>;
  agreeToTermsInputProps?: Omit<CheckboxProps, 'error' | 'label'>;

  onSubmit?: ComponentProps<'form'>['onSubmit'];

  isLoading?: boolean;
  submitLabel: string;

  className?: string;
}

export function SignupForm({
  logo,
  title,
  nameLabel,
  companyLabel,
  emailLabel,
  passwordLabel,
  agreeToTermsLabel,
  nameError,
  companyError,
  emailError,
  passwordError,
  agreeToTermsError,
  error,
  nameInputProps,
  companyInputProps,
  emailInputProps,
  passwordInputProps,
  agreeToTermsInputProps,
  onSubmit,
  isLoading = false,
  submitLabel,
  className,
}: SignupFormProps) {
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
          htmlFor="signup-name"
          error={nameError}
          required
        >
          <Input
            id="signup-name"
            type="text"
            autoComplete="name"
            fullWidth
            {...nameInputProps}
            error={Boolean(nameError)}
          />
        </FormField>

        <FormField
          label={companyLabel}
          htmlFor="signup-company"
          error={companyError}
        >
          <Input
            id="signup-company"
            type="text"
            autoComplete="organization"
            fullWidth
            {...companyInputProps}
            error={Boolean(companyError)}
          />
        </FormField>

        <FormField
          label={emailLabel}
          htmlFor="signup-email"
          error={emailError}
          required
        >
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            fullWidth
            {...emailInputProps}
            error={Boolean(emailError)}
          />
        </FormField>

        <FormField
          label={passwordLabel}
          htmlFor="signup-password"
          error={passwordError}
          required
        >
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            fullWidth
            {...passwordInputProps}
            error={Boolean(passwordError)}
          />
        </FormField>

        <Checkbox
          id="signup-agree-to-terms"
          label={agreeToTermsLabel}
          error={agreeToTermsError}
          {...agreeToTermsInputProps}
        />
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
}
