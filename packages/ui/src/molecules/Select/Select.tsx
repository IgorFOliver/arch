import * as SelectPrimitive from 'radix-ui/select';
import { cn } from '../../lib/cn';

// Radix decides controlled vs. uncontrolled the first time it sees `value`
// — once it renders with `value={undefined}` (e.g. while a role hasn't
// loaded from the server yet) it locks into uncontrolled mode and ignores
// every later value update. Coercing to '' keeps it controlled from the
// very first render, no matter when the real value becomes available.
export function Select({ value, ...props }: SelectPrimitive.SelectProps) {
  return <SelectPrimitive.Root value={value ?? ''} {...props} />;
}
export const SelectValue = SelectPrimitive.Value;
export const SelectGroup = SelectPrimitive.Group;

export function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900',
        'hover:border-gray-400',
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
        'data-[placeholder]:text-gray-400',
        'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4 shrink-0 text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 9l4-4 4 4M8 15l4 4 4-4"
          />
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        sideOffset={4}
        className={cn(
          'z-50 min-w-[var(--radix-select-trigger-width)] rounded-lg border border-gray-200 bg-white p-1 shadow-lg',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex cursor-pointer items-center rounded-md py-1.5 pr-8 pl-2 text-sm text-gray-700 outline-none select-none',
        'focus:bg-gray-100 focus:text-gray-900',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4 text-blue-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
