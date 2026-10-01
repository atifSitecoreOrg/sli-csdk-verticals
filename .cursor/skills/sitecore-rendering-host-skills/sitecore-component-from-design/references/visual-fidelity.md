# Visual fidelity — match screenshots

**Primary success criterion:** the **assembled page** on the editing host matches **full-page screenshots** (desktop, tablet, mobile). Section PNGs are checkpoints while building each component.

**`section.html` is for content extraction** (text, URLs, alt text) — not the layout authority. See [screenshot-first.md](screenshot-first.md) and [page-assembly-fidelity.md](page-assembly-fidelity.md).

## Reference files (read before coding)

Each section folder under `design-screenshots/{project}/sections/{sectionFolder}/` contains:

| File | Use |
|------|-----|
| `{folder}-desktop.png` | **Primary** layout, typography, spacing, colors |
| `{folder}-tablet.png` | Column count, accordion vs grid, nav collapse |
| `{folder}-mobile.png` | Stack order, full-width, mobile-only controls |
| `section.html` | **Content extraction** — text, URLs, alt, **class names to port into TSX/CSS** |
| `section-plan.json` | Fields, placeholders, YAML artifacts, `responsiveLayout` |
| `site-summary.json` | **Detected fonts and brand colors** — wire before visual QA |

**Workflow:**

