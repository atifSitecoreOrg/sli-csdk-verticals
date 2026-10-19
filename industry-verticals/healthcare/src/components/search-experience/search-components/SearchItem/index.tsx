'use client';
import { HTMLAttributes, useMemo } from 'react';
import { Field } from '@sitecore-content-sdk/nextjs';
import { ItemCardFrame, ItemListFrame, SearchItemVariant } from '../SearchItemCommon';
import { SearchDocument, SearchFieldsMapping } from '../models';
import { SearchItemTitle } from './SearchItemTitle';
import { SearchItemSummary } from './SearchItemSummary';
import { SearchItemLink } from './SearchItemLink';
import { SearchItemCategory } from './SearchItemCategory';
import { SearchItemTags } from './SearchItemTags';
import { SearchItemImage } from './SearchItemImage';

export type SearchItemFields = {
  summary?: Field<string>;
  subTitle?: Field<string>;
  category?: Field<string>;
  title?: Field<string>;
  tags?: Field<string[] | string>;
  link?: Field<string>;
  image?: Field<string>;
};

type SearchItemProps = {
  data: SearchDocument;
  mapping: SearchFieldsMapping;
  variant?: SearchItemVariant;
  onClick: () => void;
} & HTMLAttributes<HTMLDivElement>;

const toPlainText = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

/**
 * The doctor index does not return scUrl. Profile routes follow the Doctors item name.
 */
const profilePath = (name?: string) => {
  if (!name?.trim()) return undefined;
  return `/Doctors/${name.trim().replace(/\s+/g, '-')}`;
};

const getField = (
  fields: SearchDocument,
  key?: string
): { value: string | string[] } | undefined => {
  if (!key) return undefined;
  const value = fields[key];
  if (value == null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    return { value: value as string[] };
  }
  return { value };
};

export const SearchItem = ({ data, mapping, variant = 'card', onClick }: SearchItemProps) => {
  const isCard = variant === 'card';

  const fields = useMemo((): SearchItemFields => {
    const title = mapping.title ? (getField(data, mapping.title) as { value: string }) : undefined;
    return {
      title,
      image: mapping.images ? (getField(data, mapping.images) as { value: string }) : undefined,
      tags: mapping.tags
        ? (getField(data, mapping.tags) as { value: string | string[] })
        : undefined,
      summary: mapping.description
        ? (() => {
            const summary = getField(data, mapping.description) as { value: string } | undefined;
            return summary ? { ...summary, value: toPlainText(summary.value) } : undefined;
          })()
        : undefined,
      category: mapping.type ? (getField(data, mapping.type) as { value: string }) : undefined,
      link: (getField(data, mapping.link) ||
        getField(data, 'scUrl') ||
        getField(data, 'scPath')) as { value: string } | undefined,
    };
  }, [data, mapping]);

  const indexedHref = typeof fields.link?.value === 'string' ? fields.link.value : '';
  const href = indexedHref || profilePath(fields.title?.value);
  const imageSrc = typeof fields.image?.value === 'string' ? fields.image.value : '';
  const image = imageSrc ? (
    <SearchItemImage image={fields.image} alt={fields.title?.value} />
  ) : undefined;
  const components = (
    <>
      {fields.title && <SearchItemTitle text={fields.title} />}
      {fields.category && (
        <SearchItemCategory category={fields.category} className="line-clamp-2" />
      )}
      {fields.tags && (
        <SearchItemTags tags={fields.tags} className={isCard ? 'justify-center' : undefined} />
      )}
      {fields.summary && <SearchItemSummary summary={fields.summary} />}
      {href && <SearchItemLink className={isCard ? 'justify-center' : 'justify-start'} />}
    </>
  );

  return isCard ? (
    <ItemCardFrame image={image} href={href} label={fields.title?.value} onNavigate={onClick}>
      {components}
    </ItemCardFrame>
  ) : (
    <ItemListFrame image={image} href={href} label={fields.title?.value} onNavigate={onClick}>
      {components}
    </ItemListFrame>
  );
};
