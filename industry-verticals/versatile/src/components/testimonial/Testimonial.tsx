import { JSX } from 'react';
import { NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Testimonial">
    <blockquote className="flex items-center gap-6">
      <NextImage field={fields?.Image} className="h-16 w-16 rounded-full" />
      <div>
        <Text tag="p" field={fields?.Summary} className="text-lg" />
        <Text tag="footer" field={fields?.Title} className="mt-2 text-sm" />
      </div>
    </blockquote>
  </Frame>
);
