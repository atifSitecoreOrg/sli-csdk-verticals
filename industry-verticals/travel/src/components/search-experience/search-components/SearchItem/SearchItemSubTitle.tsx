'use client';
import { HTMLAttributes } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';
import { SearchItemFields } from './index';

type SearchItemTitleProps = {
  text: SearchItemFields['subTitle'];
} & HTMLAttributes<HTMLHeadingElement>;

export const SearchItemSubTitle = ({ className, text, ...props }: SearchItemTitleProps) => {
  return (
    text && (
      <h3
        className={cn('mb-3 line-clamp-2 text-base font-light text-gray-900', className)}
        {...props}
      >
        <Text field={text} />
      </h3>
    )
  );
};
