import { JSX } from 'react';
import { NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, itemImage, itemText, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const reviews = fields?.Reviews ?? [];
  return (
    <Frame params={params} label="Reviews">
      <Text
        tag="h2"
        field={fields?.Title}
        className="font-[family-name:var(--brand-font-heading)] text-4xl"
      />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {reviews.map((review) => (
          <blockquote key={review.id} className="v-card-editorial p-6">
            <Text tag="p" field={itemText(review, 'Description')} className="text-lg" />
            <footer className="mt-6 flex items-center gap-3">
              <NextImage
                field={itemImage(review, 'Avatar')}
                className="h-10 w-10 rounded-full object-cover"
              />
              <Text
                tag="cite"
                field={itemText(review, 'ReviewerName')}
                className="text-sm not-italic"
              />
            </footer>
          </blockquote>
        ))}
      </div>
    </Frame>
  );
};
