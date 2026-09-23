'use client';
import { useTranslations } from './useTranslations';
import { DICTIONARY_KEYS } from './constants';

interface SearchInputProps {
  value: string;
  onChange: (query: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  const t = useTranslations();

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder={t(DICTIONARY_KEYS.SEARCH_INPUT_PLACEHOLDER) || 'Search items...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-12 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <svg
          className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600 focus:text-gray-600 focus:outline-none"
            aria-label="Clear search"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="h-full w-full">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
