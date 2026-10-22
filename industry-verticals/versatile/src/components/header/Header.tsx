import { JSX } from 'react';
import { NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { BrandStyle, useEditing, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const editing = useEditing();
  return (
    <div className={`component header ${params.styles ?? ''}`} id={params.RenderingIdentifier}>
      <BrandStyle fields={fields} />
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-5">
        <NextImage field={fields?.Logo} className="h-10 w-auto" />
        <Text tag="span" field={fields?.LogoAlt} className="font-[family-name:var(--brand-font-heading)] text-xl" />
        {editing ? <span className="is-empty-hint">Header</span> : null}
      </div>
    </div>
  );
};
