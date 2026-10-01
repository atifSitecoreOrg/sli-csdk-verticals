# TSX pattern (Content SDK / App Router)

Discover project conventions first: `src/lib/component-props`, `.sitecore/component-map.ts`, `.sitecore/component-map.client.ts`, `sitecore.cli.config.ts`.

**`ComponentProps`:** import from `@/lib/component-props`. If the file is missing, create `src/lib/component-props/index.ts` from [component-props/index.ts](component-props/index.ts). Ensure `tsconfig.json` includes `"@/*": ["src/*"]` under `compilerOptions.paths`.

**One file per component (required)**

Each Sitecore rendering maps to **one self-contained TSX file** under `src/components/{namespace}/{ComponentName}.tsx`. That file must include the fields interface, layout function, and all variant exports (`Default`, `Inversed`, `Animated`, `Carousel`, …). The component-map generator discovers components by scanning `src/components/` — the file name becomes the map key.

**Do not** aggregate render logic in a shared barrel (e.g. `lib/all-components.tsx`) and re-export from thin wrappers. Thin one-liner wrappers that only `export const Default = Mod.Default` are forbidden.

**Allowed shared code** (keep minimal):
- `src/lib/component-props` — `ComponentProps` type
- `src/lib/component-utils.ts` — tiny helpers only (e.g. `componentKey()`)
- Project stylesheets imported once in `_app.tsx`

Each component file should be readable on its own: an author opening `Header.tsx` sees the full header markup, placeholders, fields, and variants.

**Global CSS (Pages Router):** do not `import` `.css` from component TSX files. Import shared styles once in `src/pages/_app.tsx` (e.g. `chrome.css`, `sections.css`). Use CSS Modules (`.module.css`) for component-scoped styles when needed.

