import { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { Frame, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Listing">
    <Text
      tag="h2"
      field={fields?.Title}
      className="font-[family-name:var(--brand-font-heading)] text-4xl"
    />
    <Text tag="p" field={fields?.Summary} className="mt-4 max-w-2xl text-lg" />
  </Frame>
);
