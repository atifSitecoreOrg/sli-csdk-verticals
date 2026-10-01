---
name: sitecore-component-from-design
description: Build one Sitecore Content SDK component from desktop/tablet/mobile screenshots. TSX markup and CSS classes must match section.html so rendered output is pixel-faithful to all three PNGs; section-plan.json defines fields, placeholders, and responsive behavior. Creates TSX variants and serialization YAML; runs npm run build before YAML push.
paths:
  - "**/src/components/**/*.tsx"
  - "**/*.module.json"
---

# Sitecore component from design upload

Build **one component** from visual design inputs. Produces TSX (with variants) + full Sitecore serialization YAML + seeded datasource/media content.

**Primary goal:** rendered output must match the **desktop, tablet, and mobile section screenshots**. When that component is placed on a page, the page must match the **full-page screenshots** for those viewports. See [screenshot-first.md](references/screenshot-first.md), [visual-fidelity.md](references/visual-fidelity.md), [captured-css-and-fonts.md](references/captured-css-and-fonts.md), **[section-field-inventory-from-screenshot.md](references/section-field-inventory-from-screenshot.md)**, and **[screenshot-done-gate.md](references/screenshot-done-gate.md)** — **open section PNGs, write the field inventory, and pass the done gate before marking complete or pushing YAML**.

**Supporting files (`section.html`, `section-plan.json`, `manifest.json`, `component-blueprint.json`, `site-summary.json`) help planning and content extraction — they do not override screenshot fidelity.** If a plan or sibling-project pattern contradicts the PNG, **correct the plan and reimplement from the capture** — do not ship a generic first pass.

**Implement using:** [`sitecore-content-sdk-component`](../sitecore-content-sdk-component/SKILL.md)

**Serialize using:** [`sitecore-new-rendering-yaml`](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md) · [`sitecore-new-site-yaml`](../../sitecore-serialization-skills/sitecore-new-site-yaml/SKILL.md) · validate/push via [`sitecore-new-collection-yaml`](../../sitecore-serialization-skills/sitecore-new-collection-yaml/SKILL.md)

**Partial/Page Designs:** ensure [`PartialDesignDynamicPlaceholder`](../sitecore-page-from-design/references/partial-design-dynamic-placeholder.md) exists in `editing-hosts/{app}/src/components/partial-design-dynamic-placeholder/` before Header/Footer YAML.

**Nested placeholders:** when TSX uses `<Placeholder>`, create project placeholder YAML **and** set **Placeholders** on the parent rendering — see [placeholder-settings.md](../sitecore-content-sdk-component/references/placeholder-settings.md).

**Internal navigation links (Header/Footer/LinkList):** same-origin hrefs in `section.html` define routes that must exist in the Sitecore content tree. Ensure stub page YAML exists for each linked path — see [site-structure-from-links.md](../sitecore-page-from-design/references/site-structure-from-links.md). **When writing datasource YAML, use `linktype="internal"` with item IDs from `site-content-tree.json` for every href that matches a tree route** — never production external URLs for those links.

**Media (orchestrate → delegate):** [references/media-orchestration.md](references/media-orchestration.md) → [`sitecore-media-from-url-yaml`](../../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md)

**Documentation:** MCP `search_sitecore_knowledge_sources` (`user-documentation`) for Content SDK field components and variants.

**Auth0 (Login / Register / Profile in upload):** [`sitecore-auth0-authentication`](../sitecore-auth0-authentication/SKILL.md)

**Screenshot capture from URLs:** [`url-screenshots`](../../mimic-website-skills/url-screenshots/SKILL.md) (full-page capture → `section-capture.mjs` → per-component crops + `sections/manifest.json`)

**Visual component detection:** [`visual-cms-component-detection`](../../mimic-website-skills/visual-cms-component-detection/SKILL.md) — classify section bands on screenshots

**Section decomposition:** [`sitecore-section-decomposition`](../sitecore-section-decomposition/SKILL.md) — use `component-blueprint.json` for Sitecore `cmsName`, fields, placeholders (not section folder names)

**HTML from URLs:** [`url-page-html`](../../mimic-website-skills/url-page-html/SKILL.md)

**Project isolation:** Build TSX and YAML only under the **current** editing host and `authoring/items/{this-module}/`. Do not import or wire artifacts from other hosts or modules — [project-isolation.md](references/project-isolation.md). **Another host’s Header/Footer/Navigation TSX is a pattern reference only — never copy as the first implementation.** Rebuild from **this** section PNGs + `section.html`.

**Repeating visual patterns:** 2+ identical siblings (icon links, cards, slides) → child component + `<Placeholder>` — [repeated-pattern-placeholders.md](references/repeated-pattern-placeholders.md).

