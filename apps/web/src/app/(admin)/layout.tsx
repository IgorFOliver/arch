import { ReactNode } from 'react';
import { getLocale } from '@/shared/lib/i18n/get-locale';
import { AdminShell } from '@/features/admin';

export default async function AdminRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const lang = await getLocale();

  return <AdminShell lang={lang}>{children}</AdminShell>;
}
