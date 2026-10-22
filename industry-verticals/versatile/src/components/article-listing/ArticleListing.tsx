import { JSX } from 'react';
import { NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, itemImage, itemText, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const items = fields?.items ?? [];
  return (
    <Frame params={params} label="Article listing">
      <Text
        tag="h2"
        field={fields?.Title}
        className="font-[family-name:var(--brand-font-heading)] text-4xl"
      />
      <div className="mt-8 divide-y divide-[color-mix(in_srgb,var(--brand-foreground)_12%,transparent)]">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url || '#'}
            className="v-result grid items-center gap-6 md:grid-cols-[160px_1fr]"
          >
            <NextImage
              field={itemImage(item, 'Image')}
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
            <div>
              <Text
                tag="h3"
                field={itemText(item, 'Title')}
                className="font-[family-name:var(--brand-font-heading)] text-2xl"
              />
              <Text
                tag="p"
                field={itemText(item, 'ShortDescription') ?? itemText(item, 'Summary')}
                className="mt-2"
              />
            </div>
          </a>
        ))}
      </div>
    </Frame>
  );
};
