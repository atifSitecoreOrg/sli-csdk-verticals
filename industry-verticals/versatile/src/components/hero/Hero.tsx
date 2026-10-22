import { JSX } from 'react';
import { Link, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, linkField, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Hero">
    <div className="grid items-center gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <Text tag="p" field={fields?.Subtitle} className="text-sm tracking-wide" />
        <Text tag="h1" field={fields?.Title} className="font-[family-name:var(--brand-font-heading)] text-4xl" />
        <Link field={linkField(fields?.Link)} className="v-underline inline-block" />
      </div>
      <NextImage field={fields?.Image} className="w-full rounded-2xl" />
    </div>
  </Frame>
);
