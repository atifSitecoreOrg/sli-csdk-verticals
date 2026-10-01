---
name: sitecore-section-decomposition
description: After section screenshots are stored under design-screenshots/{domain}/sections, decompose each section into Sitecore Next.js components (section + optional placeholder child cards). Produces component-blueprint.json and per-page page-decomposition.json with meaningful reusable component names, fields, placeholders, and four variants. Use after url-screenshots section-capture, before sitecore-component-from-design or sitecore-page-from-design build phases.
paths:
  - "**/design-screenshots/**/sections/**"
  - "**/component-blueprint.json"
  - "**/page-decomposition.json"
---

# Sitecore section decomposition

**Runs after** [`url-screenshots`](../../mimic-website-skills/url-screenshots/SKILL.md) section capture and [`visual-cms-component-detection`](../../mimic-website-skills/visual-cms-component-detection/SKILL.md).

**Feeds into** [`sitecore-component-from-design`](../sitecore-component-from-design/SKILL.md) and [`sitecore-page-from-design`](../sitecore-page-from-design/SKILL.md).

---

## Two naming layers (do not confuse)

| Layer | Purpose | Example | Where stored |
|-------|---------|---------|----------------|
| **Section screenshot name** | Folder + crop label from visual band detection | `be-the-answer-your-feature-carousel` | `sections/{folder-name}/` |
| **Sitecore component name** | Reusable rendering / template name (structure-based) | `EyebrowTitleCarouselSection`, `FeatureCarouselCard` | `component-blueprint.json` |

A section folder named after page copy (e.g. `how-leading-analysts-rate-signpost-section`) maps to semantic Sitecore components (e.g. `LogoTitleCtaSignpostSection` + `HorizontalLinkCard`).

---

## Pipeline position

```
1. Full-page capture (desktop/tablet/mobile + HTML)
      ↓
2. Visual section detection on page screenshots
      ↓
3. Section crops → design-screenshots/{domain}/sections/{folder-name}/
      ↓
4. sections/manifest.json + {page-slug}/page-manifest.json
      ↓
5. THIS SKILL — decompose each section → Sitecore component blueprint
      ↓
6. Build TSX + YAML (sitecore-component-from-design)
```

**Agent rule:** Do not build TSX until `component-blueprint.json` exists for the project (or user explicitly skips decomposition).

---

## When to apply

| Trigger | Action |
|---------|--------|
| `section-capture.mjs` finished | Run `decompose-sections.mjs` or manual decomposition |
| User asks what Sitecore components a page needs | Read section crops + manifest → output blueprint |
| `sitecore-page-from-design` Phase 1 | Use `page-decomposition.json` for page assembly |
| `sitecore-component-from-design` | Use blueprint `cmsName`, not screenshot folder name |

---

## Step 1 — Confirm section inventory

Read:

- `{project}/sections/manifest.json` — global section registry
- `{project}/{page-slug}/page-manifest.json` — section order per page
- **`{project}/sections/{folder}/section-plan.json`** — per-section build plan (review before TSX/YAML)
- Sticky overlay PNGs: `{folder-name}-desktop.png` (no `-clean` suffix)
- Content section PNGs: `{folder-name}-desktop-clean.png` (+ tablet/mobile `-clean`)
- Full-page clean reference: `{page-slug}/desktop-clean.png`

Site chrome (if captured): `top-bar/`, `header/`, `navigation/`, `footer/`, `cookie-banner/`.

---

## Step 2 — Analyze each section screenshot

For **each** section crop (desktop first; tablet/mobile for layout notes):

1. Identify **section-level fields** visible in the band:
   - Eyebrow / kicker / overline
   - Title (H1–H3)
   - Subtitle
   - Description / body
   - Primary CTA, secondary CTA, section-level “see all” CTA
   - Background image / inline image (section-owned, not card-owned)

2. Confirm you are analyzing the correct screenshot set:
   - `captureMode: overlay` or `isStickyOverlay: true` → overlay PNG
   - Content sections → `-clean` PNG only
3. Identify **repeated child pattern** inside the section:
   - **Full-bleed hero carousel** (`.owl-carousel`, `.slick-slider`, large `background-image` slides) — **not** a card grid; see [composite-hero-band.md](references/composite-hero-band.md)
   - Teaser carousel (prev/next arrows + small, similar cards in a compact carousel track)
   - Static grid (2+ similar tiles, no arrows)
   - Vertical list of horizontal rows (signpost)
   - Stats row
   - None (single editorial block)

