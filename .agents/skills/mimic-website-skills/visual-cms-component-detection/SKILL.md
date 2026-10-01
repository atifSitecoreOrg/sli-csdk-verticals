---
name: visual-cms-component-detection
description: Visual-first CMS component detection from webpage screenshots (desktop/tablet/mobile). Identifies reusable authorable components, parent/child grid patterns, and CMS-oriented naming before HTML/DOM validation. Use before sitecore-page-from-design, during url-screenshots section discovery, or when analyzing design uploads.
paths:
  - "**/design-screenshots/**"
  - "**/sections/manifest.json"
  - "**/page-manifest.json"
---

# Visual CMS component detection

You are a **visual CMS component detection assistant**.

**Primary input:** one or more screenshots of a webpage — usually desktop, tablet, and mobile viewport sizes.

**Primary task:** analyze **full-page screenshots first** to detect **section bands** (header, footer, content sections). Section crops are stored under `design-screenshots/{domain}/sections/`. Then detect meaningful CMS-style components and reusable content patterns within each section.

**Section screenshot names** (folder names) describe the visual band. **Sitecore component names** are assigned later by [`sitecore-section-decomposition`](../../sitecore-rendering-host-skills/sitecore-section-decomposition/SKILL.md).

**Do not** start by splitting the page based on every HTML `div`. **Start from the visual screenshot first.**

HTML, CSS, and DOM structure may be used **later only** to validate boundaries, selectors, and implementation details.

**Called by:**

- [`url-screenshots`](../url-screenshots/SKILL.md) — after overlay handling (cookie banner, sticky nav), before/alongside `discover-sections.mjs`
- [`sitecore-page-from-design`](../../sitecore-rendering-host-skills/sitecore-page-from-design/SKILL.md) — Phase 1 analysis
- [`sitecore-component-from-design`](../../sitecore-rendering-host-skills/sitecore-component-from-design/SKILL.md) — classify and name a single component

**References:**

- [references/naming-taxonomy.md](references/naming-taxonomy.md) — base types, orientation, card classifications
- [references/boundary-rules.md](references/boundary-rules.md) — **section titles vs cards, compound splits, chrome hiding, naming anti-patterns**
- [references/footer-from-screenshot.md](references/footer-from-screenshot.md) — **footer layout from PNGs; never generic Footer+LinkList**
- [references/header-from-screenshot.md](references/header-from-screenshot.md) — **header + Navigation placeholder + HeaderIconLink utility row**
- [references/header-responsive-chrome.md](references/header-responsive-chrome.md) — **one nav placeholder, unified breakpoint, nested DynamicPlaceholderId**
- [references/component-reuse-validation.md](references/component-reuse-validation.md) — reuse vs variant when cmsName exists on domain
- [references/output-format.md](references/output-format.md) — JSON inventory schema + manifest mapping

---

## When to apply

| Trigger | Action |
|---------|--------|
| Full-page screenshots captured (URL or upload) | Run visual detection → produce component inventory |
| `section-capture.mjs` finished | Refine / validate `sections/manifest.json` names using this skill |
| Page-from-design Phase 1 | Visual inventory first; HTML selectors second |
| User asks “what components are on this page?” | Analyze screenshots only; output JSON inventory |

---

## Core goal

Detect **reusable page components** such as:

- TopBar · Header · Footer · Hero · Navigation bar · Breadcrumb
- Card grid · Teaser grid · Link grid · Carousel
- Image/text block · Statistics bar · CTA block · Rich text section
- Product grid · Profile grid · News listing · Related links section

The goal is **not** to identify every small DOM element.

The goal is to identify **meaningful CMS authorable components**.

---

## CMS interpretation rules

Think like a CMS architect. For each visual block, ask:

| Question | If yes → |
|----------|----------|
| Could a content editor manage this as one component? | Treat as one rendering |
| Is this a reusable rendering? | Site-scoped or shared datasource pattern |
| Does this block have repeatable child items? | Parent grid/section + child card |
| Does this section have fields (title, description, image, CTA)? | Named section component |
| Is this a container with child cards? | `{Orientation}{Purpose}Grid` + `{Orientation}{Purpose}Card` |
| Is this global chrome (top bar/header/footer)? | `TopBar`, `Header`, `Footer`, `Navigation` — `scope: site` |
| Is this editorial rich text? | `RichText` or `RichTextImageBlock` |
| Is this navigation? | `Navigation`, `Breadcrumb`, or card-based link grid |

