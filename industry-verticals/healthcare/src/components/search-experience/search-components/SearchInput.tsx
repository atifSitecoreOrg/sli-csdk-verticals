'use client';
import { useTranslations } from './useTranslations';
import { DICTIONARY_KEYS } from './constants';

interface SearchInputProps {
  value: string;
  onChange: (query: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  const t = useTranslations();
  const placeholder = t(DICTIONARY_KEYS.SEARCH_INPUT_PLACEHOLDER) || 'Search by name or specialty';

  return (
    <div className="relative">
      <input
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background dark:bg-background-tertiary-dark focus:ring-accent w-full rounded-lg py-4 pr-12 pl-14 text-lg shadow-md focus:ring-2 focus:outline-none"
      />
      <svg
        className="text-accent absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
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
          className="text-foreground hover:text-accent focus:text-accent dark:text-foreground-dark absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 transition-colors focus:outline-none"
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
  );
};