**Responsive utilities from design (`u-hide-*`):** when mimicking source HTML, copy `u-hide-mobile` / `u-hide-desktop` onto the same nodes as in `section.html`. In the shared stylesheet, define these utilities with `!important` so later component rules (e.g. `.s2c__col__img { display: block }`) cannot override hide/show — full rules and verification in [`sitecore-component-from-design` — visual-fidelity.md](../sitecore-component-from-design/references/visual-fidelity.md#responsive-utility-classes-u-hide-).

**Image fields:** every Image field needs a display mode from [`image-display-modes.md`](../sitecore-component-from-design/references/image-display-modes.md). The parent sets the frame (hero height, column width, card head); CSS enforces `cover` / `contain` / `fill-width` so **any** authored asset matches the screenshot. Optional project helper: `src/lib/field-image.tsx` with `<FieldImage field={…} mode="cover" />`.

**Body fields:** Multi-Line Text datasource values often fail in `<RichText>` — use `FieldBody` from `src/lib/field-content.tsx` or `<Text tag="p">` for plain copy. See [visual-fidelity.md § Multi-Line Text vs Rich Text](../sitecore-component-from-design/references/visual-fidelity.md#multi-line-text-vs-rich-text-body-fields).

**Link fields:** render title, body, and CTA labels even when `href` is empty — wrap in `<SitecoreLink>` only when href is set. See [visual-fidelity.md § Empty or missing link href](../sitecore-component-from-design/references/visual-fidelity.md#empty-or-missing-link-href--still-render-visible-content). Optional helper: `FieldCta` in `field-content.tsx`.

## Example index

| Type | Section below | Placeholders |
|------|---------------|--------------|
| **Card** | [Card component](#card-component) | None — slotted in Section placeholder |
| **Section** | [Section component](#section-component) | Optional child cards |
| **Section + Carousel** | [Section with placeholder](#section-with-placeholder--default-grid--carousel-variant) | Required when children repeat |
| **Header** | [Header component](#header-component) | `header-nav-{*}` (+ optional left/right) |
| **Footer** | [Footer component](#footer-component) | `footer-links-{*}` per column |

---

## Card component

Card components render **inside** a Section `<Placeholder>`. Keep them presentational; the parent Section owns grid/carousel layout.

```tsx
'use client';

import type { JSX } from 'react';
import { Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { FieldImage } from '@/lib/field-image';

export interface TeaserCardFields {
  Title: TextField;
  Description: TextField;
  Image: ImageField;
  Link: LinkField;
}

const defaultFields: TeaserCardFields = {
  Title: { value: 'Card title' },
  Description: { value: 'Card description' },
  Image: { value: { src: '', alt: '' } },
  Link: { value: { href: '/', text: 'Read more' } },
};

export type TeaserCardProps = ComponentProps & {
  fields: TeaserCardFields;
};

function TeaserCardLayout(props: TeaserCardProps, variantClass: string): JSX.Element {
  const { params, fields = defaultFields, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid;

  return (
    <article
      key={componentKey}
      className={`component teaser-card ${variantClass} ${params.styles ?? ''}`.trim()}
      id={params.RenderingIdentifier}
    >
      <FieldImage field={fields.Image} mode="column-cover" />
      <Text tag="h3" field={fields.Title} />
      <Text tag="p" field={fields.Description} />
      <SitecoreLink field={fields.Link} />
    </article>
  );
}

export const Default = (props: TeaserCardProps): JSX.Element => TeaserCardLayout(props, '');
export const Inversed = (props: TeaserCardProps): JSX.Element =>
  TeaserCardLayout(props, 'teaser-card--inversed');
export const ImageTop = (props: TeaserCardProps): JSX.Element =>
  TeaserCardLayout(props, 'teaser-card--image-top');
export const ImageBottom = (props: TeaserCardProps): JSX.Element =>
  TeaserCardLayout(props, 'teaser-card--image-bottom');
export const Animated = (props: TeaserCardProps): JSX.Element =>
  TeaserCardLayout(props, 'teaser-card--default', true);
```

---

## Section component

```tsx
'use client';

import type { JSX } from 'react';
import { Link as SitecoreLink, Placeholder, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { FieldImage } from '@/lib/field-image';

export interface FeatureSectionFields {
  Title: TextField;
  Description: TextField;
  CtaLink: LinkField;
  FeatureImage: ImageField;
}

const defaultFields: FeatureSectionFields = {
  Title: { value: 'Section title' },
  Description: { value: 'Section description' },
  CtaLink: { value: { href: '/', text: 'Learn more' } },
  FeatureImage: { value: { src: '', alt: '' } },
};

export type FeatureSectionProps = ComponentProps & {
  fields: FeatureSectionFields;
};

function FeatureSectionLayout(props: FeatureSectionProps, variantClass: string, reverse: boolean): JSX.Element {
  const { params, fields = defaultFields, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid;
  const phKey = `feature-cards-${params.DynamicPlaceholderId}`;

  return (
    <section
      key={componentKey}
      className={`component feature-section ${variantClass} ${params.styles ?? ''}`.trim()}
      id={params.RenderingIdentifier}
    >
      <div className={`container${reverse ? ' feature-section--reverse' : ''}`}>
        <Text tag="h2" field={fields.Title} />
        <Text tag="p" field={fields.Description} />
        {/* General Link patterns — see visual-fidelity.md § General Link (CTA) fields */}
        <SitecoreLink field={fields.CtaLink} className="btn" />
        <SitecoreLink field={fields.CtaLink} className="btn btn--with-icon" showLinkTextWithChildrenPresent>
          <span className="btn__icon" aria-hidden="true" />
        </SitecoreLink>
        <FieldImage field={fields.FeatureImage} mode="column-cover" />
        <Placeholder name={phKey} rendering={props.rendering} />
      </div>
    </section>
  );
}

export const Default = (props: FeatureSectionProps): JSX.Element =>
  FeatureSectionLayout(props, '', false);

export const Inversed = (props: FeatureSectionProps): JSX.Element =>
  FeatureSectionLayout(props, 'feature-section--inversed', true);

export const Animated = (props: FeatureSectionProps): JSX.Element =>
  FeatureSectionLayout(props, 'feature-section--animated', false);
```

**Rule — variants must look different:** every export must produce a **visibly distinct layout or styling**, not re-export `Default`. Authors pick variants in Pages — identical output defeats the purpose.

Full rules: [component-variants.md](component-variants.md).

| Variant | When to create | Required difference |
|---------|----------------|---------------------|
| `Default` | Always | Baseline layout from design |
| `Inversed` | Only when left ↔ right can mirror (columns, image/text order) | Flip columns, reverse flex, swap media side |
| `ImageTop` / `ImageBottom` | Component has an Image field | Stack media above or below text block |
| `Animated` | **Always** | Viewport-once entrance on inner elements via `src/lib/animate-in.tsx` — not animate.css |
| `Carousel` | Section with `<Placeholder>` that is **not** already a carousel component | Same placeholder children in a slider (`placeholder-carousel.tsx`) |

**Do not** export `InversedAnimated`. Add extra exports only when a screenshot requires a distinct layout beyond the standard variant matrix, and keep naming generic.

**Implementation pattern:** shared `{Component}Layout(props, layoutFlags, animated?)` helper; each export passes **different** layout flags or BEM modifiers. Animated uses `maybeAnimate(animated, 'slide-in-left', delay, node)` per element — different motions, stagger per child, and per-instance variation for repeated sibling components.

```tsx
import { maybeAnimate } from '@/lib/animate-in';

function CardLayout(props: CardProps, inversed = false, animated = false): JSX.Element {
  const image = <FieldImage field={props.fields.Image} mode="column-cover" />;
  const title = <Text tag="h3" field={props.fields.Title} />;
  return (
    <article className={`component jm-card ${inversed ? 'jm-card--inversed' : ''}`.trim()}>
      {maybeAnimate(animated, 'slide-in-right', 0, image)}
      {maybeAnimate(animated, 'slide-in-left', 80, title)}
    </article>
  );
}

export const Default = (props: CardProps): JSX.Element => CardLayout(props);
export const Inversed = (props: CardProps): JSX.Element => CardLayout(props, true);
export const Animated = (props: CardProps): JSX.Element => CardLayout(props, false, true);
```

**Do not:**

```tsx
// ❌ All variants identical — forbidden
export const Inversed = (props) => CardLayout(props);
export const Animated = (props) => CardLayout(props);
```

**Animation scoping:** use `<AnimateIn>` / `maybeAnimate` on **inner elements** inside the Animated export only. Respect `prefers-reduced-motion`. Default, Inversed, ImageTop, and ImageBottom must have **no** entrance animation.

## Section with placeholder — Default (grid) + Carousel variant

Sections that host Card (or similar) children via `<Placeholder>` **must** also export `Carousel`.

```tsx
'use client';

import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Placeholder, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

export interface GridSectionFields {
  Title: TextField;
  PreviousLabel: TextField;
  NextLabel: TextField;
}

function SectionShell(
  props: ComponentProps & { fields: GridSectionFields },
  children: React.ReactNode
): JSX.Element {
  const { params, fields, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid;
  return (
    <section
      key={componentKey}
      className={`component grid-section ${params.styles ?? ''}`}
      id={params.RenderingIdentifier}
    >
      <div className="container">
        <Text tag="h2" field={fields.Title} />
        {children}
      </div>
    </section>
  );
}

function PlaceholderSlot(props: ComponentProps): JSX.Element {
  const phKey = `section-cards-${props.params.DynamicPlaceholderId}`;
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Placeholder name={phKey} rendering={props.rendering} />
    </div>
  );
}

/** Grid layout — Default variant */
export const Default = (props: ComponentProps & { fields: GridSectionFields }): JSX.Element => (
  <SectionShell {...props}>
    <PlaceholderSlot {...props} />
  </SectionShell>
);

/** Same placeholder children — carousel layout */
export const Carousel = (props: ComponentProps & { fields: GridSectionFields }): JSX.Element => {
  const sitecore = useSitecore();
  const isEditing = sitecore?.page?.mode?.isEditing ?? false;
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const phKey = `section-cards-${props.params.DynamicPlaceholderId}`;
  const { fields } = props;

  useEffect(() => {
    if (!trackRef.current) return;
    const count = trackRef.current.querySelectorAll(':scope > *').length;
    setTotal(count);
  }, []);

  useEffect(() => {
    if (isEditing || total <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 5000);
    return () => clearInterval(id);
  }, [isEditing, total]);

  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);

  return (
    <SectionShell {...props}>
      <div className="relative overflow-hidden">
        <button type="button" onClick={prev} aria-label={fields.PreviousLabel?.value as string}>
          ‹
        </button>
        <div
          ref={trackRef}
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          <Placeholder name={phKey} rendering={props.rendering} />
        </div>
        <button type="button" onClick={next} aria-label={fields.NextLabel?.value as string}>
          ›
        </button>
      </div>
    </SectionShell>
  );
};
```

- `Default` = grid/stack; `Carousel` = slider over the **same** placeholder.
- Create Headless Variant YAML for both `Default` and `Carousel`.
- Omit `Carousel` on sections without `<Placeholder>`.

## React `key` on root element (required)

### Placeholder children — SDK handles keys

The Content SDK assigns `key={rendering.uid}` when it renders each child inside `<Placeholder>`. You do **not** need `key={componentKey(props)}` on the component's returned root for that — it is redundant (harmless but not what fixes list warnings).

Use `componentKey(props)` (`RenderingIdentifier ?? rendering.uid`) only when **you** render a list of items inside the component (e.g. `.map()` over link fields).

### `renderEach` — you own the wrapper key

When the parent uses `<Placeholder renderEach={…} />`, **your wrapper element** becomes the keyed list item. Always set `key` on the element returned from `renderEach`:

```tsx
renderEach={(component, index) => (
  <div key={`slide-${index}`} className="carousel__slide">
    {component}
  </div>
)}
```

Prefer a **semantic prefix** (`slide-`, `panel-`, `stats-`) — not bare `index`.

### Multiple sibling `<Placeholder>` — prefix keys (critical)

A single `<Placeholder>` returns an **array** of React elements. When **two or more** `<Placeholder>` components are **siblings under the same parent**, React **flattens** those arrays into one child list.

If each placeholder uses `key={index}` in `renderEach`, keys **collide across placeholders**:

```tsx
{/* ❌ Duplicate keys: panel-0, panel-1, stats-0 → two children with key 0 */}
<div className="row">
  <Placeholder name={panelsPh} rendering={rendering}
    renderEach={(c, i) => <div key={i} className="grid__col">{c}</div>} />
  <Placeholder name={statsPh} rendering={rendering}
    renderEach={(c, i) => <div key={i} className="grid__col">{c}</div>} />
</div>
```

```tsx
{/* ✅ Unique keys across the flattened sibling list */}
<div className="row">
  <Placeholder name={panelsPh} rendering={rendering}
    renderEach={(c, i) => <div key={`panel-${i}`} className="grid__col">{c}</div>} />
  <Placeholder name={statsPh} rendering={rendering}
    renderEach={(c, i) => <div key={`stats-${i}`} className="grid__col">{c}</div>} />
</div>
```

**Rule:** whenever two+ `<Placeholder>` components share a parent DOM node, prefix `renderEach` keys with the **placeholder semantic name** (or `rendering.uid` of the child if you expose it — index + prefix is sufficient).

Common pattern: composite hero band — `hero-slides-{*}` + `hero-panels-{*}` + `hero-stats-{*}` in one row ([composite-hero-band.md](../../sitecore-section-decomposition/references/composite-hero-band.md)).

### Single `<Placeholder>` with `render` prop

When using `render={(components) => <div className="grid">{components}</div>}`, children already carry SDK keys — no extra keys needed on the wrapper.

### `.map()` inside components

Key each mapped item by **stable field name** (`Link1`, `NavLink3`) — not bare `index` when the same component renders multiple lists on a page. When building **navigation lists**, omit items whose link `href` is empty. Do **not** apply that filter to teaser/panel/hero bands — see [visual-fidelity.md § Empty or missing link href](../sitecore-component-from-design/references/visual-fidelity.md#empty-or-missing-link-href--still-render-visible-content).

When a parent list mixes `.map()` output with **extra sibling elements**, key the siblings too:

```tsx
<ul>
  {links.map(([name, field]) => (
    <li key={name}>…</li>
  ))}
  <li key="nav-search">…</li>  {/* required — not inside .map() */}
</ul>
```

### Checklist

```
- [ ] renderEach wrapper has key with semantic prefix (not bare index when multiple placeholders share a parent)
- [ ] Two+ sibling Placeholders under same parent → distinct key prefixes per placeholder
- [ ] Internal .map() lists keyed per item
- [ ] Did not assume key on component root fixes placeholder sibling warnings
```

## Header component

Header chrome: logo (and optional utility links) as **fields**, primary navigation as a **placeholder** for `Navigation` / `LinkList` child renderings.

```tsx
'use client';

import type { JSX } from 'react';
import { Link as SitecoreLink, Placeholder, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { FieldImage } from '@/lib/field-image';

export interface HeaderFields {
  Logo: ImageField;
  UtilityLink: LinkField;
  SearchLabel: TextField;
}

const defaultFields: HeaderFields = {
  Logo: { value: { src: '', alt: 'Site logo' } },
  UtilityLink: { value: { href: '/contact', text: 'Contact' } },
  SearchLabel: { value: 'Search' },
};

export type HeaderProps = ComponentProps & {
  fields: HeaderFields;
};

function HeaderLayout(props: HeaderProps, variantClass: string): JSX.Element {
  const { params, fields = defaultFields, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid;
  const phNav = `header-nav-${params.DynamicPlaceholderId}`;

  return (
    <header
      key={componentKey}
      className={`component header ${variantClass} ${params.styles ?? ''}`.trim()}
      id={params.RenderingIdentifier}
    >
      <div className="container flex items-center gap-6">
        <FieldImage field={fields.Logo} mode="contain" />
        <nav className="flex-1" aria-label="Primary">
          <Placeholder name={phNav} rendering={rendering} />
        </nav>
        <SitecoreLink field={fields.UtilityLink} />
        <Text tag="span" className="sr-only" field={fields.SearchLabel} />
      </div>
    </header>
  );
}

export const Default = (props: HeaderProps): JSX.Element => HeaderLayout(props, '');
export const Inversed = (props: HeaderProps): JSX.Element => HeaderLayout(props, 'header--inversed');
export const ImageTop = (props: HeaderProps): JSX.Element => HeaderLayout(props, 'header--image-top');
export const ImageBottom = (props: HeaderProps): JSX.Element =>
  HeaderLayout(props, 'header--image-bottom');
export const Animated = (props: HeaderProps): JSX.Element => HeaderLayout(props, 'header--default', true);
```

Placeholder YAML: `header-nav-{*}` with Allowed Controls = `Navigation` rendering GUID.

Optional split layout (logo left / nav center / utilities right): add `header-left-{*}` and `header-right-{*}` placeholders.

## Footer component

Footer chrome: branding fields on the left, **one placeholder per link column** on the right.

```tsx
'use client';

import type { JSX } from 'react';
import { Link as SitecoreLink, Placeholder, RichText, Text } from '@sitecore-content-sdk/nextjs';
import type { ImageField, LinkField, RichTextField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { FieldImage } from '@/lib/field-image';

export interface FooterFields {
  Logo: ImageField;
  Description: RichTextField;
  ColumnOneTitle: TextField;
  ColumnTwoTitle: TextField;
  ColumnThreeTitle: TextField;
  CopyrightText: TextField;
  TermsLink: LinkField;
  PrivacyLink: LinkField;
}

const defaultFields: FooterFields = {
  Logo: { value: { src: '', alt: 'Site logo' } },
  Description: { value: 'Company description' },
  ColumnOneTitle: { value: 'Products' },
  ColumnTwoTitle: { value: 'Company' },
  ColumnThreeTitle: { value: 'Support' },
  CopyrightText: { value: '© 2026 Example Corp' },
  TermsLink: { value: { href: '/terms', text: 'Terms' } },
  PrivacyLink: { value: { href: '/privacy', text: 'Privacy' } },
};

export type FooterProps = ComponentProps & {
  fields: FooterFields;
};

function FooterLayout(props: FooterProps, variantClass: string): JSX.Element {
  const { params, fields = defaultFields, rendering } = props;
  const componentKey = params.RenderingIdentifier ?? rendering?.uid;
  const phOne = `footer-links-${params.DynamicPlaceholderId}`;
  const phTwo = `footer-links-two-${params.DynamicPlaceholderId}`;
  const phThree = `footer-links-three-${params.DynamicPlaceholderId}`;

  const columns = [
    { key: 'col-1', title: fields.ColumnOneTitle, ph: phOne },
    { key: 'col-2', title: fields.ColumnTwoTitle, ph: phTwo },
    { key: 'col-3', title: fields.ColumnThreeTitle, ph: phThree },
  ];

  return (
    <footer
      key={componentKey}
      className={`component footer ${variantClass} ${params.styles ?? ''}`.trim()}
      id={params.RenderingIdentifier}
    >
      <div className="container grid gap-12 py-16 lg:grid-cols-[1fr_2fr]">
        <div>
          <FieldImage field={fields.Logo} mode="contain" />
          <RichText field={fields.Description} />
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map(({ key, title, ph }) => (
            <div key={key}>
              <Text tag="h3" className="font-bold" field={title} />
              <Placeholder name={ph} rendering={rendering} />
            </div>
          ))}
        </div>
      </div>
      <div className="container flex items-center justify-between py-6">
        <Text tag="p" field={fields.CopyrightText} />
        <div className="flex gap-6">
          <SitecoreLink field={fields.TermsLink} />
          <SitecoreLink field={fields.PrivacyLink} />
        </div>
      </div>
    </footer>
  );
}

export const Default = (props: FooterProps): JSX.Element => FooterLayout(props, '');
export const Inversed = (props: FooterProps): JSX.Element => FooterLayout(props, 'footer--inversed');
export const ImageTop = (props: FooterProps): JSX.Element => FooterLayout(props, 'footer--image-top');
export const ImageBottom = (props: FooterProps): JSX.Element =>
  FooterLayout(props, 'footer--image-bottom');
export const Animated = (props: FooterProps): JSX.Element => FooterLayout(props, 'footer--default', true);
```

Placeholder YAML: one setting per prefix (`footer-links-{*}`, `footer-links-two-{*}`, …) with Allowed Controls = `LinkList` or `NavLink` rendering GUIDs.

---

After adding the file, register in **both** maps when using App Router + client components:

- `.sitecore/component-map.ts` — `{ componentType: 'client' }` when file has `'use client'`
- `.sitecore/component-map.client.ts` — spread import

Or run the project's map generator if configured (`sitecore-tools:generate-map` in `package.json`).

Rendering `componentName` shared field and component-map key must match exactly.

## Documentation lookup

Use MCP `search_sitecore_knowledge_sources` on server `user-documentation` for:

- Content SDK field components
- AppPlaceholder / Placeholder usage
- Component variants and `includeVariants`
- Register a component in the component map
