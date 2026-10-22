import { JSX } from 'react';
import { Field, Link, LinkField, Text } from '@sitecore-content-sdk/nextjs';
import { Frame, itemLink, itemText, linkField, LinkedItem, VersatileProps } from '@/lib/versatile';

type IconNode = LinkedItem & {
  iconName?: { jsonValue?: Field<string> };
  link?: { jsonValue?: LinkField };
};

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const queried = (
    fields as { data?: { datasource?: { children?: { results?: IconNode[] } } } } | undefined
  )?.data?.datasource?.children?.results;
  const items = queried?.length ? queried : ((fields?.Links ?? []) as IconNode[]);
  return (
    <Frame params={params} label="Icon links">
      <Text
        tag="h2"
        field={fields?.Title}
        className="font-[family-name:var(--brand-font-heading)] text-3xl"
      />
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.id ?? index} className="v-card-editorial p-5">
            <Text
              tag="p"
              field={item.iconName?.jsonValue ?? itemText(item, 'iconName')}
              className="v-eyebrow"
            />
            <Text
              tag="h3"
              field={itemText(item, 'title') ?? itemText(item, 'Title')}
              className="mt-2 text-xl"
            />
            <Link
              field={linkField(item.link?.jsonValue ?? itemLink(item, 'link'))}
              className="v-underline mt-3 inline-block"
            />
          </li>
        ))}
      </ul>
    </Frame>
  );
};
