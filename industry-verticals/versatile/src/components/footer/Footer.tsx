import { JSX } from 'react';
import { NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { useEditing, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const editing = useEditing();
  return (
    <footer className={`component footer ${params.styles ?? ''}`} id={params.RenderingIdentifier}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-8">
        <NextImage field={fields?.Logo} className="h-8 w-auto" />
        <Text tag="p" field={fields?.LogoAlt} />
        {editing ? <span className="is-empty-hint">Footer</span> : null}
      </div>
    </footer>
  );
};
