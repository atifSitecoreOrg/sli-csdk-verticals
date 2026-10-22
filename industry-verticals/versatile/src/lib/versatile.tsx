import { JSX, ReactNode } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  RichTextField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export type VersatileFields = {
  Title?: Field<string>;
  Subtitle?: Field<string>;
  Summary?: Field<string>;
  Body?: RichTextField;
  Text?: RichTextField;
  Tags?: Field<string>;
  Image?: ImageField;
  Link?: LinkField;
  Logo?: ImageField;
  LogoAlt?: Field<string>;
  Primary?: Field<string>;
  Secondary?: Field<string>;
  Accent?: Field<string>;
  Background?: Field<string>;
  Foreground?: Field<string>;
  HeadingFont?: Field<string>;
  BodyFont?: Field<string>;
};

export type VersatileProps = ComponentProps & {
  fields?: VersatileFields;
};

export function linkField(field?: LinkField): LinkField {
  return field ?? { value: { href: '' } };
}

export function useEditing() {
  const { page } = useSitecore();
  return page.mode.isEditing;
}

function raw(field?: Field<string>) {
  return typeof field?.value === 'string' ? field.value : '';
}

function token(value: string, kind: 'color' | 'font') {
  if (kind === 'color' && /^#[0-9a-fA-F]{3,8}$/.test(value)) return value;
  if (kind === 'font' && /^[A-Za-z0-9 ,'-]{1,80}$/.test(value)) return value;
  return '';
}

export function BrandStyle({ fields }: { fields?: VersatileFields }) {
  const pairs = [
    ['--brand-primary', token(raw(fields?.Primary), 'color')],
    ['--brand-secondary', token(raw(fields?.Secondary), 'color')],
    ['--brand-accent', token(raw(fields?.Accent), 'color')],
    ['--brand-background', token(raw(fields?.Background), 'color')],
    ['--brand-foreground', token(raw(fields?.Foreground), 'color')],
    ['--brand-font-heading', token(raw(fields?.HeadingFont), 'font')],
    ['--brand-font-body', token(raw(fields?.BodyFont), 'font')],
  ].filter(([, value]) => value);
  if (!pairs.length) return null;
  const css = `:root{${pairs.map(([name, value]) => `${name}:${value};`).join('')}}`;
  return <style>{css}</style>;
}

export function Frame({
  params,
  children,
  label,
}: {
  params: ComponentProps['params'];
  children: ReactNode;
  label: string;
}): JSX.Element {
  const editing = useEditing();
  return (
    <section className={`component ${params.styles ?? ''}`} id={params.RenderingIdentifier}>
      <div className={`mx-auto max-w-6xl px-6 py-12 ${editing ? '' : 'v-rise'}`}>{children}</div>
      {!children && editing ? <span className="is-empty-hint">{label}</span> : null}
    </section>
  );
}
