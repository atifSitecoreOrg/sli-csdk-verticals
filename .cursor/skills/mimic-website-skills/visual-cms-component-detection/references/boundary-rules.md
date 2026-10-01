# Boundary and anti-pattern rules

Critical rules learned from capture review. Apply during **visual analysis** and when validating `sections/manifest.json`.

---

## 1. Site chrome before content crops

**Always** capture `Header` / `Navigation` first, then **hide** them before any content section discovery or element screenshots.

Do **not** only hide when `position: sticky` is detected. Static headers still appear at the top of element crops and pollute heroes, feature blocks, and grids.

```
Sticky overlays visible → capture overlay PNGs (cookie, nav, chat, …)
  → Hide ALL sticky overlays
  → Full-page + section clean PNGs (-clean suffix)
  → Discover content sections from clean shots only
```

If a **clean** content crop shows cookie bar, nav, or chat button → sticky hide failed — re-run capture.

Use **overlay** PNGs only for sticky component detection; use **clean** PNGs for content sections.

---

## 2. Section titles belong to the parent grid — not a card

When a band has:

```
[H2 section title]
[intro paragraph optional]
[card] [card] [card]
```

| Correct | Wrong |
|---------|-------|
| One `VerticalTeaserGrid` including title + all cards | Separate crop of title row as `VerticalTeaserCard` |
| `sectionTitle` field on grid component | Promoting H2 to its own component |

**A card requires a repeating tile pattern** — 2+ siblings with the same structure.

**Never classify as card:**

- Lone H2 / H3 section heading row
- Section intro text above a grid
- Single non-repeating feature block

**Child card screenshots:** only when capturing a **representative repeating tile** (one of 2+ identical siblings). If no valid tile exists, emit `placeholderFor` in manifest **without** a card screenshot folder.

---

## 3. Split compound bands

When one DOM band contains **two or more visually distinct editorial blocks**, split into separate components.

Example (science page band):

| Block | Fields | Name |
|-------|--------|------|
| Top | title + rich text + **image** + CTA | `CollaborativeInnovationHorizontalFeatureBlock` |
| Bottom | title + rich text + CTA (no image) | `PartnerWithUsCtaBlock` |

**Signals to split:**

- Two stacked `.container` / `.row` regions with different layout (one has image column, one text-only)
- Clear horizontal rule or background change between blocks
- Distinct H2/H3 headings for each sub-block
- Combined crop height >> typical single component (~400px+ with two clear visual zones)

**Do not** emit one oversized `RichTextImageBlock3` spanning multiple authorable regions.

---

## 4. Name from visual layout signals

Use layout and media type in the name — not ordinal suffixes (`RichTextImageBlock2`).

| Visual signal | Name pattern | Example |
|---------------|--------------|---------|
| Full-bleed **background image** behind text | `{Purpose}BackgroundImageBlock` | `InnovationBackgroundImageBlock` |
| Image column + text column (side by side) | `{Purpose}HorizontalFeatureBlock` | `CollaborativeInnovationHorizontalFeatureBlock` |
| Inline image within text flow | `{Purpose}RichTextImageBlock` | `ScienceRichTextImageBlock` |
| Text + CTA, no image | `{Purpose}CtaBlock` or `RichTextCtaBlock` | `PartnerWithUsCtaBlock` |
| Text only | `{Purpose}RichTextSection` | `HeritageRichTextSection` |

Derive `{Purpose}` from the section H2/H3 (2–4 words, PascalCase).

**Avoid:** `RichTextImageBlock2`, `VerticalTeaserGrid2`, `ContentBlock2` — use purpose-based names instead.

---

## 5. Grid parent bounds

For `VerticalTeaserGrid` / `HorizontalLinkCardGrid`:

**Include in parent crop:**

- Section H2/H3 title
- Optional section intro copy
- All repeating card tiles
- Section-level CTA if visually attached

**Exclude from parent crop:**

- Unrelated band above/below
- Site header / navigation (must be hidden first)

**Do not** create sibling components for the title row.

---

## 6. Verification checklist

Before accepting manifest:

