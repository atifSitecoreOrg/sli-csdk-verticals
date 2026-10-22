import { JSX } from 'react';
import { NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { itemText, useEditing, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const editing = useEditing();
  const links = fields?.PrimaryNavigation ?? [];

  return (
    <footer
      className={`component footer border-t border-[color-mix(in_srgb,var(--brand-foreground)_12%,transparent)] bg-[var(--brand-primary)] text-[var(--brand-background)] ${params.styles ?? ''}`}
      id={params.RenderingIdentifier}
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <NextImage field={fields?.Logo} className="h-8 w-auto" />
          <Text tag="p" field={fields?.LogoAlt} className="mt-4 max-w-sm text-sm opacity-80" />
        </div>
        <div>
          <p className="v-eyebrow text-[var(--brand-background)]">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            {links.map((item) => (
              <li key={item.id ?? item.url}>
                <a href={item.url || '#'}>{itemText(item, 'Title')?.value || item.displayName}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>{editing ? <span className="is-empty-hint">Footer</span> : null}</div>
      </div>
    </footer>
  );
};