3b. **Composite hero band** — when one section crop contains **both** a full-width slider **and** a `.panels-hero-panels` (or similar) row with news/promo/stats columns, emit **`compositeBand: true`** in `page-decomposition.json` with ordered `subComponents`. Do **not** classify the whole band as `HorizontalLinkCardGrid` because only the panel columns repeat.

3c. **Text + video/image split** — when `section.html` has two fixed columns with **different** markup (e.g. `jmrich--text-inner` + `jmvideotempl`, or text + static image), emit a **standalone** section with `placeholderKey: null`. Do **not** treat column count as `repeatCount` for a card grid. Implement desktop side-by-side layout per [column-split-layouts.md](../sitecore-component-from-design/references/column-split-layouts.md). See [standalone-vs-placeholder.md](../sitecore-component-from-design/references/standalone-vs-placeholder.md).

**Project isolation:** Decomposition output must reference component names for the **current** project only — never point page YAML at renderings or datasources from another module. See [project-isolation.md](../sitecore-component-from-design/references/project-isolation.md).

3. For each repeated child, infer **card fields** from one representative tile:
   - Image, logo, tag, title, body, CTA, link

4. Choose **Sitecore component names** from structure — see [section-to-sitecore-mapping.md](references/section-to-sitecore-mapping.md).

---

## Step 3 — Emit parent + child components

When children repeat (carousel, grid, list, stats):

| Role | Sitecore component | Placeholder |
|------|-------------------|-------------|
| **Parent section** | `{Structure}Section` with section fields | `<Placeholder name="{semanticKey}-{DynamicPlaceholderId}" />` |
| **Child card** | `{Structure}Card` with tile fields | Slotted in parent placeholder |

**Placeholder key pattern:** `{semantic-kebab}-{DynamicPlaceholderId}`  
Examples: `carousel-slides-{*}`, `teaser-cards-{*}`, `signpost-cards-{*}`, `stats-items-{*}`

---

## Step 4 — Variants (required for every component)

Every Sitecore component gets **four base variants**:

| Variant | Use |
|---------|-----|
| `Default` | Match section screenshot |
| `Inversed` | Mirror horizontal layout |
| `ImageTop` or `ImageBottom` | Stack image above/below copy |
| `Animated` | Subtle motion; respect `prefers-reduced-motion` |

**Section components with a `<Placeholder>`** also get:

| Variant | Use |
|---------|-----|
| `Carousel` | Horizontal track for slide/card placeholder |

See [`sitecore-content-sdk-component`](../sitecore-content-sdk-component/references/component-types.md).

---

## Step 5 — Page decomposition

For each page, record which section components appear and what fills each placeholder.

Output: `{page-slug}/page-decomposition.json` — schema in [page-decomposition-format.md](references/page-decomposition-format.md).

This file drives **page content item creation**: which renderings to add, in order, with which child renderings in placeholders.

---

## Step 6 — Write global blueprint

Output: `{project}/sections/component-blueprint.json` — schema in [component-blueprint-format.md](references/component-blueprint-format.md).

Deduplicate by Sitecore `cmsName` across pages. One `FeatureCarouselCard` blueprint even if used on multiple pages.

---

## Automated decomposition

```bash
node .cursor/skills/sitecore-rendering-host-skills/sitecore-section-decomposition/scripts/decompose-sections.mjs \
  --project "./design-screenshots/matthey-com"
```

The script applies structural rules from the manifest (`type`, `placeholderFor`, `componentType`). **Review and refine** with visual analysis when `confidence` is `medium` or `low`.

---

## Hand off

| Next | Skill |
|------|-------|
| Build one component | [`sitecore-component-from-design`](../sitecore-component-from-design/SKILL.md) — use blueprint `cmsName` |
| Build full page | [`sitecore-page-from-design`](../sitecore-page-from-design/SKILL.md) — use `page-decomposition.json` |
| Re-capture sections | [`url-screenshots`](../../mimic-website-skills/url-screenshots/SKILL.md) |

---

## Do not

- Use section screenshot folder names as Sitecore rendering names
- Skip child card blueprints when `placeholderFor` is set
- Omit placeholders when 2+ similar tiles appear inside a section
- Build page content without `page-decomposition.json` section order + placeholder children
- Map a full-bleed hero slider to `EyebrowTitleCarouselSection` + `FeatureCarouselCard` when slides use **background images** — use `FullBleedHeroCarouselSection` + `HeroSlideCard` with **Image** field
- Flatten composite hero bands (carousel + news panels + share price) into a single grid section
