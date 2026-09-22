'use client';
import { HTMLAttributes } from 'react';
import { useTranslations } from '../useTranslations';
import { Link } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';
import { SearchItemFields } from './index';
import { DICTIONARY_KEYS } from '../constants';

type SearchItemLinkProps = {
  link: SearchItemFields['title'];
  onClick: () => void;
} & HTMLAttributes<HTMLAnchorElement>;

export const SearchItemLink = ({ className, link, onClick, ...props }: SearchItemLinkProps) => {
  const t = useTranslations();

  return (
    link && (
      <Link
        field={{ href: link.value }}
        className={cn(
          'text-primary hover:text-primary-hover inline-flex items-center font-medium',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {t(DICTIONARY_KEYS.READ_MORE) || 'Read More'}
        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    )
  );
};
