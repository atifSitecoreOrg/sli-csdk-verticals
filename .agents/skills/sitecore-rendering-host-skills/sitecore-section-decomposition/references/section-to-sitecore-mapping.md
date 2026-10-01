# Section screenshot → Sitecore component mapping

Apply **after** visual section detection. Names describe **structure**, not page marketing copy.

---

## Site chrome

| Visual | Sitecore `cmsName` | Scope | Notes |
|--------|-------------------|-------|-------|
| Thin strip above header (promo, utilities) | `TopBar` | site | May include links, language, search shortcut |
| Logo + primary nav shell | `Header` | site | Placeholder for `Navigation` |
| Main nav links / mega menu | `Navigation` | site | Child of Header placeholder |
| Cookie consent bar | `CookieBanner` | site | Layout overlay — analyze **overlay** screenshot |
| Chat / support widget | `ChatWidget` | site | Fixed corner button — **overlay** screenshot |
| Floating side button | `FloatingActionButton` | site | Back-to-top, feedback tab — **overlay** screenshot |
| Footer columns + legal | `Footer` | site | Placeholders for link lists |

---

## Section patterns (parent + child)

| Manifest signal | Parent Sitecore component | Placeholder key | Child component |
|-----------------|---------------------------|-----------------|-----------------|
| `type: composite-hero` / composite band detected | `CompositeHeroBandSection` | `hero-slides-{*}`, `hero-panels-{*}`, `hero-stats-{*}` | `HeroSlideCard`, `HeroPanelCard`, `HeroStatsPanel` |
| `type: carousel`, full-bleed hero (standalone band) | `FullBleedHeroCarouselSection` | `hero-slides-{*}` | `HeroSlideCard` (**Image** required) |
| `type: carousel`, `FeatureCarouselCard` (explicit child in manifest) | `EyebrowTitleCarouselSection` | `carousel-slides-{*}` | `FeatureCarouselCard` |
| `type: carousel`, `EventCard` | `TitleDescriptionEventsCarouselSection` | `event-cards-{*}` | `EventCard` |
| Composite band: carousel + panel row + optional stats | See [composite-hero-band.md](composite-hero-band.md) — **`CompositeHeroBandSection`** wrapper | per placeholder | `HeroSlideCard`, `HeroPanelCard`, `HeroStatsPanel` |
| `type: carousel`, teaser cards (small tiles, no full-bleed background) | `EyebrowTitleCarouselSection` | `carousel-slides-{*}` | `FeatureCarouselCard` |
| `type: signpost-section` | `LogoTitleCtaSignpostSection` | `signpost-cards-{*}` | `HorizontalLinkCard` |
| `type: grid`, `VerticalTeaserCard` | `TitleDescriptionTeaserGridSection` | `teaser-cards-{*}` | `VerticalTeaserCard` |
| `type: grid`, `HorizontalLinkCard` | `TitleDescriptionLinkGridSection` | `link-cards-{*}` | `HorizontalLinkCard` |

**Panel block vs montage grid (do not conflate):**

| Visual | Wrong | Correct |
|--------|-------|---------|
| Full-width background + H2 + **one** image column + **one** text/CTA column (single story) | `TitleDescriptionTeaserGridSection` + 2× `VerticalTeaserCard` | **`BackgroundPanelSection`** — `Title`, `BackgroundImage`, `Image`, `Body`, `Cta`; no placeholder |
| H2 + **4 homogeneous** teaser tiles (each with title, image, link) | Same parent as panel block above | **`TitleDescriptionTeaserGridSection`** + `teaser-cards` placeholder → **`VerticalTeaserCard`** |

Apply [boundary-rules.md §10](../../../mimic-website-skills/visual-cms-component-detection/references/boundary-rules.md) before choosing `type: grid` + child cards.

**Override:** If `section.html` shows a **text column + video column** (not identical link cards), use **`TitleDescriptionVideoSection`** with no placeholder — see [standalone-vs-placeholder.md](../../sitecore-component-from-design/references/standalone-vs-placeholder.md).

| `type: stats-bar` | `TitleStatsBarSection` | `stats-items-{*}` | `StatsItem` |
| `type: hero` / `HeroCarousel` | `FullBleedHeroCarouselSection` | `hero-slides-{*}` | `HeroSlideCard` |
| `type: hero` / `HeroBanner` | `FullBleedHeroBannerSection` | — | — |

---

## Single-band sections (no placeholder)

| Visual layout | Parent Sitecore component | Typical fields |
|---------------|---------------------------|----------------|
| Image + text columns | `ImageRichTextSection` | Title, Body, Image, Cta |
| Full-bleed background image + text | `BackgroundImageRichTextSection` | Title, Body, BackgroundImage, Cta |
| Title + description + CTA, no image | `TitleDescriptionCtaSection` | Eyebrow, Title, Description, Cta |
| Text column + video thumbnail / play control (`jmvideotempl`, YouTube embed) | `TitleDescriptionVideoSection` | Title, Body, Cta, VideoThumbnail, VideoThumbnailMobile, PlayVideoLabel, VideoLink — [column-split-layouts.md](../../sitecore-component-from-design/references/column-split-layouts.md) · [media-frame-fidelity.md](../../sitecore-component-from-design/references/media-frame-fidelity.md) |
| Full-width background + H2 + image column + text/CTA column (panel block) | `BackgroundPanelSection` | Title, BackgroundImage, Image, Body, Cta |
| Text only | `RichTextSection` | Title, Body |
| Two-column feature | `HorizontalFeatureSection` | Title, Body, Image, Cta |

---

## Field inference checklist

From section screenshot, map visible UI to fields:

| UI element | Field name | Sitecore type |
|------------|------------|---------------|
| Small uppercase label | `Eyebrow` | Single-Line Text |
| Main heading | `Title` | Single-Line Text |
| Secondary heading | `Subtitle` | Single-Line Text |
| Paragraph | `Description` or `Body` | Multi-Line Text / Rich Text |
| Button / pill link | `Cta` or `PrimaryCta` | General Link |
| Second button | `SecondaryCta` | General Link |
| “See all …” below cards | `SectionCta` | General Link |
| Card image | `Image` | Image |
| Logo in row | `Logo` | Image |
| Category pill | `Tag` or `Category` | Single-Line Text |

---

## Naming rules

1. **Prefer structure over page copy** — `TitleDescriptionCtaSection`, not `PartnerWithUsSection`.
2. **Reuse child cards** — one `VerticalTeaserCard` across grids on the site.
3. **Keep screenshot folder names** only in `sourceSectionFolders` / manifest — not as rendering names.
4. **Apply naming taxonomy** from [`visual-cms-component-detection`](../../../mimic-website-skills/visual-cms-component-detection/references/naming-taxonomy.md) for card layout (vertical / horizontal / overlay).

---

## Confidence

| Level | When |
|-------|------|
| high | Manifest `type` + `placeholderFor` match visual; fields obvious |
| medium | Editorial block could be two component types |
| low | Ambiguous repeat count or mixed patterns — ask user before build |
