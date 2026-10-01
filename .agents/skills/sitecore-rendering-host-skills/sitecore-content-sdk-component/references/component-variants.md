# Component variants (Content SDK)

Rules for named TSX exports (`Default`, `Inversed`, `ImageTop`, …) and matching Headless Variant YAML. **Do not** scaffold the old fixed quartet (`Default` + `Inversed` + `ImageTop` + `Animated` + `InversedAnimated`) on every component.

---

## Variant matrix

| Export | Sort | Create when | Behaviour |
|--------|------|-------------|-----------|
| `Default` | 100 | **Always** | Baseline layout from section PNG / `section.html` |
| `Inversed` | 200 | **Only** when layout has a meaningful left ↔ right mirror | Swap column order, flip flex direction, image left instead of right, etc. **Omit** from TSX **and** YAML when nothing can reverse (nav lists, stats-only, text-only bands) |
| `ImageTop` | 300 | Component template has an **Image** field used in layout | Same fields as Default; primary image **above** copy/CTA (stacked) |
| `ImageBottom` | 350 | Same as ImageTop | Same fields as Default; primary image **below** copy/CTA |
| `Animated` | 400 | **Always** | Viewport-triggered entrance motion on inner elements — **once**, custom CSS/React (not animate.css). Respect `prefers-reduced-motion` |
| `Carousel` | 500 | Section has `<Placeholder>` and is **not** already a carousel component | Same placeholder children in Embla slider (prev/next, dots, responsive) |

**Never create:** `InversedAnimated` — combine layout flags only when a single export is needed for a one-off; prefer separate exports above.

**Optional extra exports** are allowed only when the screenshot clearly contains an additional, distinct layout that is not covered by `Default` / `Inversed` / `ImageTop` / `ImageBottom` / `Animated` / `Carousel`. Keep names semantic and generic; avoid site- or customer-specific naming in shared skills.

---

## Inversed — mirror, not recolour

`Inversed` **must** swap spatial layout (left column ↔ right column, image side flip). It is **not** an alternate colour theme.

```tsx
// ✅ Image right (Default) vs image left (Inversed)
export const Default = (p) => ColumnLayout(p, { imageSide: 'right' });
export const Inversed = (p) => ColumnLayout(p, { imageSide: 'left' });

// ❌ Same DOM, different background class — omit Inversed entirely
export const Inversed = (p) => Layout(p, 'bg-ocean-400');
```

**Skip Inversed** for non-mirror components (single-column nav lists, stat tiles, text-only blocks, or any layout without left/right spatial structure).

---

## ImageTop / ImageBottom

Applies to components whose template includes an **Image** field rendered in the layout (`Image`, `Logo`, `BackgroundImage` when used as stacked media, `VideoThumbnail` optional).

```tsx
export const Default = (p) => StackLayout(p, 'image-right');      // or side-by-side default
export const ImageTop = (p) => StackLayout(p, 'image-top');
export const ImageBottom = (p) => StackLayout(p, 'image-bottom');
```

Use scoped BEM modifiers (e.g. `image-rich-text--image-top`, `image-rich-text--image-bottom`). Mobile: stack naturally; test tablet/desktop PNGs.

If the component has an image field that is used as decorative background only (not a content media block), do not force `ImageTop` / `ImageBottom` unless the screenshot explicitly shows stacked media behavior.

---

## Animated — viewport once, per element

Implementation lives in the editing host (`src/lib/animate-in.tsx` + scoped CSS). Inspiration from [animate.style](https://animate.css/) (fade/slide/zoom names) — **do not** import that library.

| Element | Example motion | Notes |
|---------|----------------|-------|
| Primary image | `slide-in-left` / `slide-in-right` | Opposite direction from title when both animate |
| Title / heading | `slide-in-right` / `slide-in-up` | Stagger 80–150 ms after image |
| Body / RichText | `fade-in` | Slightly later delay |
| CTA / buttons | `slide-in-up` or `zoom-in` | Last in sequence |

Rules:

1. **`IntersectionObserver`** — fire when ~15% of component root is visible; **run once** (`disconnect` after trigger).
2. **`prefers-reduced-motion: reduce`** — show final state immediately (no animation).
3. Scope CSS under `.jm-animate--*`; Animated export wraps children with `<AnimateIn motion="…" delay={ms}>`.
4. **Default / Inversed / ImageTop / ImageBottom** — no entrance animation.
5. Pages editing mode — optional: skip animation when `useSitecore()?.page?.mode?.isEditing`.

```tsx
export const Animated = (p) => Layout(p, {
  animate: true,
  motions: { image: 'slide-in-left', title: 'slide-in-right', body: 'fade-in', cta: 'slide-in-up' },
});
```

---

## Carousel — placeholder sections only

Create `Carousel` export when:

- Component uses `<Placeholder>` for repeating children (cards, stats, links), **and**
- Component is **not** a dedicated carousel (`EyebrowTitleCarouselSection`, `CompositeHeroBandSection` — carousel lives in **Default**).

Pattern (Embla + SSR-safe static track):

```tsx
function GridSlot(props) {
  return (
    <Placeholder
      name={phKey(props)}
      rendering={props.rendering}
      render={(components) => <div className="section__grid">{components}</div>}
    />
  );
}

function CarouselSlot(props) {
  // useClientMounted + useEmblaCarousel — same placeholder, renderEach with prefixed keys
}
export const Default = (p) => Shell(p, <GridSlot {...p} />);
export const Carousel = (p) => Shell(p, <CarouselSlot {...p} />);
```

Disable autoplay in editing mode. Prefix `renderEach` keys when multiple placeholders share a parent — [placeholder-layout.md](placeholder-layout.md).

---

## Per-component checklist

```
- [ ] Listed which exports apply (not blind copy of 4 variants)
- [ ] Inversed omitted where layout cannot mirror
- [ ] ImageTop + ImageBottom only when Image field exists
- [ ] Animated on every component with AnimateIn + reduced-motion
- [ ] Carousel on placeholder sections that are not carousel components
- [ ] Headless Variant YAML matches TSX exports exactly (names + sort order)
- [ ] No InversedAnimated export
- [ ] Variants produce visibly different output (never alias Default)
```

---

## YAML sort order

| Variant | `__Sortorder` |
|---------|---------------|
| Default | 100 |
| Inversed | 200 |
| ImageTop | 300 |
| ImageBottom | 350 |
| Additional custom variants (if used) | 275–325 |
| Animated | 400 |
| Carousel | 500 |

---

## Related

- [tsx-pattern.md](tsx-pattern.md) — file structure, React keys, examples
- [component-types.md](component-types.md) — Header / Section / Card classification
- [yaml-artifacts.md](yaml-artifacts.md) — Headless variant YAML template
- Keep this guidance generic across websites. Derive implementation from the current screenshot/HTML only.
