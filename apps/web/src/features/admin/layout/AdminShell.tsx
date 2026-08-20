'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

import { AdminLayout } from '@4basearch/ui';

import { useSession, useLogout } from '@/features/auth';
import { useLocaleSwitcher } from '@/shared/hooks/use-locale-switcher';
import { locales, type Locale } from '@/shared/lib/i18n/config';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';
import { createSidebarSections } from '@/features/admin/navigation/create-sidebar-sections';
import { findAdminRoute } from '@/features/admin/navigation/find-admin-route';
import { isAdminNavigationItemVisible } from '@/features/admin/navigation/admin-navigation';

interface AdminShellProps {
  lang: Locale;
  children: ReactNode;
}

export function AdminShell({ lang, children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const dict = useDictionary();

  const { user, isAuthenticated, isLoading } = useSession();
  const logoutMutation = useLogout();
  const switchLocale = useLocaleSwitcher();

  const route = findAdminRoute(pathname);
  const isAuthorized = Boolean(
    user &&
    route &&
    isAdminNavigationItemVisible(route.scope, user.role, user.isPlatformAdmin),
  );

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!isAuthorized) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, isAuthorized, router]);

  if (isLoading || !isAuthenticated || !isAuthorized || !user) {
    return null;
  }

  const sections = createSidebarSections(
    dict.shell,
    user.role,
    user.isPlatformAdmin,
  );
  // Platform Scope wins the label when both apply; a user with neither
  // (authenticated, zero Memberships, not a Platform Admin) gets no
  // role label at all rather than being mislabeled "Platform Admin".
  const roleLabel = user.isPlatformAdmin
    ? dict.shell.roles.PLATFORM_ADMIN
    : user.role
      ? dict.shell.roles[user.role]
      : '';

  const languages = locales.map((code) => ({
    code,
    label: dict.common.languageNames[code],
  }));

  return (
    <AdminLayout
      sidebarProps={{
        user: {
          name: user.name ?? user.email,
          role: roleLabel,
        },
        sections,
        activeHref: route?.href,
        // Client-side navigation — without this, Sidebar falls back to a
        // plain <a>, and every menu click does a full page reload (which
        // also tears down SessionProvider's cache, refetching /auth/session
        // every single time).
        LinkComponent: Link,
      }}
      topbarProps={{
        language: lang,
        languages,
        onLanguageChange: (code) => switchLocale(code as Locale),
        notificationsLabel: dict.shell.topbar.notifications,
        languageSwitcherLabel: dict.shell.topbar.changeLanguage,
        logoutLabel: dict.shell.topbar.logOut,
        notificationCount: 0,
        onLogout: () => logoutMutation.mutate(),
      }}
    >
      {children}
    </AdminLayout>
  );
}
