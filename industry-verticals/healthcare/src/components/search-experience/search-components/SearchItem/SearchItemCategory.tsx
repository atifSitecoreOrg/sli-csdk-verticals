'use client';
import { HTMLAttributes } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

type SearchItemCategoryProps = {
  category: { value: string } | undefined;
} & HTMLAttributes<HTMLParagraphElement>;

export const SearchItemCategory = ({ category, className, ...props }: SearchItemCategoryProps) => {
  return (
    category && (
      <p className={cn('text-accent mb-4 text-lg lg:text-xl', className)} {...props}>
        <Text field={category} />
      </p>
    )
  );
};
