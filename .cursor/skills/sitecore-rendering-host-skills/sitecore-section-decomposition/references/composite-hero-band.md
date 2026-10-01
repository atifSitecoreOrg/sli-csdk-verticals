# Composite hero band (carousel + side panels)

Some homepages combine **one full-bleed carousel** and **a row of side panels** (news tiles, promo tiles, live metrics) inside a **single visual band**. Do not flatten this to one card grid section.

---

## Visual / HTML signals

| Signal | Common DOM patterns (site-specific class names vary) |
|--------|------------------------------------------------------|
| Full-width image slider | carousel wrapper classes; slide nodes with `background-image` on a child element |
| Prev/next + dots | carousel control wrappers and button classes |
| Side panel row below/overlapping carousel | Wrapper such as `.panels-hero-panels`, `[class*="hero-panels"]`, `.row` with 2–4 equal columns |
| Text-only news/promo panels | Repeated blocks with panel title + body + arrow/link (no card image) |
| Live stats / share price widget | Numeric value + change + date in the last column |

**One screenshot crop** may contain all of the above. The band is **composite** — one spatial layout, multiple authored child items.

---

## Wrong vs right decomposition

| Wrong (common failure) | Right |
|------------------------|-------|
| Single `HorizontalLinkCardGrid` / `TitleDescriptionLinkGridSection` for the whole band | Use **`CompositeHeroBandSection`** wrapper (recommended) or equivalent composite layout |
| `EyebrowTitleCarouselSection` + `FeatureCarouselCard` for full-bleed hero slides | `HeroSlideCard` with **Image** field (background extracted from slide HTML) |
| Text-only carousel cards when slides have background images | Map `background-image: url(...)` URLs to `HeroSlideCard.Image` |
| News + metrics as separate full-width sections stacked in `headless-main` | Nest under **`CompositeHeroBandSection`** placeholders (`hero-panels-{*}`, `hero-stats-{*}`) |
| `Default` variant when design shows slider controls | **`Carousel`** Headless Variant on the composite section (or carousel sub-region) |

---

## Recommended Sitecore component set

| Sub-region | Wrapper placeholder (on `CompositeHeroBandSection`) | Child component | Typical fields |
|------------|-----------------------------------------------------|-----------------|------------------|
| Full-bleed hero slider | `hero-slides-{*}` | `HeroSlideCard` | Image, Title, Subtitle, Cta |
| News / promo text panels | `hero-panels-{*}` | `HeroPanelCard` | PanelTitle, Body, Cta |
| Live metrics / share price | `hero-stats-{*}` | `HeroStatsPanel` | Title, Value, Change, Date, Link |

**Teaser carousel** (small cards in a compact grid, not full-bleed backgrounds) → `EyebrowTitleCarouselSection` + `FeatureCarouselCard` — a different pattern. See [section-to-sitecore-mapping.md](section-to-sitecore-mapping.md).

**Alternative (no composite wrapper):** `FullBleedHeroCarouselSection` + `HeroSlideCard` as a standalone band, with separate panel sections below — only when the design truly stacks them as separate full-width bands.

---

## Field extraction from `section.html`

Infer selectors from the captured HTML; do not hardcode site-specific class names in skills or scripts.

