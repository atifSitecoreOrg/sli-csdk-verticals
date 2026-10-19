'use client';
import { HTMLAttributes } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';
import { SearchItemFields } from './index';

type SearchItemTitleProps = {
  text: SearchItemFields['title'];
} & HTMLAttributes<HTMLHeadingElement>;

export const SearchItemTitle = ({ className, text, ...props }: SearchItemTitleProps) => {
  return (
    text && (
      <h3 className={cn('mb-2 line-clamp-2 text-xl font-bold lg:text-2xl', className)} {...props}>
        <Text field={text} />
      </h3>
    )
  );
};