---

## Design source

| Path | When |
|------|------|
| **Attached screenshots** | User uploads PNGs — use directly |
| **URL** | Run [`url-screenshots`](../../mimic-website-skills/url-screenshots/SKILL.md) → `section-capture.mjs`; use `sections/{name}/{name}-desktop.png` for the component |
| **Section manifest row** | `{project}/sections/manifest.json` → one `cmsName` entry |
| **New sections queue** | `{project}/{page-slug}/new-sections-manifest.json` → `componentsToBuild` (build only these) |
| **Section crop** | `{project}/sections/{folder-name}/{folder-name}-desktop.png` |

If manifest marks `parentSection`, this task is a **Card** inside that section's placeholder — not a standalone page band.

If manifest marks `placeholderFor`, this task is a **Section** with a Sitecore `<Placeholder>` for the named card component.

---

## Inputs

| Input | Required | Use |
|-------|----------|-----|
| Desktop screenshot | Recommended | `{project}/sections/{folder}/{folder}-desktop.png` from section capture |
| Tablet / mobile screenshot | Optional | `{folder}-tablet.png` / `{folder}-mobile.png` in same folder |
| `sections/manifest.json` | Global registry | `cmsName`, `folderName`, `type`, `selector`, `placeholderFor`, `parentSection`, `scope` |
| `sections/{folder}/section-plan.json` | Per section | **`implementationPlan`** — fields, placeholders, YAML artifacts, responsive notes |
| `sections/{folder}/section.html` | Per section | **Content extraction** — text, URLs, alt text, class name hints (not layout authority) |
| `sections/{folder}/*-desktop.png` | Per section | Primary visual target |
| `sections/{folder}/*-tablet.png` | Per section | Tablet layout verification |
| `sections/{folder}/*-mobile.png` | Per section | Mobile layout verification |
| `page-manifest.json` | Per page | Section order + which components appear on that route |
| `new-sections-manifest.json` | Per page | **`componentsToBuild`** — skip TSX when `buildComponent: false` |
| Component name | **`cmsName` from `section-plan.json` or `component-blueprint.json`** | e.g. `TitleDescriptionTeaserGridSection`, `VerticalTeaserCard` — section folder names are **not** rendering names; ask only if ambiguous |
| Target app folder | Discover from workspace | e.g. `industry-verticals/{app}/` |

---

## Step 1 — Classify component

**Reuse gate:** Read `{project}/{page-slug}/new-sections-manifest.json`. If this `cmsName` is not in `componentsToBuild` and `buildComponent` is false → **stop** — wire existing rendering in page YAML only. See [component-reuse-validation.md](references/component-reuse-validation.md).

Run [`visual-cms-component-detection`](../../mimic-website-skills/visual-cms-component-detection/SKILL.md) on the section crop if `cmsName` is generic or missing.

Use manifest `cmsName` and [naming taxonomy](../../mimic-website-skills/visual-cms-component-detection/references/naming-taxonomy.md) first:

| Manifest signal | Sitecore component |
|-----------------|-------------------|
| `cmsName: Header` | `Header` (+ nav placeholder) |
| `cmsName: Navigation` | `Navigation` (primary nav; often sticky) |
| `cmsName: Footer` | `Footer` |
| `cmsName: CookieBanner` | Layout overlay / sticky banner component |
| `cmsName: HeroBanner` / `HeroCarousel` | `HeroBanner` / `HeroCarousel` |
| `cmsName: StatsBar` | `StatsBar` (+ `StatsItem` placeholder) |
| `cmsName: RichTextImageBlock` | Editorial image + text section |
| `cmsName: VerticalTeaserGrid` | Grid section + `VerticalTeaserCard` placeholder |
| `cmsName: HorizontalLinkCardGrid` | Grid section + `HorizontalLinkCard` placeholder |
| `cmsName: OverlayPromoCardGrid` | Grid section + `OverlayPromoCard` placeholder |
| `type: grid` + `placeholderFor: XxxCard` | `{Grid}` with `<Placeholder>` |
| `type: card` + `parentSection` | `{Card}` (child in placeholder) |

