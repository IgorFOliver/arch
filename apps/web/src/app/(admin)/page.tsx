import { getDictionary } from '@/shared/lib/i18n/dictionaries';
import { getLocale } from '@/shared/lib/i18n/get-locale';
import { HomePage } from '@/features/home';

export default async function Home() {
  const lang = await getLocale();
  const dict = await getDictionary(lang);

  return <HomePage dict={dict} />;
}