1. Open `section-plan.json` → note `implementationPlan`, `responsiveLayout`.
2. View **all three PNGs** — list layout differences (grid → accordion, carousel → stack, etc.).
3. Use `section.html` to extract copy, asset URLs, and **exact class strings** for TSX.
3b. Read `site-summary.json` → `fonts[]`; load Roboto / Font Awesome kit (or URLs from `page.html`) — [captured-css-and-fonts.md](captured-css-and-fonts.md). **If using CSS `@import`, place it at the top of the site stylesheet before `:root`** — otherwise Next.js returns 500 on editing render.
4. Map each Sitecore field to the UI region visible in the PNGs.
4b. For each **Image** field, pick an [image display mode](image-display-modes.md) (`cover`, `contain`, `fill-width`, `column-cover`) from the screenshot — implement frame + CSS so any upload matches. For video thumbnails and fixed-frame promos, follow [media-frame-fidelity.md](media-frame-fidelity.md) (grep captured CSS, art-direction pairs).
5. Implement responsive rules from `responsiveLayout` and tablet/mobile PNGs — use `u-hide-mobile` / `u-hide-desktop` or media queries matching the design. See [Responsive utility classes](#responsive-utility-classes-u-hide-) below.
6. **Compare** mentally (or in browser) against PNGs before marking done — re-test with a non-default aspect ratio image.

## Responsive utility classes (`u-hide-*`)

Many captured sites swap layout between viewports using **utility classes on the same node** as component BEM classes — not separate media-query blocks in every component.

| Class | Mobile (default, `<769px`) | Desktop (`≥769px`) |
|-------|----------------------------|---------------------|
| `u-hide-mobile` | hidden | visible |
| `u-hide-desktop` | visible | hidden |

**Typical patterns from `section.html`:**

- **Art-direction / crop:** two `<Image>` (or `<img>`) nodes with the same field — one `className="s2c__col__img u-hide-mobile"`, one `… u-hide-desktop"` (see `ImageRichTextSection`, `FullBleedHeroBannerSection`).
- **Accordion vs static heading:** desktop title in `<span className="u-hide-mobile">`, mobile toggle in `<button className="… u-hide-desktop">` (see `LinkList`, `InsuranceCategoryGroupCard`).
- **Nav chrome:** desktop-only links with `u-hide-mobile` on `<li>` (see `Navigation`).

Copy these class combinations **exactly** from `section.html` onto the matching SDK field components (`<Text>`, `<Image>`, `<SitecoreLink>`). The Content SDK `<Image>` passes `className` through to the rendered `<img>`.

### General Link (CTA) fields — inner markup patterns

When mapping button-like links from `section.html` to a **General Link** field + `<SitecoreLink>`, read the **inner HTML** of each `<a>` (not just its class and href). Compare with the section PNG — a visible CTA in the screenshot must still be visible after SDK rendering.

| Pattern in captured HTML | TSX |
|--------------------------|-----|
| **Text only** — `<a class="btn">Learn more</a>` | `<SitecoreLink field={fields.Cta} className="btn" />` |
| **Decorator only** — `<a aria-label="Next"><span class="icon-arrow"></span></a>` | `<SitecoreLink field={fields.Cta} aria-label="…"><span className="icon-arrow" aria-hidden="true" /></SitecoreLink>` |
| **Panel arrow** — `text-panel-link` + `arrow__forward` (capture may also have empty `text-panel-full-link`) | **One** `<SitecoreLink>` on the arrow only — skip invisible overlay links in headless TSX. See [dual-link-cta-patterns.md](dual-link-cta-patterns.md). |
| **Text + decorator** — `<a class="btn">Learn more<span class="icon-arrow"></span></a>` | `<SitecoreLink field={fields.Cta} className="btn" showLinkTextWithChildrenPresent><span className="icon-arrow" aria-hidden="true" /></SitecoreLink>` |

**Content SDK rule:** when `<SitecoreLink>` has **any React children**, the link field’s text is **not rendered** unless `showLinkTextWithChildrenPresent` is set. Text+icon links without that prop show only the children — often an empty icon span → **invisible button**.

**CSS (any site):** Port styles for the link wrapper **and** inner decorator nodes from captured sources — `design-screenshots/{site}/css/`, inline `<style>` blocks in `section.html`, or the page HTML export. Decorator spans frequently depend on `background-image`, SVG, or icon fonts; without matching CSS they collapse to zero size even when TSX is correct.

**Verify against PNGs:** label visible, icon/arrow visible, colors and padding match the screenshot — not just that the field has a value in Sitecore.

### Empty or missing link href — still render visible content

**Rule:** An empty General Link field (`href` blank, `#`, or unset) must **never** hide title, body, image, or CTA **label text**. Only the `<a>` / `<SitecoreLink>` wrapper is omitted.

| Field state | Wrong | Correct |
|-------------|-------|---------|
| CTA has text, no href | Hide entire button row | Render label as `<span>` (or styled text) with same classes — not clickable |
| Card overlay link, no href | Hide card body | Render title, description, image; skip overlay `<a>` only |
| Nav list item, no href | Skip whole `<li>` including label | Omit `<li>` from nav only — **not** applicable to hero/teaser/panel bands |

```tsx
const label = fields.Cta?.value?.text?.trim() ?? '';
const href = fields.Cta?.value?.href?.trim() ?? '';
const isLink = Boolean(href && href !== '#');

{label ? (
  isLink ? (
    <SitecoreLink field={fields.Cta} className="btn" />
  ) : (
    <span className="btn">{label}</span>
  )
) : null}
```

Prefer shared helpers (`FieldCta`, `hasLinkHref`) in `src/lib/field-content.tsx` when the editing host has them.

### Multi-Line Text vs Rich Text body fields

Datasource **Multi-Line Text** values are often plain strings without HTML. `<RichText>` may render **nothing** for plain text.

| Template field type | TSX |
|---------------------|-----|
| Multi-Line Text | `<Text tag="p">` or helper that detects HTML vs plain |
| Rich Text | `<RichText>` |

Use a helper that renders `<RichText>` when the value contains HTML tags, otherwise `<Text tag="p">` — see `FieldBody` in `field-content.tsx`.

```tsx
{/* Text + trailing icon — match section.html inner structure exactly */}
<SitecoreLink field={fields.Cta} className="btn btn--primary" showLinkTextWithChildrenPresent>
  <span className="icon-arrow" aria-hidden="true" />
</SitecoreLink>
```

### Field-to-DOM mapping (one field, one node)

When building TSX from `section.html`:

1. **Each authored field binds to at most one content node** (`<Text>`, `<RichText>`, `<Image>`, `<SitecoreLink>`) in the visible tree — unless a deliberate **`u-hide-mobile` / `u-hide-desktop` pair** shows the **same** field at different breakpoints (art direction).
2. **Distinct text regions in the capture → distinct Sitecore fields.** If `section.html` has a subtitle `<p>` and a separate `<blockquote>` (or multiple paragraphs with different roles), do **not** map both to one `Body` field. Create `Subtitle`, `Quote`, `Description`, etc. as the plan requires.
3. **Never reuse one field** on two wrappers “because the class structure has two slots” — that duplicates content on every viewport (common mistake: `Body` on both `.pquote__subt` and `blockquote`).
4. **Derive markup from this section’s `section.html`**, not from another site’s component with the same cmsName. A `TitleDescriptionCtaSection` on one site may be `.pquote`; on another `jmrich--text-inner` — open the section folder for the page you are building.
5. **Before done:** grep TSX for `field={fields.<Name>}` — each field should appear once (or exactly twice only for paired `u-hide-*` nodes).

| Mistake | Fix |
|---------|-----|
| Same `Body` on `<p>` and `<blockquote>` | Split into `Subtitle` + `Body` (or drop the node that is not in this section’s HTML) |
| Copied a different project's rich-text layout | Re-read current `section.html`; use the captured wrapper classes for this section |
| Copied a different project's column-split implementation | Detect archetype from current HTML and rebuild structure — [layout-archetype-detection.md](layout-archetype-detection.md) |
| Copied another site's teaser-card pattern | Detect current teaser archetype from HTML/screenshot — [teaser-grid-archetypes.md](teaser-grid-archetypes.md) |
| One Multi-Line Text with `\n\n` but single `<p>` | Split into multiple `<p>` nodes when the capture has multiple paragraphs |
| Rich Text `Body` split into multiple `<Text tag="p">` | Use `<RichText field={fields.Body} />` — required for Pages inline editing |
| Rich Text field rendered with `<Text>` or manual `{ value: paragraph }` | Bind the field once with `<RichText>`; store HTML (`<p>…</p>`) in datasource YAML |

### Stylesheet rules (critical)

Define utilities once in the project shared stylesheet (e.g. `src/styles/site.css`, imported in `_app.tsx`). **Utilities must win over component BEM rules** — otherwise both mobile and desktop nodes stay visible.

Component rules often set layout display after utilities in the same file, e.g.:

```css
.u-hide-mobile { display: none; }
/* … hundreds of lines … */
.s2c__col__img { display: block; }  /* same specificity, later → overrides hide */
```

When `.s2c__col__img`, `.hero__bg2`, or similar component selectors also set `display`, they tie or beat `.u-hide-*` in the cascade and **both images/controls show at every breakpoint**.

**Required pattern in the shared stylesheet:**

```css
/* Utilities — !important so component BEM cannot override */
.u-hide-mobile {
  display: none !important;
}
.u-hide-desktop {
  display: block !important;
}

@media (min-width: 769px) {
  .u-hide-mobile {
    display: block !important;
  }
  .u-hide-desktop {
    display: none !important;
  }
}
```

When adding new component CSS:

- **Prefer** layout properties on wrappers (`flex`, `max-width`, `object-fit`) without `display` on elements that also carry `u-hide-*`.
- **If** a component rule needs `display: block` on images/links, keep utilities above with `!important` — do not remove `!important` from `u-hide-*` without checking all dual-image / accordion components.
- **Do not** put `display` on a selector that is more specific than the utility unless the utility uses `!important`.

### Verification

When a section uses `u-hide-*`, confirm in the browser (or DevTools responsive mode):

- [ ] Only one of a pair (mobile/desktop image or control) is visible at `<768px`
- [ ] Only the other is visible at `≥769px`
- [ ] If both show: inspect computed `display` — a later component rule is overriding the utility; fix the stylesheet, not the TSX class names

## Rules

- **Do not** invent generic placeholder layouts when `section.html` defines the structure.
- **Do not** skip tablet/mobile behavior when PNGs or `section-plan.json` `responsiveLayout.differsByViewport` is true.
- **Do** keep Sitecore `<Text>`, `<Image>`, `<SitecoreLink>` on the nodes that correspond to authored fields.
- **Do** put layout/CSS in shared stylesheet (`src/styles/…`) using the **same class names** as `section.html` — port captured rules; do not replace with simplified project tokens only — [captured-css-and-fonts.md](captured-css-and-fonts.md).
- **Do** implement **column-split** bands (text + image/video) with explicit flex/grid CSS when `section.html` uses `row` / `col-*` — see [column-split-layouts.md](column-split-layouts.md). Never assume Bootstrap is loaded.
- **Do** define `u-hide-mobile` / `u-hide-desktop` with `!important` in the shared stylesheet so component `display` rules cannot break responsive show/hide — see [Responsive utility classes](visual-fidelity.md#responsive-utility-classes-u-hide-).
- **Do** assign an [image display mode](image-display-modes.md) to every Image field and implement fill/contain CSS so **any** authored asset matches the screenshot frame (full-bleed, logo, column, card head).
- **Do** wire vertical spacing via scaffold **Indent top / Indent bottom** Presentation styles + page `Styles=` param — never create custom “Section spacing” YAML; full-bleed/composite bands must not use the generic `.section` padding class — [presentation-styles.md](../../sitecore-page-from-design/references/presentation-styles.md).
- Variants (`Inversed`, `Animated`, `Carousel`) must still match design intent — `Carousel` should follow the carousel markup in `section.html`, not a generic slider.
- Full-bleed hero slides with `background-image` on slide nodes require an **Image** field on `HeroSlideCard` — extract URLs from `section.html`; text-only `FeatureCarouselCard` will not match the screenshot.
- Composite hero bands need **`CompositeHeroBandSection`** TSX that preserves the wrapper DOM from `section.html` — see [composite-hero-band.md](../../sitecore-section-decomposition/references/composite-hero-band.md).

## Section folder → component lookup

Use `sections/manifest.json` → `folderName` and `cmsName`, or `section-plan.json` → `implementationPlan.components[].cmsName`.

When one section folder defines **parent + child** (grid + cards), build **both** TSX files using the same `section.html` — parent wraps placeholder; child markup comes from repeated nodes inside `section.html`.

## Verification checklist

```
- [ ] Read section-plan.json (responsiveLayout + components)
- [ ] Compared desktop / tablet / mobile PNGs
- [ ] Each Sitecore field appears on at most one visible content node (see [Field-to-DOM mapping](visual-fidelity.md#field-to-dom-mapping-one-field-one-node))
- [ ] Link CTAs match PNGs: inner markup from `section.html` + decorator CSS from captured styles — see [General Link patterns](visual-fidelity.md#general-link-cta-fields--inner-markup-patterns); panel arrow links — [dual-link-cta-patterns.md](dual-link-cta-patterns.md); image+text layout archetype — [layout-archetype-detection.md](layout-archetype-detection.md)
- [ ] Field components on correct nodes (no hardcoded production copy)
- [ ] Responsive behavior matches PNGs
- [ ] `u-hide-mobile` / `u-hide-desktop` pairs show only one node per breakpoint (check computed `display` if both visible)
- [ ] Every Image field uses a display mode from [image-display-modes.md](image-display-modes.md); verified with non-default aspect ratio uploads
- [ ] Video/promo stills: frame shape matches PNG; object-fit from captured CSS — [media-frame-fidelity.md](media-frame-fidelity.md)
- [ ] Text+media side-by-side sections: desktop columns match PNG (explicit CSS, not `col-lg-*` alone) — [column-split-layouts.md](column-split-layouts.md)
- [ ] Fonts and icon kits from `site-summary.json` / `page.html` wired — [captured-css-and-fonts.md](captured-css-and-fonts.md)
- [ ] CSS classes match `section.html`; clip-paths, brand variables, utilities ported
- [ ] npm run build passes
```
