import { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { Frame, itemText, useEditing, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const editing = useEditing();
  const offers = fields?.Offers ?? [];
  return (
    <Frame params={params} label="Offers">
      <Text
        tag="h2"
        field={fields?.Title}
        className="font-[family-name:var(--brand-font-heading)] text-3xl"
      />
      <ul className="mt-6 flex flex-wrap gap-3">
        {offers.map((offer) => (
          <li key={offer.id} className="v-card-editorial px-5 py-3 text-sm">
            <Text field={itemText(offer, 'OfferText')} />
          </li>
        ))}
      </ul>
      {editing && offers.length === 0 ? <span className="is-empty-hint">Offers</span> : null}
    </Frame>
  );
};
