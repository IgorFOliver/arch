import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const baseClasses = [
  "inline-flex",
  "items-center",
  "justify-center",
  "gap-2",
  "rounded-lg",
  "border",
  "font-medium",
  "transition-colors",
  "duration-200",
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-offset-2",
  "disabled:pointer-events-none",
];

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "border-transparent",
    "bg-blue-600",
    "text-white",
    "hover:bg-blue-700",
    "active:bg-blue-800",
    "focus-visible:ring-blue-500",
  ].join(" "),

  secondary: [
    "border-gray-300",
    "bg-gray-100",
    "text-gray-800",
    "hover:bg-gray-200",
    "active:bg-gray-300",
    "focus-visible:ring-gray-500",
  ].join(" "),

  outline: [
    "border-blue-600",
    "bg-transparent",
    "text-blue-600",
    "hover:bg-blue-50",
    "active:bg-blue-100",
    "focus-visible:ring-blue-500",
  ].join(" "),

  ghost: [
    "border-transparent",
    "bg-transparent",
    "text-gray-700",
    "hover:bg-gray-100",
    "active:bg-gray-200",
    "focus-visible:ring-gray-500",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />

    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled = false,
      children,
      className,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          isDisabled && "cursor-not-allowed opacity-60",
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}

            <span>{children}</span>

            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
