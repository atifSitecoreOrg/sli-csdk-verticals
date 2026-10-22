import { JSX } from 'react';
import { NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, itemImage, itemText, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const items = fields?.Destinations ?? [];
  return (
    <Frame params={params} label="Selected items">
      <Text
        tag="h2"
        field={fields?.Title}
        className="font-[family-name:var(--brand-font-heading)] text-4xl"
      />
      <Text tag="p" field={fields?.Description} className="mt-3 max-w-2xl" />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <a key={item.id} href={item.url || '#'} className="v-card-editorial block">
            <NextImage
              field={itemImage(item, 'Image')}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="p-5">
              <Text
                tag="p"
                field={itemText(item, 'Label') ?? itemText(item, 'Tags')}
                className="v-eyebrow"
              />
              <Text
                tag="h3"
                field={itemText(item, 'Title')}
                className="mt-2 font-[family-name:var(--brand-font-heading)] text-2xl"
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
