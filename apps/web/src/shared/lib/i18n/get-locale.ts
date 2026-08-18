import 'server-only';
import { cookies, headers } from 'next/headers';
import { LOCALE_COOKIE, defaultLocale, isLocale, type Locale } from './config';

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const headerList = await headers();
  const acceptLanguage = headerList.get('accept-language');
  const preferred = acceptLanguage?.split(',')[0]?.split('-')[0]?.trim();
  if (preferred && isLocale(preferred)) {
    return preferred;
  }

  return defaultLocale;
}
