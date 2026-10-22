import { JSX } from 'react';
import { Link, NextImage, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, linkField, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Detail">
    <Text tag="p" field={fields?.Tags} className="v-eyebrow" />
    <Text tag="h1" field={fields?.Title} className="v-display mt-3" />
    <Text tag="p" field={fields?.Summary} className="mt-6 max-w-2xl text-lg" />
    <NextImage
      field={fields?.Image}
      className="mt-8 aspect-[16/8] w-full rounded-3xl object-cover"
    />
    <RichText field={fields?.Body} className="mt-8 max-w-3xl text-lg leading-8" />
    <Link field={linkField(fields?.Link)} className="v-btn mt-8" />
  </Frame>
);
