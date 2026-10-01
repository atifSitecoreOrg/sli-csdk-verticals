# Site chrome capture reference

Used by `section-capture.mjs` via `scripts/lib/sticky-overlays.mjs` (supersedes `site-chrome.mjs` for hide/detect).

**Dual screenshots:** see [sticky-overlays.md](sticky-overlays.md) — overlay PNGs for sticky UI, `-clean` PNGs for content.

## Problem

Site header and primary navigation appear at the top of **every** element screenshot unless explicitly hidden. This pollutes heroes, feature blocks, and grids — whether the header is `position: sticky` or not.

## Required workflow (always — not conditional on sticky)

```
Load page
  → Cookie banner visible?  Capture CookieBanner → dismiss/hide
  → Capture Header (or Navigation) while visible
  → Hide ALL site chrome (#banner, #navigation, …)
  → Discover sections
  → Capture content components only
```

**Do not** skip the hide step when sticky detection returns false.

## Capture

- Site-scoped: capture once; later pages reuse crops
- Output: `sections/header/` (or `sections/navigation/` if nav is separate from header)
- Viewports: desktop, tablet, mobile

## Hide selectors

```
#banner, header#banner, header[role="banner"]
#navigation, nav.jmheader__navbar, .jmheader__navbar
```

Also zero out `body` padding-top / scroll-padding-top added for fixed headers.

## Grid section titles

When a band has `[H2 title] + [card grid]`:

- **Include** the H2 in the `VerticalTeaserGrid` crop
- **Do not** create a separate `VerticalTeaserCard` screenshot for the title row
- Emit `placeholderFor: VerticalTeaserCard` in manifest without a card folder

## Compound band splitting

When one DOM band contains two distinct editorial blocks (e.g. image+text block above text+CTA block), split into two components before capture. See [boundary-rules.md](../visual-cms-component-detection/references/boundary-rules.md).

## Manifest fields

```json
{
  "Header": {
    "cmsName": "Header",
    "capturedBeforeHide": true,
    "hideMethod": "css"
  }
}
```

Per-page `page-manifest.json`:

```json
{
  "siteChrome": {
    "captured": true,
    "cmsName": "Header",
    "hideMethod": "css"
  }
}
```
