import { JSX } from 'react';
import { NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Media">
    <Text tag="h2" field={fields?.Title} className="mb-4 font-[family-name:var(--brand-font-heading)] text-3xl" />
    <NextImage field={fields?.Image} className="w-full rounded-2xl" />
  </Frame>
);
