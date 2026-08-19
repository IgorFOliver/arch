import { ComponentProps } from 'react';

import { Button } from '@ui/atoms/Button/Button';
import { FormField } from '@ui/molecules/FormField/FormField';
import { Input, InputProps } from '@ui/atoms/Input/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/molecules/Select/Select';

export interface MembershipFormRoleOption {
  value: string;
  label: string;
}

export interface MembershipFormProps {
  title: string;

  emailLabel: string;
  roleLabel: string;

  emailError?: string;
  roleError?: string;
  error?: string;

  emailInputProps?: Omit<InputProps, 'error'>;

  roleOptions: MembershipFormRoleOption[];
  role?: string;
  onRoleChange?: (role: string) => void;

  onSubmit?: ComponentProps<'form'>['onSubmit'];

  isLoading?: boolean;
  submitLabel: string;

  className?: string;
}

export function MembershipForm({
  title,
  emailLabel,
  roleLabel,
  emailError,
  roleError,
  error,
  emailInputProps,
  roleOptions,
  role,
  onRoleChange,
  onSubmit,
  isLoading = false,
  submitLabel,
  className,
}: MembershipFormProps) {
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
          label={emailLabel}
          htmlFor="membership-email"
          error={emailError}
          required
        >
          <Input
            id="membership-email"
            type="email"
            autoComplete="email"
            fullWidth
            {...emailInputProps}
            error={Boolean(emailError)}
          />
        </FormField>

        <FormField
          label={roleLabel}
          htmlFor="membership-role"
          error={roleError}
          required
        >
          <Select value={role} onValueChange={onRoleChange}>
            <SelectTrigger id="membership-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
}
