'use client';
import { HTMLAttributes } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

type SearchItemCategoryProps = {
  category: { value: string } | undefined;
} & HTMLAttributes<HTMLDivElement>;

export const SearchItemCategory = ({ category, className, ...props }: SearchItemCategoryProps) => {
  return (
    category && (
      <div className={cn('mb-4 flex flex-wrap gap-2', className)} {...props}>
        <Text
          field={category}
          tag="span"
          className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
        />
      </div>
    )
  );
};
