'use client';
import { HTMLAttributes, useState } from 'react';
import Image from 'next/image';
import { cn } from 'lib/utils';
import { SearchItemFields } from './index';

type SearchItemImageProps = {
  image: SearchItemFields['image'];
  alt?: string;
} & HTMLAttributes<HTMLDivElement>;

export const SearchItemImage = ({ className, alt, image, ...props }: SearchItemImageProps) => {
  const [brokenImage, setBrokenImage] = useState<boolean>(false);
  const src = typeof image?.value === 'string' ? image.value : '';

  if (!src) {
    return null;
  }

  return (
    <div className={cn('absolute inset-0', className)} {...props}>
      {!brokenImage && (
        <Image
          fill
          src={src}
          alt={alt || ''}
          onError={() => setBrokenImage(true)}
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      )}
    </div>
  );
};
