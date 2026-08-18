import type { Dictionary } from '@/shared/lib/i18n/dictionaries';

interface HomePageProps {
  dict: Dictionary;
}

export function HomePage({ dict }: HomePageProps) {
  return (
    <h1 className="text-xl font-semibold text-gray-900">{dict.home.title}</h1>
  );
}