| Visual element | Field | Child component |
|----------------|-------|-----------------|
| Slide background `url(...)` on image/background node | `Image` | `HeroSlideCard` |
| Primary slide heading | `Title` | `HeroSlideCard` |
| Slide supporting line | `Subtitle` | `HeroSlideCard` |
| Slide CTA link | `Cta` | `HeroSlideCard` — follow [General Link patterns](../../sitecore-component-from-design/references/visual-fidelity.md#general-link-cta-fields--inner-markup-patterns) |
| Panel column title | `PanelTitle` | `HeroPanelCard` |
| Panel body copy | `Body` | `HeroPanelCard` |
| Panel link | `Cta` | `HeroPanelCard` |
| Metric label / value / change / date | `Title`, `Value`, `Change`, `Date` | `HeroStatsPanel` |

Download slide background URLs to the media library before datasource YAML.

---

## `page-decomposition.json` — composite band

When one section folder covers carousel + panels, emit **`compositeBand: true`** with a **single parent** and multiple placeholder child groups:

```json
{
  "order": 1,
  "sectionFolder": "hero-band",
  "sectionScreenshotName": "CompositeHeroBand",
  "compositeBand": true,
  "parentComponent": {
    "cmsName": "CompositeHeroBandSection",
    "headlessVariant": "Carousel",
    "placeholderKey": null
  },
  "placeholderChildren": [
    {
      "cmsName": "HeroSlideCard",
      "repeatCount": 3,
      "inPlaceholder": "hero-slides-{DynamicPlaceholderId}"
    },
    {
      "cmsName": "HeroPanelCard",
      "repeatCount": 2,
      "inPlaceholder": "hero-panels-{DynamicPlaceholderId}"
    },
    {
      "cmsName": "HeroStatsPanel",
      "repeatCount": 1,
      "inPlaceholder": "hero-stats-{DynamicPlaceholderId}"
    }
  ]
}
```

Do **not** omit the carousel because a grid detector found only the panel columns.

---

## Page YAML / spatial fidelity

One **`CompositeHeroBandSection`** rendering in `headless-main` with `DynamicPlaceholderId=N`. Child renderings use:

- `/headless-main/hero-slides-N`
- `/headless-main/hero-panels-N`
- `/headless-main/hero-stats-N`

Set `FieldNames` on the parent to the **Carousel** Headless Variant GUID when the design shows slider controls.

The composite section TSX must reproduce the **wrapper DOM** from `section.html` (carousel block + panel row). Child components render **inner** markup only — column/slide shells belong on the **parent** via `<Placeholder renderEach>`.

**Root wrapper:** use `component composite-hero-band` + `${params?.styles ?? ''}` — **not** the generic `section` class (which adds `padding: 3rem 0`). Set `padding: 0` in CSS; wire **Indent top/bottom** via page YAML `Styles=` — [presentation-styles.md](../../sitecore-page-from-design/references/presentation-styles.md).

**Placeholder assembly (required):**

1. **Parent** wraps each child with layout shells in `renderEach` (`.owl-item` / slide shell; grid column div; index-based border classes when capture shows dividers only after the first column). Use **prefixed keys** when multiple placeholders share a parent row (`panel-${index}`, `stats-${index}`) — [placeholder-layout.md](../../sitecore-content-sdk-component/references/placeholder-layout.md#react-keys--rendereach-and-sibling-placeholders).
2. **Child** card components render field markup **without** duplicating those shells (no `col-md-*` on child if parent already wraps columns).
3. Drive carousel with Embla or equivalent; derive slide count from `rendering.placeholders[…]` for dots/nav.
4. Include **band-level CSS** in the editing-host stylesheet (carousel height, panel row flush columns, arrow icon spans) — children + placeholders alone are not enough.
5. Verify against **full-page PNG**, not only the section crop — see [page-assembly-fidelity.md](../sitecore-component-from-design/references/page-assembly-fidelity.md).

**Panel/tile links:** when capture shows `text-panel-full-link` plus a corner arrow, implement **only the arrow** `<SitecoreLink>` in headless TSX — [dual-link-cta-patterns.md](../sitecore-component-from-design/references/dual-link-cta-patterns.md).

---

## Skill ownership

| Step | Skill |
|------|-------|
| Detect carousel + panel row in one band | [`url-screenshots`](../../../mimic-website-skills/url-screenshots/SKILL.md) — `discover-sections.mjs` |
| Map to Sitecore names + fields | **This skill** — `decompose-sections.mjs` + manual review |
| Build composite TSX + child cards | [`sitecore-component-from-design`](../sitecore-component-from-design/SKILL.md) |
| Export `Carousel` variant | [`sitecore-content-sdk-component`](../sitecore-content-sdk-component/SKILL.md) |
| Wire layout + `FieldNames` | [`sitecore-page-from-design`](../sitecore-page-from-design/SKILL.md) |

---

## Checklist before build

- [ ] Section HTML contains a carousel widget → manifest `type: carousel` or `composite-hero`, not `grid` alone
- [ ] Slide backgrounds mapped to `HeroSlideCard.Image`
- [ ] `page-decomposition.json` uses `compositeBand: true` with `CompositeHeroBandSection`
- [ ] Page YAML: one parent rendering + children in `hero-slides-*`, `hero-panels-*`, `hero-stats-*`
- [ ] Parent `FieldNames` → **Default** variant (carousel in Default via Embla — no separate Carousel variant)
- [ ] Panel column order matches desktop screenshot (left → right)
- [ ] **Full-page PNG** matches after assembly (not section crop alone)
