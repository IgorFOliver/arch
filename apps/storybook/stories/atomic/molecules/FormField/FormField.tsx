import { ReactNode } from "react";
import clsx from "clsx";

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  helperText,
  required = false,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {error ? (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}
