import { JSX } from 'react';
import { Link, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { linkField, useEditing, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const editing = useEditing();
  return (
    <section
      className={`component hero v-hero ${params.styles ?? ''}`}
      id={params.RenderingIdentifier}
    >
      <div
        className={`mx-auto grid max-w-6xl items-end gap-10 px-6 py-20 md:grid-cols-[1.4fr_0.8fr] md:py-28 ${editing ? '' : 'v-rise'}`}
      >
        <div className="space-y-6">
          <Text tag="p" field={fields?.Subtitle} className="v-eyebrow" />
          <Text tag="h1" field={fields?.Title} className="v-display" />
          <div className="flex flex-wrap gap-3">
            <Link field={linkField(fields?.Link)} className="v-btn" />
          </div>
        </div>
        <NextImage field={fields?.Image} className="aspect-[4/5] w-full rounded-3xl object-cover" />
      </div>
    </section>
  );
};
