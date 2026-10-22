import { JSX } from 'react';
import { NextImage, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Person">
    <div className="grid items-start gap-10 md:grid-cols-[280px_1fr]">
      <NextImage field={fields?.Image} className="aspect-[3/4] w-full rounded-3xl object-cover" />
      <div>
        <Text tag="p" field={fields?.Tags} className="v-eyebrow" />
        <Text
          tag="h1"
          field={fields?.Title}
          className="mt-3 font-[family-name:var(--brand-font-heading)] text-5xl"
        />
        <Text tag="p" field={fields?.Summary} className="mt-4 text-lg" />
        <RichText field={fields?.Body} className="mt-6 max-w-2xl leading-8" />
      </div>
    </div>
  </Frame>
);
