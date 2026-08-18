'use client';

import { useRouter } from 'next/navigation';
import { setCookie } from '@/infrastructure/storage/cookies';
import { LOCALE_COOKIE, type Locale } from '@/shared/lib/i18n/config';

const LOCALE_COOKIE_MAX_AGE_SECONDS = 31536000;

export function useLocaleSwitcher() {
  const router = useRouter();

  return (nextLocale: Locale) => {
    setCookie(LOCALE_COOKIE, nextLocale, LOCALE_COOKIE_MAX_AGE_SECONDS);
    router.refresh();
  };
}