When a parent band contains **2+ repeated child blocks** with the same visual structure, build **both** parent grid/section and child card — see [card type definitions](../../mimic-website-skills/visual-cms-component-detection/references/naming-taxonomy.md#card-type-definitions).

Also apply rules from [component-types](../sitecore-content-sdk-component/references/component-types.md) for edge cases.

Apply [boundary-rules §10](../../mimic-website-skills/visual-cms-component-detection/references/boundary-rules.md#10-fixed-layout-slots-are-not-child-components) before choosing placeholders — fixed two-column panels are one component, not a card grid.

When `cmsName` is **`BackgroundPanelSection`** (or HTML shows `panel_block` / `jmpanelblock`), follow **[background-panel-block-fidelity.md](references/background-panel-block-fidelity.md)** — layered background band + inner card row, preserve bottom padding, full-height image column.

When implementing TSX, follow [visual-fidelity.md](references/visual-fidelity.md): empty link hrefs must not suppress visible copy; Multi-Line Text must not go through `<RichText>` alone.

---

## Step 2 — Extract content inventory

From **section crop PNGs** (visual) and **`section.html`** (text/URLs only), produce a table before coding — follow **[section-field-inventory-from-screenshot.md](references/section-field-inventory-from-screenshot.md)**:

| UI element | Proposed field name | Field type | Default value (from design) |
|------------|---------------------|------------|---------------------------|
| Hero background photo | BackgroundImage | Image | (URL from section.html) |
| Brand overlay | BrandImage | Image | (URL from section.html) |
| Section heading | Title | Single-Line Text | (exact string) |
| … | … | … | … |

**Every visible image in the PNG must appear as an Image field.** Include aria labels, button text, link URLs, alt text. **Every row becomes a Sitecore field and a datasource YAML value.**

**One `page-decomposition.json` section band → one parent component.** Do not merge hero + grid into one component because another editing host did.

**Event detail pages (calendar slug):** use the **full slug `page.html`** as layout authority — [event-detail-from-screenshot.md](references/event-detail-from-screenshot.md). Do not ship generator-default `.rai-event-detail-*` BEM.

---

## Step 3 — Resolve assets (orchestrate media YAML)

Follow [media-orchestration.md](references/media-orchestration.md):

1. Collect image URLs + alt text from HTML/inventory for **this component only**.
2. Resolve relative paths to absolute URLs (ask for base URL if needed).
3. Build the asset manifest table (field → URL → alt).
4. Discover `MediaRoot`, `SiteMediaPath`, `SiteRootItemId` from `*.module.json`.
5. **Delegate** download + media YAML creation to [`sitecore-media-from-url-yaml`](../../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md) via `create-media-from-urls.ps1`.
6. Apply returned `MediaId` values to Image fields in default datasource YAML (`<image mediaid="…" />`).

Do **not** download assets or write media YAML inline in this skill — orchestrate only.

---

## Step 4 — Match screenshots (required before TSX)

**Stop:** Open all three section PNGs now. If you have not viewed them in this task, do not write TSX yet — [screenshot-done-gate.md](references/screenshot-done-gate.md).

Follow [screenshot-first.md](references/screenshot-first.md) and [visual-fidelity.md](references/visual-fidelity.md):

1. Open `{sectionFolder}-desktop.png`, `-tablet.png`, `-mobile.png` — **these are the layout authority**.
2. Read `section-plan.json` → `implementationPlan` for fields, placeholders, and YAML artifacts to create.
3. Use `section.html` only to extract copy, asset URLs, and **class names to port** (must match PNGs).
3b. Wire fonts from `site-summary.json` and port CSS per [captured-css-and-fonts.md](references/captured-css-and-fonts.md). **CSS `@import` for web fonts must be the first rule in the site stylesheet** (before `:root`) — misplaced `@import` breaks Next.js with a 500 on editing render.
4. Document responsive deltas (grid columns, accordion, carousel, stack order) from PNG comparison before coding.

| Breakpoint | Source | Implement |
|------------|--------|-----------|
| Desktop | `*-desktop.png` | Default layout |
| Tablet | `*-tablet.png` + `responsiveLayout.tablet` | Media queries / `u-hide-*` |
| Mobile | `*-mobile.png` + `responsiveLayout.mobile` | Accordion, stack, burger nav |

Use a project stylesheet with class names that reproduce the screenshot layout. Reuse BEM names from `section.html` when they help match PNGs — do not copy HTML structure if it would diverge from the screenshots.

When `section.html` uses `u-hide-mobile` / `u-hide-desktop`, mirror those classes in TSX and ensure the shared stylesheet defines utilities with `!important` so component BEM rules (e.g. `.s2c__col__img { display: block }`) do not override hide/show — see [visual-fidelity.md — Responsive utility classes](references/visual-fidelity.md#responsive-utility-classes-u-hide-).

---

## Step 5 — Implement (delegate to core skill)

Execute [`sitecore-content-sdk-component`](../sitecore-content-sdk-component/SKILL.md) checklist.

**TSX layout comes from section PNGs**, not from `section.html`. Use SDK field components (`<Text>`, `<FieldImage>`, `<SitecoreLink>`, `<Placeholder>`) on nodes that match authored content. See [tsx-pattern.md](../sitecore-content-sdk-component/references/tsx-pattern.md) for Sitecore patterns only.

**Nested placeholders:** set rendering **Placeholders** (Layout Service Placeholders) to placeholder-setting GUID(s) — see [placeholder-settings.md](../sitecore-content-sdk-component/references/placeholder-settings.md).

**Placeholder layout (critical):** repeating cards/tiles/slides are separate Sitecore renderings. The **parent section must supply the grid/flex shell inside `<Placeholder render={…}>`** — CSS Grid or scoped flex on the wrapper returned from `render`, with optional per-child cell divs. Do **not** put `<Placeholder />` inside `.row` and expect `col-md-6` on mapped children to form a grid (editing chrome and SDK wrappers break that DOM). See [placeholder-layout.md](../sitecore-content-sdk-component/references/placeholder-layout.md) and montage example in [teaser-grid-archetypes.md](references/teaser-grid-archetypes.md).

1. TSX matching section PNGs + `Default`, `Inversed`, `ImageTop`, `Animated` only
2. Component map registration
3. **`npm run build`** in the rendering host — **fix all errors** before continuing
4. Template branch YAML — run generator or follow [rendering-structure.md](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/references/rendering-structure.md) — **fresh UUIDs** per item
5. Rendering + **project placeholder-setting** YAML when TSX uses `<Placeholder>`; set rendering **Placeholders** field
6. Headless variant YAML for **`Default`, `Inversed`, `ImageTop`, `Animated`** only
7. Default datasource YAML — values from content inventory (HTML + PNGs)
8. Media YAML for every image ([media-orchestration.md](references/media-orchestration.md))
9. Available Renderings update
10. `validate --fix` → `push`
11. **`npm run build`** again — confirm still passes

---

## Step 6 — Variant selection from design

**Standard variants only** (create Headless Variant YAML for each):

| Export | Sort | When |
|--------|------|------|
| `Default` | 100 | Always — includes carousel/slider behavior when screenshot shows a carousel |
| `Inversed` | 200 | Mirrored horizontal layout (image left ↔ right) |
| `ImageTop` | 300 | Image above text stack |
| `Animated` | 400 | Motion / stagger |

**Do not** create a `Carousel` Headless Variant. Carousels use **Embla** in `Default` with placeholder children as slides — see [screenshot-first.md](references/screenshot-first.md).

| Design signal | Implementation |
|---------------|----------------|
| Horizontal slides, dots, arrows | `Default` + Embla + `<Placeholder>` for slide cards; static track until client mount (see screenshot-first SSR section) |
| Full-bleed hero slides | `Default` section + slide card with Image field + `FieldImage` mode `cover` |
| Image fills frame | [image-display-modes.md](references/image-display-modes.md) |
| Sticky cookie bar | `CookieBanner` on **Partial Design** — Accept dismisses via client state |

---

## Step 7 — Deliverable checklist

- [ ] Layout matches **desktop, tablet, and mobile** section PNGs (component checkpoint)
- [ ] **Full-page PNGs** match live route at all breakpoints — **primary done gate** — [page-assembly-fidelity.md](references/page-assembly-fidelity.md)
- [ ] Wrapper sections with placeholders: parent owns slide/column shells — [page-assembly-fidelity.md](references/page-assembly-fidelity.md#wrapper-sections--placeholder-children)
- [ ] Two-column text+media/video bands are **standalone** sections, not grid placeholders — [standalone-vs-placeholder.md](references/standalone-vs-placeholder.md)
- [ ] Column-split bands use explicit layout CSS at desktop breakpoint — [column-split-layouts.md](references/column-split-layouts.md)
- [ ] Image+text sections: grepped `section.html` for layout archetype (s2c vs jmrich float-wrap) before TSX — [layout-archetype-detection.md](references/layout-archetype-detection.md)
- [ ] Image/video frames: aspect-ratio + object-fit from section PNG + captured CSS — [media-frame-fidelity.md](references/media-frame-fidelity.md)
- [ ] Background panel block: layered band padding + full-height image column — [background-panel-block-fidelity.md](references/background-panel-block-fidelity.md)
- [ ] `section-plan.json` `implementationPlan` fields/placeholders/YAML artifacts implemented
- [ ] Rendering **Placeholders** field set when using nested `<Placeholder>`
- [ ] All variants: `Default`, `Inversed`, `ImageTop`, `Animated` only (no `Carousel` variant)
- [ ] Carousel sections use Embla in `Default` with `useClientMounted()` (no hydration mismatch on nav/dots)
- [ ] `u-hide-*` pairs verified at mobile and desktop breakpoints (only one node visible each)
- [ ] TSX file(s) with SDK field components (no hardcoded production copy)
- [ ] All variants exported with **visually distinct** layouts
- [ ] Template + rendering + placeholder + variant + datasource YAML
- [ ] Media YAML for every image
- [ ] General Link CTAs: inner markup + `showLinkTextWithChildrenPresent` when text and icon coexist — [visual-fidelity.md](references/visual-fidelity.md#general-link-cta-fields--inner-markup-patterns)
- [ ] Panel/tile arrow CTAs: one decorator `<SitecoreLink>` only — do not duplicate overlay `text-panel-full-link` from capture — [dual-link-cta-patterns.md](references/dual-link-cta-patterns.md)
- [ ] No duplicate field bindings — each field once in TSX unless `u-hide-*` pair — [visual-fidelity.md](references/visual-fidelity.md#field-to-dom-mapping-one-field-one-node)
- [ ] Default datasource matches screenshot text verbatim
- [ ] Web fonts loaded with `@import` at **top** of site CSS (or via `<link>` / `next/font`) — [captured-css-and-fonts.md](references/captured-css-and-fonts.md#css-import-placement-nextjs--postcss--mandatory)
- [ ] **Screenshot done gate passed** — [screenshot-done-gate.md](references/screenshot-done-gate.md)
- [ ] Header/Footer chrome: one parent placeholder, nested keys verified — [header-responsive-chrome.md](../../mimic-website-skills/visual-cms-component-detection/references/header-responsive-chrome.md)
- [ ] Same-origin General Link fields use `linktype="internal"` + item `id` when route exists in `site-content-tree.json` — [site-structure-from-links.md](../sitecore-page-from-design/references/site-structure-from-links.md)
- [ ] `npm run build` passes

---

## Do not

- Let `section.html` DOM structure override section PNG layout
- Ship generic placeholder UI that does not match section screenshots
- Skip tablet/mobile PNG review when those files exist
- Create a `Carousel` Headless Variant — use Embla in `Default` instead
- Omit rendering **Placeholders** field when TSX uses `<Placeholder>`
- Omit media YAML or leave `{MEDIA:…}` placeholders in datasource items
- Add component CSS with `display` on selectors shared with `u-hide-*` without keeping utilities authoritative (`!important`) — causes both mobile/desktop nodes to render
- Proceed to YAML push while `npm run build` fails
- Hardcode design copy only in TSX — mirror in YAML datasource
- Skip mobile layout when mobile screenshot provided
- Download assets from domains the user did not supply
- Reference client-specific serialization paths — use module.json discovery
- Copy TSX, component-map entries, templates, renderings, datasources, or GUIDs from another editing host or authoring module — [project-isolation.md](references/project-isolation.md)
- Assume `ImageRichTextSection` (or any shared cmsName) uses the same DOM on every site — detect layout archetype from **this** section's HTML — [layout-archetype-detection.md](references/layout-archetype-detection.md)
- Assume `TitleDescriptionTeaserGridSection` + `VerticalTeaserCard` always use one fixed markup — detect the actual archetype from **this** section's HTML — [teaser-grid-archetypes.md](references/teaser-grid-archetypes.md)
- Add `@import url('…')` for web fonts **after** `:root` or other CSS rules — PostCSS fails and Next.js returns 500 — [captured-css-and-fonts.md](references/captured-css-and-fonts.md#css-import-placement-nextjs--postcss--mandatory)
- Ship Header/Footer/Navigation from a **sibling editing host** without opening **this** section PNGs — [project-isolation.md](references/project-isolation.md), [screenshot-done-gate.md](references/screenshot-done-gate.md)
- Use flat `UtilityLink1`–`UtilityLinkN` text fields when PNG shows **icon+label** utility columns — use child component + placeholder — [header-from-screenshot.md](../../mimic-website-skills/visual-cms-component-detection/references/header-from-screenshot.md), [repeated-pattern-placeholders.md](references/repeated-pattern-placeholders.md)
- Mark component done when only `npm run build` passes — must pass [screenshot-done-gate.md](references/screenshot-done-gate.md)
- Call the same chrome `<Placeholder>` twice in Header (desktop + mobile bars) — duplicates Navigation — [header-responsive-chrome.md](../../mimic-website-skills/visual-cms-component-detection/references/header-responsive-chrome.md)

---

## When HTML is missing

Rely on screenshot OCR/visual analysis for text; label uncertain strings with `[confirm]` in the inventory and ask user before finalizing datasource YAML.
