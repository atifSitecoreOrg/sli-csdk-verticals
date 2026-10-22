import { JSX } from 'react';
import { Link, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { linkField, useEditing, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const editing = useEditing();
  return (
    <section className={`component promo ${params.styles ?? ''}`} id={params.RenderingIdentifier}>
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-12 md:grid-cols-2">
        <NextImage field={fields?.Image} className="w-full rounded-2xl" />
        <div className={editing ? '' : 'v-rise'}>
          <Text tag="h2" field={fields?.Title} className="font-[family-name:var(--brand-font-heading)] text-3xl" />
          <Text tag="p" field={fields?.Summary} className="mt-3" />
          <Link field={linkField(fields?.Link)} className="v-underline mt-6 inline-block" />
        </div>
      </div>
    </section>
  );
};
