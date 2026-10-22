import { JSX } from 'react';
import { NextImage, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Article">
    <Text
      tag="h1"
      field={fields?.Title}
      className="max-w-3xl font-[family-name:var(--brand-font-heading)] text-5xl"
    />
    <Text tag="p" field={fields?.Summary} className="mt-4 max-w-2xl text-lg" />
    <NextImage
      field={fields?.Image}
      className="mt-8 aspect-[16/8] w-full rounded-3xl object-cover"
    />
    <RichText field={fields?.Body} className="mt-8 max-w-3xl leading-8" />
  </Frame>
);