- [ ] No content crop shows site header/nav at top
- [ ] No `*Card` folder whose screenshot is mostly a section title
- [ ] No oversized band that visually contains 2+ distinct editorial blocks
- [ ] Names reflect background image, horizontal layout, or CTA-only — not ordinal numbers
- [ ] Each grid has at most one parent screenshot; card folder only if repeating tile crop is valid
- [ ] Footer plan matches footer PNG regions — not generic LinkList columns ([footer-from-screenshot.md](footer-from-screenshot.md))
- [ ] Header plan matches header PNG — Navigation placeholder + icon utility children ([header-from-screenshot.md](header-from-screenshot.md))
- [ ] Fixed two-column panels are not split into placeholder + child cards ([§10](#10-fixed-layout-slots-are-not-child-components))
- [ ] TSX plan: empty link href does not hide title/body/CTA label ([visual-fidelity.md](../../sitecore-rendering-host-skills/sitecore-component-from-design/references/visual-fidelity.md#empty-or-missing-link-href--still-render-visible-content))

---

## 7. Footer bands — screenshot-first, never generic

Footers are **high-variance**. Do not reuse patterns from other projects (e.g. JM3 `Footer` + `footer-links` + `LinkList`).

**Process:**

1. Open `footer-desktop.png` (and tablet/mobile).
2. Label every visual region: link columns, newsletter, contact panel, logos, legal bar, social icons.
3. Emit **one** Footer component with fields for each region — placeholders only if PNG shows **separate repeating column components**.
4. Validate plan against [footer-from-screenshot.md](footer-from-screenshot.md).

| Screenshot shows | Detection output |
|------------------|------------------|
| Inline links with icons under one heading | `EventLink1`–`N` fields on Footer — not LinkList |
| Colored contact panel with address/phone | Contact fields on Footer — not a separate component |
| Partner logo beside site logo | `PartnerLogo` Image field |
| Legal links + © + social row | `LegalLink*` + `Copyright*` + `SocialLink*` fields |

**Wrong:** `Footer` placeholder `footer-links` → 3× `LinkList` when PNG shows a single composite footer layout.

---

## 8. Header bands — screenshot-first, never generic

Headers are **high-variance**. Do not reuse JM2/JM3 “logo + flat nav links” without validating against header PNGs.

**Process:**

1. Open `header-desktop.png` (and tablet/mobile).
2. Label regions: logo, primary nav (dropdown chevrons?), utility icon+label column, language control.
3. **Header** → `header-nav` placeholder → **Navigation** child.
4. **Navigation** → main nav fields + **`header-utility` placeholder** → **HeaderIconLink** (or equivalent) for each FAQ/Contact/Search/… item.
5. Validate plan against [header-from-screenshot.md](header-from-screenshot.md) and [header-responsive-chrome.md](header-responsive-chrome.md).

| Screenshot shows | Detection output |
|------------------|------------------|
| Icon above label utility links | `HeaderIconLink` children — not `UtilityLink1` text fields |
| Primary nav with chevrons | Nav buttons with chevron icon in TSX |
| Logo + nav in one bar | Navigation in Header placeholder — not all markup in Header |
| Mobile burger + drawer | Separate mobile layout from desktop PNG |

**Wrong:** Copy `Navigation.tsx` field schema from another editing host when PNG shows icon utility row.

---

## 9. Page bands — one screenshot band = one component

Do **not** merge adjacent page bands into a single component because a sibling host did (e.g. `HomeHeroEventsSection` combining hero photo + events grid).

**Process:**

1. Read `page-decomposition.json` — each `sections[]` entry is one rendering on the page.
2. Open each `sectionFolder` PNG independently.
3. Build **separate** parent components with fields derived from **that** PNG only — [section-field-inventory-from-screenshot.md](../../sitecore-rendering-host-skills/sitecore-component-from-design/references/section-field-inventory-from-screenshot.md).

| Decomposition shows | Wrong | Correct |
|---------------------|-------|---------|
| `hero-banner` + `these-events-will-be-teaser-grid` | One `HomeHeroEventsSection` without images | `FullBleedHeroBannerSection` then `HomeHeroEventsSection` + cards |
| Hero PNG shows background + brand overlay | Title/Subtitle text fields only | `BackgroundImage` + `BrandImage` |
| Events PNG shows 6 logo tiles | Large calendar tile cards | `EventListCard` logo grid variant on home |

**Never** start implementation by copying TSX from `editing-hosts/jm2`, `jm3`, or another module — open **this** project's section PNGs first.

**Wrong:** Two `<Placeholder name={header-nav-…} />` in Header (desktop + mobile) — duplicates entire Navigation.

**Wrong:** Mixed breakpoints (769px `u-hide-*` + 1276px header) — tablet shows double chrome.

---

## 10. Fixed layout slots are not child components

Use a **placeholder + child card** only when the screenshot shows **authorable repeating tiles**: 2+ siblings that share the same structure **and** each tile is independently editable content (different title, image, link per tile).

**Do not** use placeholders when columns are **fixed layout roles** inside one editorial block:

| Screenshot shows | Wrong | Correct |
|------------------|-------|---------|
| Section title + background image + image column + text column + CTA | Parent grid + 2× child cards in placeholder | **One component** with `Title`, `BackgroundImage`, `Image`, `Body`, `Cta` |
| Hero with left copy + right image (single story) | Parent + ImageChild + TextChild | **One component** with all fields |
| Panel block with 2 columns (photo \| copy) | `TeaserGrid` + card × 2 | **One panel component** — columns are layout, not a list |
| 4 montage cards under one H2, each with own title/image/link | Placeholder + child card (optional) | **Numbered fields** (`Card1Title`…`Card4Cta`) on the parent when tile count is fixed on the page |

**Decision test (apply to any future screenshot):**

1. Count how many **distinct authorable stories** the band contains (not DOM columns).
2. If the answer is **1** → single datasource, all fields on the parent, **no placeholder**.
3. If the answer is **2+** and each story has the **same field shape** → numbered fields when count is **fixed on the page**, or placeholder + child card only when count **varies** at authoring time.
4. If columns differ only by **layout role** (image vs text) → one component, role-named fields — never child components.

**Signals for fixed layout (not a grid):** background on section wrapper; exactly two columns where one is media-only and one is prose + CTA; split/panel/horizontal-feature class patterns; section H2 scopes the whole band.

**Signals for background panel block (`BackgroundPanelSection`):** see [background-panel-block-fidelity.md](../../sitecore-rendering-host-skills/sitecore-component-from-design/references/background-panel-block-fidelity.md) — background photo visible **below** the inner solid card (keep band padding); image column **full height** of inner card; H2 outside inner row.

**Signals for a true repeating grid:** 3+ homogeneous tiles with the same card chrome; optional section H2 above the tile set only.

**Worked example (same page, two bands — different components):**

| Band | Visual | Wrong | Correct |
|------|--------|-------|---------|
| Core technical capabilities | Full-width background, H2, image \| text+CTA | `TitleDescriptionTeaserGridSection` + 2× child | `BackgroundPanelSection` |
| Explore more | H2 + 4 montage teaser tiles | Same as above | `TitleDescriptionTeaserGridSection` + `VerticalTeaserCard` placeholder |
