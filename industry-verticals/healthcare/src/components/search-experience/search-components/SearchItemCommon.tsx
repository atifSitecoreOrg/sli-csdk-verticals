'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from 'lib/utils';

export type SearchItemVariant = 'card' | 'list';

type ItemFrameProps = HTMLAttributes<HTMLDivElement> & {
  image?: ReactNode;
  href?: string;
  label?: string;
  onNavigate?: () => void;
};

const frameClassName =
  'bg-background-secondary dark:bg-background-secondary-dark shadow-soft focus-visible:ring-accent flex h-full overflow-hidden rounded-lg transition-shadow outline-none hover:shadow-lg focus-visible:ring-2';

const ItemFrame = ({
  className,
  href,
  label,
  onNavigate,
  children,
}: {
  className?: string;
  href?: string;
  label?: string;
  onNavigate?: () => void;
  children: ReactNode;
}) => {
  if (!href) {
    return <div className={className}>{children}</div>;
  }

  if (href.startsWith('http')) {
    return (
      <a href={href} onClick={onNavigate} aria-label={label} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onNavigate} aria-label={label} className={className}>
      {children}
    </Link>
  );
};

/**
 * Horizontal doctor row: portrait beside the name, specialty, and biography.
 */
export const ItemListFrame = ({
  className,
  children,
  image,
  href,
  label,
  onNavigate,
}: ItemFrameProps) => {
  return (
    <ItemFrame
      href={href}
      label={label}
      onNavigate={onNavigate}
      className={cn(frameClassName, 'flex-col md:min-h-64 md:flex-row', className)}
    >
      {image && (
        <div className="placeholder-pattern-background relative aspect-square w-full shrink-0 md:aspect-auto md:w-64">
          {image}
        </div>
      )}
      <div className="flex flex-1 flex-col justify-center p-7 md:p-10">{children}</div>
    </ItemFrame>
  );
};

/**
 * Physician card: square photo, then centered name and specialty.
 */
export const ItemCardFrame = ({
  className,
  children,
  image,
  href,
  label,
  onNavigate,
}: ItemFrameProps) => {
  return (
    <ItemFrame
      href={href}
      label={label}
      onNavigate={onNavigate}
      className={cn(frameClassName, 'flex-col', className)}
    >
      {image && (
        <div className="placeholder-pattern-background relative aspect-square w-full">{image}</div>
      )}
      <div className="flex flex-1 flex-col p-7 text-center">{children}</div>
    </ItemFrame>
  );
};
