'use client';
import { HTMLAttributes } from 'react';
import { useTranslations } from '../useTranslations';
import { cn } from 'lib/utils';
import { DICTIONARY_KEYS } from '../constants';

type SearchItemLinkProps = HTMLAttributes<HTMLSpanElement>;

export const SearchItemLink = ({ className, ...props }: SearchItemLinkProps) => {
  const t = useTranslations();

  return (
    <span
      className={cn(
        'text-accent mt-auto inline-flex items-center gap-1 pt-6 font-semibold',
        className
      )}
      {...props}
    >
      {t(DICTIONARY_KEYS.VIEW_PROFILE) || 'View profile'}
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </span>
  );
};
