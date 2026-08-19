'use client';

import { Bell, Check, Globe, LogOut } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Badge } from '../../atoms/Badge/Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../molecules/DropdownMenu/DropdownMenu';

export type Language = string;

export interface LanguageOption {
  code: Language;
  label: string;
}

export interface TopbarProps {
  variant?: 'light' | 'dark';
  language?: Language;
  languages: LanguageOption[];
  onLanguageChange?: (language: Language) => void;
  notificationsLabel: string;
  languageSwitcherLabel: string;
  logoutLabel: string;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  onLogout?: () => void;
  className?: string;
}

const iconButtonVariants = {
  light: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
  dark: 'text-white/70 hover:bg-white/10 hover:text-white',
};

export function Topbar({
  variant = 'light',
  language,
  languages,
  onLanguageChange,
  notificationsLabel,
  languageSwitcherLabel,
  logoutLabel,
  notificationCount = 0,
  onNotificationsClick,
  onLogout,
  className,
}: TopbarProps) {
  const iconButtonClasses = cn(
    'relative rounded-full p-2 transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
    iconButtonVariants[variant],
  );

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-end gap-1 px-6',
        variant === 'light' && 'border-b border-gray-200 bg-white',
        className,
      )}
    >
      <button
        type="button"
        onClick={onNotificationsClick}
        aria-label={notificationsLabel}
        className={iconButtonClasses}
      >
        <Bell className="h-5 w-5" />
        {notificationCount > 0 && (
          <Badge
            variant="danger"
            className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px]"
          >
            {notificationCount}
          </Badge>
        )}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={languageSwitcherLabel}
            className={iconButtonClasses}
          >
            <Globe className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map(({ code, label }) => (
            <DropdownMenuItem
              key={code}
              onSelect={() => onLanguageChange?.(code)}
            >
              <span className="flex flex-1 items-center justify-between">
                {label}
                {language === code && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        onClick={onLogout}
        aria-label={logoutLabel}
        className={cn(iconButtonClasses, 'hover:text-red-600')}
      >
        <LogOut className="h-5 w-5" />
      </button>
    </header>
  );
}
