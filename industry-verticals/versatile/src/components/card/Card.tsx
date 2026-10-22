import { JSX } from 'react';
import { Link, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { linkField, useEditing, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const editing = useEditing();
  return (
    <article className={`component card ${params.styles ?? ''}`} id={params.RenderingIdentifier}>
      <div className={`m-4 rounded-2xl bg-[var(--brand-background)] p-4 ${editing ? '' : 'v-card'}`}>
        <NextImage field={fields?.Image} className="mb-4 w-full rounded-xl" />
        <Text tag="h3" field={fields?.Title} className="font-[family-name:var(--brand-font-heading)] text-2xl" />
        <Text tag="p" field={fields?.Summary} className="mt-2" />
        <Link field={linkField(fields?.Link)} className="v-underline mt-4 inline-block" />
      </div>
    </article>
  );
};
