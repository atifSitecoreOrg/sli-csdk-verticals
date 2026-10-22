import { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <nav aria-label="Breadcrumb" className={`component breadcrumb ${params.styles ?? ''}`} id={params.RenderingIdentifier}>
    <ol className="mx-auto flex max-w-6xl gap-2 px-6 py-3 text-sm">
      <li>Home</li>
      <li>
        <Text tag="span" field={fields?.Title} />
      </li>
    </ol>
  </nav>
);
