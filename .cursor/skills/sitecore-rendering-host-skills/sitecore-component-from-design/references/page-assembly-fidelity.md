# Page assembly fidelity

**The mimic goal is the full page**, not isolated section components. Section PNGs and `section.html` help you build parts; **full-page screenshots** (`design-screenshots/{site}/{page}/desktop.png`, `tablet.png`, `mobile.png`) decide when the work is done.

---

## Authority order (what “done” means)

| Stage | Source | Role |
|-------|--------|------|
| **Final gate** | **Full-page PNGs** (desktop, tablet, mobile) | Bands stack correctly; spacing between sections; chrome + content together |
| Build checkpoint | Section PNGs | Per-component layout while coding |
| Planning | `page-decomposition.json`, `section-plan.json`, manifest | Which components, placeholders, field lists |
| Content | `section.html`, captured CSS | Copy, URLs, class names — **not** the layout spec |

A section can match its crop PNG and still fail the page if the **wrapper**, **placeholder assembly**, or **band stacking** is wrong.

---

## Standalone section vs placeholder children

Not every two-column band is a **grid + card placeholder**. Before wiring placeholders, read `section.html`:

| Layout in capture | Component pattern |
|-------------------|-------------------|
| Fixed text column + fixed video/image column (`col-lg-5` / `col-lg-7`, different markup per column) | **Standalone section** — all fields on one datasource, no `<Placeholder>`; **implement column CSS** — [column-split-layouts.md](column-split-layouts.md) |
| 2+ **identical** repeating tiles (same card class/structure) | **Section + placeholder** — parent title optional; children in grid/carousel |

**Do not** map a video thumbnail + play button into a `HorizontalLinkCard` `Logo` field because decomposition counted two columns as `repeatCount: 2`.

Full rules and misdetection examples: [standalone-vs-placeholder.md](standalone-vs-placeholder.md).

---

## Workflow (every page mimic)

1. Open **full-page desktop PNG** — note band order, overlaps (carousel + panel row), vertical rhythm.
2. Build each section component until **section PNGs** pass.
3. Wire all renderings on the Sitecore page (or partial designs for chrome).
4. Run the editing host at the page route.
5. **Compare live page to full-page PNGs** at desktop, tablet, and mobile — fix until they align.
6. Only then mark the page complete.

Do not stop after section-level review if the assembled page differs from the full-page screenshot.

---

## Wrapper sections + placeholder children

When one visual band contains **multiple authored children** (carousel slides, panel columns, grid cards):

| Layer | Owns | Does not own |
|-------|------|----------------|
| **Parent section TSX** | Outer band wrapper from `section.html`; carousel track; grid/flex **column or slide shells**; nav/dots; band-level CSS | Card/slide field markup duplicated inside children |
| **Child card TSX** | Field markup **inside** one slide/column/tile | Grid column classes, `.owl-item`, carousel ref, band wrapper |

### Parent `<Placeholder renderEach>` pattern

Use `renderEach` on the **parent** to inject layout shells that depend on **position** or **carousel mechanics**:

```tsx
<Placeholder
  name={slidesPh}
  rendering={rendering}
  renderEach={(component, index) => (
    <div key={`slide-${index}`} className="carousel__slide">{component}</div>
  )}
/>

<Placeholder
  name={panelsPh}
  rendering={rendering}
  renderEach={(component, index) => (
    <div key={`panel-${index}`} className={`grid__col${index > 0 ? ' grid__col--bordered' : ''}`}>
      {component}
    </div>
  )}
/>
```

When **two or more** placeholders are siblings under the same parent (e.g. `hero-panels-{*}` + `hero-stats-{*}` in one `.row`), **each placeholder's `renderEach` must use a distinct key prefix** — not bare `index`. See [placeholder-layout.md — React keys](../../sitecore-content-sdk-component/references/placeholder-layout.md#react-keys--rendereach-and-sibling-placeholders).

