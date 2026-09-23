'use client';

import { FormEvent, JSX, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from 'next-localization';

type HeaderSearchProps = {
  onClose?: () => void;
};

/**
 * Header search field that submits queries to the native Search Experience page.
 */
export const HeaderSearch = ({ onClose }: HeaderSearchProps): JSX.Element => {
  const router = useRouter();
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = query.trim();

    if (!nextQuery) {
      return;
    }

    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1">
      <input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
        placeholder={t('SearchExperience_SearchInputPlaceholder') || 'Search...'}
        className="focus:ring-accent border-border w-full rounded-md border px-3 py-2 text-base focus:border-transparent focus:ring-2 focus:outline-none sm:px-4 sm:py-3 sm:text-lg"
      />
    </form>
  );
};

export default HeaderSearch;
