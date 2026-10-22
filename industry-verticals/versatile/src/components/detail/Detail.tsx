import { JSX } from 'react';
import { Link, NextImage, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, linkField, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Detail">
    <Text tag="h1" field={fields?.Title} className="font-[family-name:var(--brand-font-heading)] text-4xl" />
    <Text tag="p" field={fields?.Tags} className="mt-2 text-sm" />
    <NextImage field={fields?.Image} className="mt-6 w-full rounded-2xl" />
    <Text tag="p" field={fields?.Summary} className="mt-4 text-lg" />
    <RichText field={fields?.Body} className="mt-4" />
    <Link field={linkField(fields?.Link)} className="v-underline mt-6 inline-block" />
  </Frame>
);
