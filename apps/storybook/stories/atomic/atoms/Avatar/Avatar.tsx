import * as AvatarPrimitive from 'radix-ui/avatar';
import { cn } from '../../lib/cn';

export function Avatar({ className, ...props }: AvatarPrimitive.AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200',
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage({
  className,
  ...props
}: AvatarPrimitive.AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      className={cn('h-full w-full object-cover', className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        'flex h-full w-full items-center justify-center text-sm font-medium text-gray-600',
        className,
      )}
      {...props}
    />
  );
}
