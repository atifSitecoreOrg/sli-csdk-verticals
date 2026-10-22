import { JSX } from 'react';
import { Link, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, linkField, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Video">
    <Text tag="h2" field={fields?.Title} className="mb-4 font-[family-name:var(--brand-font-heading)] text-3xl" />
    <Link field={linkField(fields?.Link)} />
  </Frame>
);