**Child components render content only** — no duplicate column/slide wrappers on both parent and child.

### Composite band checklist (any site)

From `section.html` + full-page PNG, confirm the parent reproduces:

- [ ] Carousel/slider block (full width, height, overlap/margin if visible on page PNG)
- [ ] Panel/card **row** directly under or overlapping the carousel
- [ ] Equal column widths (typically 3× on desktop, stack on mobile)
- [ ] Column dividers / `white-border` / border-left on columns **after the first** (when capture shows it)
- [ ] Shared band background on the row wrapper, not only on children
- [ ] Parent `.row` / grid has **no stray gap** that breaks flush columns
- [ ] All placeholder children present in page YAML at correct paths (`…/hero-slides-{id}`, etc.)

See also [composite-hero-band.md](../../sitecore-section-decomposition/references/composite-hero-band.md) for detection and decomposition — patterns apply to any carousel + side-panel band, not one brand.

---

## Card link patterns (panels, tiles)

Captured HTML may list **two `<a>` tags** to the same URL — an invisible full-tile overlay (`text-panel-full-link`) plus a corner arrow (`text-panel-link` / `arrow__forward`).

**Headless mimic:** render **only the visible arrow link** from the General Link field. Skip the overlay in TSX — it duplicates the href, fights `position: static` parent layouts, and often adds unwanted card height or visible link text. See [dual-link-cta-patterns.md](dual-link-cta-patterns.md).

```tsx
<div className="text-panel-link">
  <SitecoreLink field={fields.Cta} aria-label="…">
    <span className="arrow__forward" aria-hidden="true" />
  </SitecoreLink>
</div>
```

Icon-only child links do **not** need `showLinkTextWithChildrenPresent`. Port arrow position CSS from captured styles for the correct parent scope.

---

## Common assembly failures

| Symptom on full-page PNG | Likely cause |
|--------------------------|--------------|
| Three panels stacked vertically on desktop | Missing grid/flex column CSS on parent row; global `.row { gap }` breaking flush columns |
| Panels narrow/wrong width | Column classes on **child** instead of parent `renderEach` shell |
| Carousel OK but panels detached | Missing band wrapper; panels authored as separate page sections instead of one composite parent |
| Arrow/CTA missing on panels | Icon span without CSS — port `.arrow__forward` dimensions from capture |
| Extra vertical space on panels | Overlay `text-panel-full-link` duplicated in TSX — use arrow link only — [dual-link-cta-patterns.md](dual-link-cta-patterns.md) |
| Gap above/below composite hero band | `.section` class on band root adds `padding: 3rem 0` — remove; use `indent-top` / `indent-bottom` in page YAML — [presentation-styles.md](../../sitecore-page-from-design/references/presentation-styles.md) |
| Double borders on first column | `white-border` on every child instead of index > 0 in parent `renderEach` |
| Console: *Each child in a list should have a unique key* | Two sibling `<Placeholder>` both use `key={index}` in `renderEach` — prefix keys (`panel-0`, `stats-0`) — [placeholder-layout.md](../../sitecore-content-sdk-component/references/placeholder-layout.md#react-keys--rendereach-and-sibling-placeholders) |
| Section OK alone, page wrong | Stopped at section PNG gate — run **full-page** comparison |
| Text and video stacked on desktop | Bootstrap `col-lg-*` copied to TSX without grid CSS — add explicit flex column CSS — [column-split-layouts.md](column-split-layouts.md) |

---

## Verification checklist (required before “done”)

```
- [ ] Full-page desktop PNG compared to live route
- [ ] Full-page tablet PNG compared
- [ ] Full-page mobile PNG compared
- [ ] Composite/wrapper bands: parent owns slide/column shells; children are content-only
- [ ] Placeholder children wired in page YAML; order matches screenshot left → right
- [ ] Band-level CSS in shared stylesheet (carousel height, panel row, column borders)
- [ ] npm run build passes
```
