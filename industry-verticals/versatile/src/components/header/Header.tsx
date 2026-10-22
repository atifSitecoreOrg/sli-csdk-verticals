import { JSX } from 'react';
import { Link, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { BrandStyle, itemText, linkField, useEditing, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => {
  const editing = useEditing();
  const links = fields?.PrimaryNavigation ?? [];

  return (
    <div
      className={`component header v-header border-b border-[color-mix(in_srgb,var(--brand-foreground)_12%,transparent)] bg-[var(--brand-background)] ${params.styles ?? ''}`}
      id={params.RenderingIdentifier}
    >
      <BrandStyle fields={fields} />
      <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
        <NextImage field={fields?.Logo} className="h-10 w-auto" />
        <Text
          tag="span"
          field={fields?.LogoAlt}
          className="font-[family-name:var(--brand-font-heading)] text-xl"
        />
        <nav className="ml-auto hidden items-center gap-6 md:flex" aria-label="Primary">
          {links.map((item) => (
            <a key={item.id ?? item.url} href={item.url || '#'} className="v-underline text-sm">
              {itemText(item, 'Title')?.value || item.displayName || item.name}
            </a>
          ))}
          {(fields?.CtaLink?.value?.href || editing) && (
            <Link field={linkField(fields?.CtaLink)} className="v-btn text-sm" />
          )}
        </nav>
        {editing && links.length === 0 ? <span className="is-empty-hint">Header</span> : null}
      </div>
    </div>
  );
};
