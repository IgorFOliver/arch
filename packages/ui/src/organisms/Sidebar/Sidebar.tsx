'use client';

import {
  ComponentType,
  ElementType,
  Fragment,
  ReactNode,
  useState,
} from 'react';
import { ChevronDown, Settings } from 'lucide-react';
import * as CollapsiblePrimitive from 'radix-ui/collapsible';
import { cn } from '../../lib/cn';
import { Avatar, AvatarFallback, AvatarImage } from '../../atoms/Avatar/Avatar';
import { Badge } from '../../atoms/Badge/Badge';

export interface SidebarMenuItemData {
  label: string;
  href?: string;
  icon?: ComponentType<{ className?: string }>;
  badge?: string;
  items?: SidebarMenuItemData[];
}

export interface SidebarSectionData {
  label: string;
  items: SidebarMenuItemData[];
}

export interface SidebarUser {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface SidebarProps {
  user?: SidebarUser;
  sections: SidebarSectionData[];
  activeHref?: string;
  onSettingsClick?: () => void;
  settingsLabel?: string;
  className?: string;
  /**
   * Router-agnostic on purpose — this component has no dependency on
   * Next.js. Defaults to a plain `<a>` (a full page reload on every
   * click); pass your router's Link component (e.g. `next/link`'s
   * `Link`) to get client-side navigation instead.
   */
  LinkComponent?: ElementType<{
    href: string;
    className?: string;
    children?: ReactNode;
  }>;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function MenuRow({
  icon: Icon,
  label,
  badge,
  active,
  expandable,
  expanded,
  children,
}: {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  active?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-red-50 text-red-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <Badge variant="danger" className="text-[10px]">
          {badge}
        </Badge>
      )}
      {expandable && (
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-gray-400 transition-transform',
            expanded && 'rotate-180',
          )}
        />
      )}
      {children}
    </div>
  );
}

function SidebarMenuItem({
  item,
  activeHref,
  LinkComponent = 'a',
}: {
  item: SidebarMenuItemData;
  activeHref?: string;
  LinkComponent?: SidebarProps['LinkComponent'];
}) {
  const [open, setOpen] = useState(false);
  const hasSubmenu = Boolean(item.items?.length);
  const isActive =
    !hasSubmenu && item.href !== undefined && item.href === activeHref;
  const Link = LinkComponent ?? 'a';

  if (!hasSubmenu) {
    return (
      <Link href={item.href ?? '#'}>
        <MenuRow
          icon={item.icon}
          label={item.label}
          badge={item.badge}
          active={isActive}
        />
      </Link>
    );
  }

  return (
    <CollapsiblePrimitive.Root open={open} onOpenChange={setOpen}>
      <CollapsiblePrimitive.Trigger asChild>
        <button type="button" className="w-full">
          <MenuRow
            icon={item.icon}
            label={item.label}
            expandable
            expanded={open}
          />
        </button>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content>
        <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-gray-200 pl-4">
          {item.items?.map((subItem) => (
            <Link
              key={subItem.label}
              href={subItem.href ?? '#'}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-colors',
                subItem.href === activeHref
                  ? 'text-red-700 font-medium'
                  : 'text-gray-500 hover:text-gray-900',
              )}
            >
              {subItem.label}
            </Link>
          ))}
        </div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}

export function Sidebar({
  user,
  sections,
  activeHref,
  onSettingsClick,
  settingsLabel,
  className,
  LinkComponent,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r border-gray-200 bg-white',
        className,
      )}
    >
      {user && (
        <div className="flex items-center gap-3 border-b border-gray-200 p-4">
          <Avatar>
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-gray-500">{user.role}</p>
          </div>
          {onSettingsClick && (
            <button
              type="button"
              onClick={onSettingsClick}
              aria-label={settingsLabel}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {sections.map((section) => (
          <Fragment key={section.label}>
            <div>
              <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-gray-600 uppercase">
                {section.label}
              </p>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <SidebarMenuItem
                    key={item.label}
                    item={item}
                    activeHref={activeHref}
                    LinkComponent={LinkComponent}
                  />
                ))}
              </div>
            </div>
          </Fragment>
        ))}
      </nav>
    </aside>
  );
}
