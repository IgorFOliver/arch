import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: boolean;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      error = false,
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={clsx(fullWidth ? 'w-full' : 'w-auto')}>
        <div className="relative">
          {leftIcon && (
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            disabled={disabled}
            aria-invalid={error}
            className={clsx(
              'w-full rounded-lg border bg-white text-gray-900',
              'placeholder:text-gray-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
              sizeClasses[inputSize],

              leftIcon && 'pl-10',
              rightIcon && 'pr-10',

              error
                ? [
                    'border-red-500',
                    'focus:border-red-500',
                    'focus:ring-red-500/20',
                  ]
                : [
                    'border-gray-300',
                    'hover:border-gray-400',
                    'focus:border-blue-500',
                    'focus:ring-blue-500/20',
                  ],

              className,
            )}
            {...props}
          />

          {rightIcon && (
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = 'Input';
