'use client';
import { HTMLAttributes } from 'react';
import { cn } from 'lib/utils';
import { ItemCardFrame, ItemListFrame, SearchItemVariant } from './SearchItemCommon';
import { SearchFieldsMapping } from './models';

type SearchSkeletonItemProps = {
  mapping: SearchFieldsMapping;
  variant?: SearchItemVariant;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Renders a skeleton item in Editing
 */
export const SearchSkeletonItem = ({ mapping, variant = 'card' }: SearchSkeletonItemProps) => {
  const isCard = variant === 'card';

  const fields = (
    <>
      {mapping.type && <SearchItemCategorySkeleton />}
      {mapping.title && <SearchItemTitleSkeleton />}
      {mapping.description && <SearchItemSummarySkeleton />}
      {mapping.link && <SearchItemLinkSkeleton />}
    </>
  );

  return isCard ? <ItemCardFrame>{fields}</ItemCardFrame> : <ItemListFrame>{fields}</ItemListFrame>;
};

const SearchItemTitleSkeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('mb-3 h-6 w-3/4 animate-pulse rounded bg-gray-200', className)} {...props} />
  );
};

const SearchItemSummarySkeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('mb-4 space-y-2', className)} {...props}>
      <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
    </div>
  );
};

const SearchItemLinkSkeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('h-5 w-24 animate-pulse rounded bg-gray-200', className)} {...props} />;
};

const SearchItemCategorySkeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('mb-3 h-6 w-1/4 animate-pulse rounded bg-gray-200', className)} {...props} />
  );
};
