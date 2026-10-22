import { JSX } from 'react';
import { Link, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, linkField, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Cta">
    <div className="rounded-3xl bg-[var(--brand-primary)] px-8 py-14 text-[var(--brand-background)] md:px-14">
      <Text
        tag="h2"
        field={fields?.Title}
        className="font-[family-name:var(--brand-font-heading)] text-4xl"
      />
      <Text tag="p" field={fields?.Summary} className="mt-4 max-w-xl opacity-80" />
      <Link
        field={linkField(fields?.Link)}
        className="v-btn mt-8 bg-[var(--brand-background)] text-[var(--brand-primary)]"
      />
    </div>
  </Frame>
);
