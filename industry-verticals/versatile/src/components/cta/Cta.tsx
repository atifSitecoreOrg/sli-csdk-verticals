import { JSX } from 'react';
import { Link, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, linkField, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Cta">
    <div className="rounded-2xl bg-[var(--brand-primary)] px-8 py-10 text-[var(--brand-background)]">
      <Text tag="h2" field={fields?.Title} className="font-[family-name:var(--brand-font-heading)] text-3xl" />
      <Text tag="p" field={fields?.Summary} className="mt-3" />
      <Link field={linkField(fields?.Link)} className="v-underline mt-6 inline-block" />
    </div>
  </Frame>
);
