import { JSX } from 'react';
import { NextImage, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Article">
    <Text tag="h1" field={fields?.Title} className="font-[family-name:var(--brand-font-heading)] text-4xl" />
    <Text tag="p" field={fields?.Summary} className="mt-3 text-lg" />
    <NextImage field={fields?.Image} className="mt-6 w-full rounded-2xl" />
    <RichText field={fields?.Body} className="mt-6" />
  </Frame>
);
