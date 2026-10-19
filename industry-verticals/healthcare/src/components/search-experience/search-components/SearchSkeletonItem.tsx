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
  const image = mapping.images ? (
    <div className="bg-background-tertiary/70 dark:bg-background-dark/40 absolute inset-0 animate-pulse" />
  ) : undefined;

  const fields = (
    <>
      {mapping.title && <SearchItemTitleSkeleton centered={isCard} />}
      {mapping.type && <SearchItemCategorySkeleton centered={isCard} />}
      {mapping.description && <SearchItemSummarySkeleton />}
      {mapping.link && <SearchItemLinkSkeleton centered={isCard} />}
    </>
  );

  return isCard ? (
    <ItemCardFrame image={image}>{fields}</ItemCardFrame>
  ) : (
    <ItemListFrame image={image}>{fields}</ItemListFrame>
  );
};

const SearchItemTitleSkeleton = ({
  className,
  centered,
  ...props
}: HTMLAttributes<HTMLDivElement> & { centered?: boolean }) => {
  return (
    <div
      className={cn(
        'bg-background-tertiary/80 mb-3 h-7 w-3/4 animate-pulse rounded',
        centered && 'mx-auto',
        className
      )}
      {...props}
    />
  );
};

const SearchItemSummarySkeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('mb-4 space-y-2', className)} {...props}>
      <div className="bg-background-tertiary/70 h-4 w-full animate-pulse rounded" />
      <div className="bg-background-tertiary/70 h-4 w-5/6 animate-pulse rounded" />
    </div>
  );
};

const SearchItemLinkSkeleton = ({
  className,
  centered,
  ...props
}: HTMLAttributes<HTMLDivElement> & { centered?: boolean }) => {
  return (
    <div
      className={cn(
        'bg-background-tertiary/80 mt-auto h-5 w-28 animate-pulse rounded pt-6',
        centered && 'mx-auto',
        className
      )}
      {...props}
    />
  );
};

const SearchItemCategorySkeleton = ({
  className,
  centered,
  ...props
}: HTMLAttributes<HTMLDivElement> & { centered?: boolean }) => {
  return (
    <div
      className={cn(
        'bg-accent/50 mb-4 h-6 w-1/2 animate-pulse rounded',
        centered && 'mx-auto',
        className
      )}
      {...props}
    />
  );
};
