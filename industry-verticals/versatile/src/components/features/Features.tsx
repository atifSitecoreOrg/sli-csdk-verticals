import { JSX } from 'react';
import { Field, ImageField, Link, LinkField, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import {
  Frame,
  itemImage,
  itemLink,
  itemText,
  linkField,
  LinkedItem,
  VersatileProps,
} from '@/lib/versatile';

type FeatureNode = LinkedItem & {
  featureTitle?: { jsonValue?: Field<string> };
  featureDescription?: { jsonValue?: Field<string> };
  featureLink?: { jsonValue?: LinkField };
  featureImage?: { jsonValue?: ImageField };
};

function nodes(fields: VersatileProps['fields']): FeatureNode[] {
  const queried = (
    fields as { data?: { datasource?: { children?: { results?: FeatureNode[] } } } } | undefined
  )?.data?.datasource?.children?.results;
  if (queried?.length) return queried;
  return fields?.Features ?? [];
}

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const items = nodes(fields);
  return (
    <Frame params={params} label="Features">
      <Text
        tag="h2"
        field={fields?.Title}
        className="max-w-xl font-[family-name:var(--brand-font-heading)] text-4xl"
      />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((item, index) => {
          const title = item.featureTitle?.jsonValue ?? itemText(item, 'featureTitle');
          const description =
            item.featureDescription?.jsonValue ?? itemText(item, 'featureDescription');
          const link = item.featureLink?.jsonValue ?? itemLink(item, 'featureLink');
          const image = item.featureImage?.jsonValue ?? itemImage(item, 'featureImage');
          return (
            <article key={item.id ?? index} className="v-card-editorial p-6">
              <NextImage field={image} className="mb-4 h-12 w-12 object-contain" />
              <Text
                tag="h3"
                field={title}
                className="font-[family-name:var(--brand-font-heading)] text-2xl"
              />
              <Text tag="p" field={description} className="mt-3" />
              <Link field={linkField(link)} className="v-underline mt-4 inline-block" />
            </article>
          );
        })}
      </div>
    </Frame>
  );
};
