'use client';
import { useTranslations } from './useTranslations';
import { DICTIONARY_KEYS } from './constants';

export const SearchError = ({ onTryAgain, error }: { onTryAgain: () => void; error: Error }) => {
  const t = useTranslations();

  return (
    <div className="bg-background-secondary dark:bg-background-secondary-dark shadow-soft mb-8 rounded-lg px-6 py-16 text-center">
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
          d="M12 9v2m0 4h.01M5.07 19h13.86A2 2 0 0021 17.15L13.93 4.85a2 2 0 00-3.86 0L3 17.15A2 2 0 005.07 19z"
        />
      </svg>
      <p className="font-heading mt-4 text-2xl font-bold">
        {t(DICTIONARY_KEYS.SOMETHING_WENT_WRONG) || 'Something went wrong'}
      </p>
      <p className="mt-2 text-lg">{error.message}</p>
      <div className="mt-8">
        <button type="button" onClick={onTryAgain} className="btn">
          {t(DICTIONARY_KEYS.TRY_AGAIN) || 'Try again'}
        </button>
      </div>
    </div>
  );
};