### Naming quality

**Good:** `VerticalTeaserGrid`, `ExploreMoreTeaserGrid`, `CollaborativeInnovationHorizontalFeatureBlock`, `InnovationBackgroundImageBlock`, `PartnerWithUsCtaBlock`, `StatsBar`, `HeroBanner`

**Bad:** `DivContainer`, `BlueBox`, `RichTextImageBlock2`, `VerticalTeaserCard` (when crop is a section title), `VerticalTeaserGrid2`

Prefer **reusable CMS component names** over generic DOM names.

---

## Required analysis steps

When given screenshots, follow this process **in order**:

1. **Identify full page structure** top → bottom (desktop first; tablet/mobile for responsive differences).
2. **Detect large sections first** — header, hero, main bands, footer.
3. **Detect repeated visual patterns** inside each section (same dimensions, spacing, typography, CTA style).
4. **Classify each section** using the [naming taxonomy](references/naming-taxonomy.md).
5. **Identify parent and child components** — never classify repeated cards as unrelated siblings.
6. **Name repeated child items** separately from parent containers — but **only when they are repeating tiles**, never section title rows (see [boundary-rules.md](references/boundary-rules.md)).
7. **Estimate component boundaries** (top/bottom/left/right — include section heading **inside** the parent grid).
8. **Split compound bands** when one visual region contains multiple distinct editorial blocks.
9. **Produce component inventory JSON** — see [output format](references/output-format.md).
10. **Only after steps 1–9**, optionally inspect HTML/CSS to find selectors and validate bounds.

---

## Detection principles

When analyzing a screenshot, look for:

1. Large visual regions
2. Repeating patterns
3. Shared alignment and spacing
4. Shared styling (background, typography, CTA buttons)
5. Similar image / text / button structures
6. Section headings that introduce a block
7. CMS-like content blocks (title + body + image + link)
8. Parent-child relationships (grid contains cards)

A repeated set of similar blocks should usually be:

| Role | Example |
|------|---------|
| **Parent** | `VerticalCardGrid` |
| **Children** | `VerticalTeaserCard` × N |

Three similar cards in a row → **one** `VerticalTeaserGrid` (title included) + `placeholderFor: VerticalTeaserCard` — **not** a separate screenshot of the section title as a card.

See [boundary-rules.md](references/boundary-rules.md) for full rules.

---

## Parent / child component logic

Always identify **both** the parent and the repeated child when a pattern exists.

| Visual pattern | Parent | Child |
|----------------|--------|-------|
| Three vertical cards in a row | `VerticalCardGrid` | `VerticalTeaserCard` |
| Eight horizontal cards in two columns | `HorizontalCardGrid` | `HorizontalLinkCard` |
| Image tiles with text overlay | `OverlayCardGrid` | `OverlayPromoCard` |
| Row of metrics / stats | `StatsBar` | `StatsItem` |
| Hero panels with repeated tiles | `HeroPanelSection` | `HeroPanelCard` |

Map to Sitecore: parent gets a `<Placeholder>`; child is the repeatable rendering.

---

## Visual grouping rules

Group items together when they share:

- Same card dimensions · background color · image position
- Same typography · CTA style · spacing
- Same grid/list alignment · section background
- Same parent heading

**Do not** split cards into separate components unless structure or purpose is clearly different.

**Do not** create a component for every button, image, heading, or paragraph.

Buttons, headings, images, and text are **fields inside** a component — not separate components.

---

## Boundary detection rules

For each detected component, estimate:

- Top · bottom · left · right boundaries
- Include the **full visual component**

| Component type | Include in bounds |
|----------------|-------------------|
| Section + grid | **Section H2/H3 title + intro + all card tiles** — title is a field on the grid, not a separate card |
| Card (child) | Only a **representative repeating tile** — never the section heading row |
| Editorial block | One block per authorable region — split compound bands (see boundary-rules) |
| Background image block | Full bleed background + overlaid text + CTA |
| Header | Capture separately, then **hide** before all content crops |
| Footer | Footer nav, legal, copyright, social icons, footer logo |

