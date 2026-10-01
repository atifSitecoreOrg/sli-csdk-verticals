# Page decomposition format

Per page: `{project}/{page-slug}/page-decomposition.json`

Drives **page content assembly** — which section renderings appear on the route and what child renderings fill placeholders.

---

## Schema

```json
{
  "slug": "matthey-com--home",
  "url": "https://matthey.com/",
  "layoutChrome": [
    { "cmsName": "TopBar", "scope": "site", "sectionFolder": "top-bar" },
    { "cmsName": "Header", "scope": "site", "sectionFolder": "header" },
    { "cmsName": "Navigation", "scope": "site", "sectionFolder": "navigation" },
    { "cmsName": "Footer", "scope": "site", "sectionFolder": "footer" }
  ],
  "sections": [
    {
      "order": 1,
      "sectionFolder": "hero-carousel",
      "sectionScreenshotName": "HeroCarousel",
      "parentComponent": {
        "cmsName": "FullBleedHeroCarouselSection",
        "placeholderKey": "hero-slides-{DynamicPlaceholderId}"
      },
      "placeholderChildren": [
        {
          "cmsName": "HeroSlideCard",
          "repeatCount": 3,
          "inPlaceholder": "hero-slides-{DynamicPlaceholderId}"
        }
      ]
    },
    {
      "order": 2,
      "sectionFolder": "explore-more-teaser-grid",
      "sectionScreenshotName": "ExploreMoreTeaserGrid",
      "parentComponent": {
        "cmsName": "TitleDescriptionTeaserGridSection",
        "placeholderKey": "teaser-cards-{DynamicPlaceholderId}"
      },
      "placeholderChildren": [
        {
          "cmsName": "VerticalTeaserCard",
          "repeatCount": 3,
          "inPlaceholder": "teaser-cards-{DynamicPlaceholderId}"
        }
      ]
    }
  ],
  "confidence": "high",
  "notes": []
}
```

---

## Field definitions

| Field | Description |
|-------|-------------|
| `layoutChrome` | Site-wide chrome renderings (partial design), not in page main placeholder |
| `sections[].sectionFolder` | Folder under `sections/` (screenshot crop name) |
| `sections[].sectionScreenshotName` | Visual detection `cmsName` from manifest |
| `sections[].parentComponent` | Sitecore section rendering to add to page |
| `sections[].placeholderChildren` | Child renderings to insert in parent placeholder |
| `placeholderChildren[].repeatCount` | How many datasource items / renderings to seed |
| `sections[].compositeBand` | When `true`, one screenshot crop maps to **`CompositeHeroBandSection`** + multiple placeholder child groups |
| `sections[].placeholderChildren[]` | Child renderings slotted into parent placeholders (`hero-slides`, `hero-panels`, `hero-stats`, …) |
| `parentComponent.headlessVariant` | Drives `FieldNames` in page YAML (usually **Carousel** for composite hero) |

---

## Composite band (carousel + side panels)

When one section folder contains a full-bleed carousel **and** a news/stats panel row (see [composite-hero-band.md](composite-hero-band.md)), use `compositeBand: true` with **`CompositeHeroBandSection`** as the single parent:

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
    { "cmsName": "HeroSlideCard", "repeatCount": 3, "inPlaceholder": "hero-slides-{DynamicPlaceholderId}" },
    { "cmsName": "HeroPanelCard", "repeatCount": 2, "inPlaceholder": "hero-panels-{DynamicPlaceholderId}" },
    { "cmsName": "HeroStatsPanel", "repeatCount": 1, "inPlaceholder": "hero-stats-{DynamicPlaceholderId}" }
  ]
}
```

Page assembly must preserve **spatial order** from `section.html` (carousel block, then panel columns). Stacking sub-components as unrelated full-width bands in `headless-main` without a composite wrapper will not match the screenshot.

---

## Page content item mapping

When creating Sitecore page content:

1. **Partial design** — wire `layoutChrome` (Header, TopBar, Footer, …).
2. **Page main placeholder** — add `sections[].parentComponent` in `order`. When `compositeBand: true`, add **one** `CompositeHeroBandSection` rendering and nest `placeholderChildren` in its placeholders.
3. For each parent with `placeholderKey` — add `repeatCount` × `placeholderChildren[].cmsName` under that placeholder.
4. Set `FieldNames` in `__Renderings` to the Headless Variant GUID from `headlessVariant` (usually **Default**; use **Carousel** when design shows slider controls).

---

## Multi-page reuse

The same `cmsName` in `component-blueprint.json` may appear on multiple pages with different `repeatCount` or datasource content. `page-decomposition.json` only describes **this route**.
