# Component naming taxonomy

Use this strategy for every detected component. Apply **after** visual analysis, **before** finalizing `cmsName` in `sections/manifest.json`.

---

## Step 1 — Base component type

| Base term | Meaning |
|-----------|---------|
| **Grid** | Collection of items in rows/columns |
| **Card** | Single container for one discrete content item |
| **List** | Vertical stack of related items |
| **Carousel** | Horizontally scrollable or rotating collection |
| **Hero** | Prominent top-level visual intro |
| **CTA** | Call-to-action block |
| **Navigation** | Links to move through the site |
| **Footer** | Bottom site-wide nav and legal |
| **StatsBar** | Row of numerical highlights |
| **RichText** | Text-heavy editorial content |

Global chrome (always site-scoped when applicable): `Header`, `Footer`, `Navigation`, `Breadcrumb`, `CookieBanner`.

---

## Step 2 — Layout orientation

Add how content behaves spatially:

| Orientation | Use when |
|-------------|----------|
| **Vertical** | Image/media on top, text below |
| **Horizontal** | Image on one side, text on other |
| **Overlay** | Text/buttons on background image |
| **Grid** | Multiple items in rows/columns (parent) |
| **List** | Stacked vertical items |
| **Carousel** | Sliding/rotating items |

Examples: `VerticalCard`, `HorizontalCard`, `OverlayCard`, `VerticalCardGrid`, `HorizontalCardGrid`, `OverlayCardGrid`, `HorizontalCarousel`.

---

## Step 3 — Content purpose or intensity

Add when it clarifies author intent:

| Purpose | Examples |
|---------|----------|
| Teaser | Article/solution preview |
| Link | Navigation to another page |
| Profile | Person/team member |
| Product | Commerce item |
| Article | News/blog item |
| Event | Date/time listing |
| Resource | Download/document link |
| Feature | Capability highlight |
| Promo | Campaign/marketing tile |
| Stats | Metric/number highlight |

Combined examples:

- `VerticalTeaserGrid` + `VerticalTeaserCard`
- `HorizontalLinkCardGrid` + `HorizontalLinkCard`
- `ProfileCardGrid` + `ProfileCard`
- `OverlayPromoCardGrid` + `OverlayPromoCard`
- `ArticleTeaserList` + `VerticalTeaserCard`
- `ResourceLinkGrid` + `TextOnlyLinkCard`

---

## Card type definitions

### VerticalCard

Image/media on top, text in middle, CTA at bottom.

**Used for:** article teasers, feature callouts, solution teasers, content cards.

**Example name:** `VerticalTeaserCard`

### HorizontalCard

Image on one side, text/link on the other.

**Used for:** search results, event listings, related pages, location cards, timelines.

**Example name:** `HorizontalLinkCard`

### OverlayCard

Text and/or buttons directly on a background image.

**Used for:** homepage buckets, category links, campaign tiles, visual navigation.

**Example name:** `OverlayPromoCard`

### TextOnlyCard

No media; text in colored or bordered container.

**Used for:** FAQ previews, quick links, alerts, resource links, nav tiles.

**Example name:** `TextOnlyLinkCard`

### ProfileCard

Headshot with name, role, optional links.

**Used for:** team, leadership, people directories.

**Example name:** `ProfileCard`

### ProductCard

Product image, title, price, rating, purchase CTA.

**Used for:** ecommerce listings, collections, featured products.

**Example name:** `ProductCard`

---

## Visual → name decision tree

```
Repeated similar blocks visible?
  YES → Identify card layout (vertical / horizontal / overlay / text-only / profile / product)
      → Identify purpose (teaser / link / promo / stats / …)
      → Parent: {Orientation}{Purpose}Grid  OR  StatsBar  OR  {Purpose}List
      → Child:  {Orientation}{Purpose}Card   OR  StatsItem
  NO  → Single band?
      → Hero-like (large image + h1)?     → HeroBanner or HeroCarousel
      → Image + text side by side?        → RichTextImageBlock or HorizontalFeatureBlock
      → Stats/metrics row?                → StatsBar + StatsItem
      → Mostly text?                      → RichTextSection
      → Full-width CTA?                   → CtaBlock
      → Global chrome?                    → Header / Footer / Navigation / Breadcrumb
```

---

## Mapping generic DOM names → taxonomy

When `discover-sections.mjs` emits a generic name, rename using visual analysis:

| Generic (avoid) | Visual rename (prefer) |
|-----------------|------------------------|
| `RichTextImageBlock2` | `{Purpose}BackgroundImageBlock` or `{Purpose}HorizontalFeatureBlock` |
| `FeatureSection` | `HorizontalFeatureBlock`, `BackgroundImageFeatureBlock` |
| `ContentBlock2` | `{Purpose}RichTextSection` or `{Purpose}CtaBlock` |
| `VerticalTeaserCard` (title row crop) | **Remove** — title belongs on parent `TeaserGrid` |
| `VerticalTeaserGrid2` | `{Purpose}TeaserGrid` (from section H2) |
| `Card` | `VerticalTeaserCard`, `HorizontalLinkCard` (metadata only unless valid tile crop) |

## Layout-based naming

| Visual signal | Name |
|---------------|------|
| CSS / wrapper background image | `{Purpose}BackgroundImageBlock` |
| Two columns: image + text | `{Purpose}HorizontalFeatureBlock` |
| Inline `<img>` + text | `{Purpose}RichTextImageBlock` |
| Title + text + CTA, no image | `{Purpose}CtaBlock` |
| Section H2 + repeating tiles | `{Purpose}TeaserGrid` (title = field, not card) |

---

## Sitecore placeholder naming

| Visual parent | Sitecore pattern |
|---------------|------------------|
| `VerticalTeaserGrid` | Section TSX + placeholder `vertical-teaser-cards-{*}` |
| `HorizontalLinkCardGrid` | Section TSX + placeholder `horizontal-link-cards-{*}` |
| `StatsBar` | Section TSX + placeholder `stats-items-{*}` |
| `HeroPanelSection` | Section TSX + placeholder `hero-panel-cards-{*}` |

Child card renderings slot into the parent placeholder — one card TSX, many datasource items.
