'use client';
import { useTranslations } from './useTranslations';
import { DICTIONARY_KEYS } from './constants';

export const SearchEmptyResults = ({
  query,
  canClear = Boolean(query),
  onClearSearch,
}: {
  query: string;
  canClear?: boolean;
  onClearSearch: () => void;
}) => {
  const t = useTranslations();

  return (
    <div className="bg-background-secondary dark:bg-background-secondary-dark shadow-soft rounded-lg px-6 py-16 text-center">
      <svg
        className="text-accent mx-auto h-10 w-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <p className="font-heading mt-4 text-2xl font-bold">
        {t(DICTIONARY_KEYS.NO_RESULTS_FOUND) || 'No results found'}
      </p>
      <p className="mt-2 text-lg">
        {t(DICTIONARY_KEYS.TRY_ADJUSTING_YOUR_SEARCH) || 'Try adjusting your search or clear it.'}
      </p>
      {canClear && (
        <div className="mt-8">
          <button type="button" onClick={onClearSearch} className="btn">
            {t(DICTIONARY_KEYS.CLEAR_SEARCH) || 'Clear search'}
          </button>
        </div>
      )}
    </div>
  );
};
