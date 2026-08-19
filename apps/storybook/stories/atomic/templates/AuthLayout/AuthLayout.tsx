import { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <main className={cn('relative min-h-screen bg-gray-50', className)}>
      <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950" />

      <div className="relative flex min-h-screen flex-col items-center px-4 pb-16">
        <div className="mt-24 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl sm:mt-32">
          {children}
        </div>
      </div>
    </main>
  );
}
