'use client';
import { HTMLAttributes } from 'react';
import { Text, TextField } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';
import { SearchItemFields } from './index';

type SearchItemTagsProps = {
  tags: SearchItemFields['tags'];
} & HTMLAttributes<HTMLDivElement>;

const tagClassName =
  'bg-background-tertiary text-foreground dark:bg-background-tertiary-dark dark:text-foreground-dark rounded-full px-3 py-1 text-sm';

export const SearchItemTags = ({ className, tags, ...props }: SearchItemTagsProps) => {
  return (
    tags && (
      <div className={cn('mb-4 flex flex-wrap gap-2', className)} {...props}>
        {Array.isArray(tags.value) ? (
          tags.value.map((tag, index) => (
            <span key={index} className={tagClassName}>
              {tag}
            </span>
          ))
        ) : (
          <Text field={tags as TextField} tag="span" className={tagClassName} />
        )}
      </div>
    )
  );
};
