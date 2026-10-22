import { JSX } from 'react';
import { Link, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { linkField, useEditing, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const editing = useEditing();
  return (
    <article className={`component card ${params.styles ?? ''}`} id={params.RenderingIdentifier}>
      <div className={`v-card-editorial m-4 ${editing ? '' : 'v-card'}`}>
        <NextImage field={fields?.Image} className="aspect-[4/3] w-full object-cover" />
        <div className="p-5">
          <Text
            tag="h3"
            field={fields?.Title}
            className="font-[family-name:var(--brand-font-heading)] text-2xl"
          />
          <Text tag="p" field={fields?.Summary} className="mt-2" />
          <Link field={linkField(fields?.Link)} className="v-underline mt-4 inline-block" />
        </div>
      </div>
    </article>
  );
};