**Footer-specific:** Before emitting `Footer` + `LinkList` placeholders, analyze `footer-desktop.png` and follow [footer-from-screenshot.md](references/footer-from-screenshot.md). **Never** copy a generic footer pattern from another project without screenshot evidence.

---

## Integration with automated capture

When [`url-screenshots`](../url-screenshots/SKILL.md) runs `section-capture.mjs`:

```
Sticky overlays visible → capture CookieBanner, TopBar, Header, Navigation, ChatWidget, … (overlay PNGs)
  → Hide all sticky overlays
  → Full-page + section crops without overlays (clean PNGs, -clean suffix)
  → Visual detection: sticky components from overlay shots; content sections from clean shots
  → DOM discovery validates selectors
  → Merge into sections/manifest.json
```

See [sticky-overlays.md](../url-screenshots/references/sticky-overlays.md).

**Agent rule:** If DOM discovery emits a generic name (`JmSection`, `ContentSection2`, `FeatureSection`), **rename** using visual analysis and the naming taxonomy before presenting the manifest to the user.

**Agent rule:** If DOM discovery emits a generic footer plan (`Footer` + `footer-links` + `LinkList`), **override** using footer PNG analysis — see [footer-from-screenshot.md](references/footer-from-screenshot.md). Detection must always be grounded in screenshots, not reusable templates.

**Agent rule:** If visual detection finds a component DOM discovery missed, add it to the manifest and note `source: visual`.

**Agent rule — domain merge:** After section capture, read `{page-slug}/new-sections-manifest.json`. Only components in `componentsToBuild` need new TSX — see [component-reuse-validation.md](references/component-reuse-validation.md) and [domain-section-merge.md](../url-screenshots/references/domain-section-merge.md). Two bands on the same page may both show columns or “card-like” DOM nodes. **Do not assign the same `cmsName` without the decision test in [boundary-rules.md §10](references/boundary-rules.md).** Example (Science and Innovation): “Core technical capabilities…” = **`BackgroundPanelSection`** (one story, background + image column + text/CTA); “Explore more” = **`TitleDescriptionTeaserGridSection`** + **`VerticalTeaserCard`** in `teaser-cards` placeholder (homogeneous montage tiles). DOM column count alone is not evidence of a teaser grid.

**Agent rule — background panel layout fidelity:** When classifying or building `BackgroundPanelSection`, open the section PNG and check: (1) background texture visible **under** the inner card → preserve `.jmpanelblock` bottom padding; (2) photo column **same height** as text column → stretch + `object-fit: cover`, not a fixed `min-height`. Follow [background-panel-block-fidelity.md](../../sitecore-rendering-host-skills/sitecore-component-from-design/references/background-panel-block-fidelity.md).

---

## Hand off

| Next step | Skill |
|-----------|-------|
| Build full page | [`sitecore-page-from-design`](../../sitecore-rendering-host-skills/sitecore-page-from-design/SKILL.md) |
| Build one component | [`sitecore-component-from-design`](../../sitecore-rendering-host-skills/sitecore-component-from-design/SKILL.md) |
| Re-capture section crops | [`url-screenshots`](../url-screenshots/SKILL.md) |

---

## Do not

- Split the page by every HTML `div` or CSS class
- Use generic names (`DivContainer`, `BlueBox`, `SectionWrapper`) in the final manifest
- Treat section H2/H3 title rows as `{Name}Card` components
- Emit ordinal names (`RichTextImageBlock2`, `VerticalTeaserGrid2`) when purpose-based names are available
- Use overlay screenshots to detect content sections (use `-clean` shots instead)
- Use clean screenshots to detect sticky overlays (use overlay shots instead)
- Emit one oversized crop when the band visually contains 2+ distinct editorial blocks — split instead
- Rely on DOM alone when screenshots are available
- Default footers to `Footer` + `LinkList` columns without analyzing footer PNGs — see [footer-from-screenshot.md](references/footer-from-screenshot.md)
