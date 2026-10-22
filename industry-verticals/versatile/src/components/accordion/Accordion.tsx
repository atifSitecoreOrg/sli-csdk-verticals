import { JSX } from 'react';
import { RichText, Text } from '@sitecore-content-sdk/nextjs';
import { useEditing, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const editing = useEditing();
  return (
    <section className={`component accordion ${params.styles ?? ''}`} id={params.RenderingIdentifier}>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <details className="v-accordion" open={editing}>
          <summary>
            <Text tag="span" field={fields?.Title} />
          </summary>
          <RichText field={fields?.Body} />
        </details>
      </div>
    </section>
  );
};
