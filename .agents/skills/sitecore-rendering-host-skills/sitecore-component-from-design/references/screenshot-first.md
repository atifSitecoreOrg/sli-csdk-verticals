# Screenshot-first component fidelity

**Primary success criterion:** the **assembled page** on the editing host must match the **full-page screenshots** (desktop, tablet, mobile). Section PNGs are build checkpoints; they do not replace the full-page gate.

See [page-assembly-fidelity.md](page-assembly-fidelity.md) for wrapper/placeholder assembly and the final verification workflow.

---

## Authority order (highest → lowest)

| Priority | Source | Role |
|----------|--------|------|
| 1 | **Full-page PNGs** (`design-screenshots/{page}/desktop.png`, …) | **Final visual truth** — band stacking, spacing, chrome + content |
| 2 | Section PNGs (`*-desktop.png`, `*-tablet.png`, `*-mobile.png`) | Per-component layout while building |
| 3 | `sections/manifest.json` | Which components to build; scope; parent/child relationships |
| 4 | `section-plan.json` → `implementationPlan` | Fields, placeholders, YAML artifacts, responsive notes |
| 5 | `page-decomposition.json` | Page-level band order and composite groups |
| 6 | `section.html` | **Content extraction** — text, URLs, image URLs, **class names to port** |
| 7 | `site-summary.json` | **Fonts and colors** — wire detected fonts; confirm `--brand-*` tokens against PNGs |
| 8 | `component-blueprint.json` | Planning hints — confirm against PNGs |

**Do not** treat `section.html` as the layout spec. HTML may differ from what authors need in Sitecore (extra wrappers, JS-driven classes, third-party markup). Match **screenshots**; use HTML to populate datasource values and **port class names + CSS**.

**Do not** simplify the design system to a few project tokens (`--rai-*`) when the capture uses `--brand-*` classes, clip-paths, and utility grids — see [captured-css-and-fonts.md](captured-css-and-fonts.md).

**Wire fonts from `site-summary.json`** (and icon kits from `page.html`) before visual QA — missing Roboto or Font Awesome makes components look wrong even when layout is correct. CSS `@import` for web fonts must be the **first** rule in the site stylesheet (before `:root`) — see [captured-css-and-fonts.md](captured-css-and-fonts.md#css-import-placement-nextjs--postcss--mandatory).

---

## Per-component workflow

1. Open **full-page PNG** for the route — note where this band sits and how it connects to neighbours.
2. Open **all three** section PNGs for the component.
3. Read `section-plan.json` → `implementationPlan.components` for fields, placeholders, and YAML artifacts.
4. Extract copy, asset URLs, and **class names** from `section.html` (inventory table).
4b. Read `site-summary.json` → `fonts[]`; wire font imports and icon kits in the editing host — [captured-css-and-fonts.md](captured-css-and-fonts.md).
5. If the component uses `<Placeholder>`: parent owns band/slide/column shells; child cards render **content only** — [page-assembly-fidelity.md](page-assembly-fidelity.md).
6. Implement TSX + CSS until section PNGs match at each breakpoint.
7. After page wiring: **re-check full-page PNGs** at desktop, tablet, mobile.
8. Download every image; create media YAML; wire `mediaid` in datasource YAML.
9. Create serialization YAML listed in `implementationPlan`.

---

## Placeholders and YAML

When TSX uses `<Placeholder>`:

1. Create **project placeholder-setting** YAML under `Placeholder Settings/Project/{project}/`.
2. Set the parent rendering **Placeholders** field (Layout Service Placeholders) to the placeholder-setting item GUID — single braces `{GUID}`.
3. Seed child datasource items and wire page/partial-design `__Renderings` XML.

See [placeholder-settings.md](../../sitecore-content-sdk-component/references/placeholder-settings.md).

---

## Variants (standard set only)

Create Headless Variant YAML for **exactly these exports** unless the user specifies otherwise:

| Export | Sort order |
|--------|------------|
| `Default` | 100 |
| `Inversed` | 200 |
| `ImageTop` | 300 |
| `Animated` | 400 |

**Do not** create a separate `Carousel` variant. When the screenshot shows a carousel/slider, implement carousel behavior in **`Default`** using [Embla Carousel](https://www.embla-carousel.com/) with placeholder children as slides.

---

## Carousels (Embla + Sitecore placeholders)

- Install `embla-carousel-react` (and `embla-carousel` if needed) in the editing host.
- Carousel **slides/cards** come from a Sitecore `<Placeholder>` — one child rendering per slide. Do not hardcode slide count in TSX.
- Implement carousel behavior in the section’s **`Default`** export (no separate `Carousel` Headless Variant).

### SSR / hydration (required)

Next.js SSG/SSR renders carousel sections on the server first. Placeholder child counts and Embla state are often **not available or differ** on that first pass — conditional nav/dots (`count > 1`) causes **hydration mismatch**.

**Pattern:**

1. Add `useClientMounted()` (`useEffect` → `mounted === true` after hydration) in `src/lib/component-utils.ts`.
2. **Before mount (and in Pages editing mode):** render a **static** slide track — `<Placeholder renderEach={…} />` only, no Embla ref, no prev/next/dots.
3. **After mount in normal mode:** mount Embla (`useEmblaCarousel`), attach `ref` to the viewport, then render nav/dots when `count > 1`.
4. Never gate initial markup on `localStorage`, `window`, or Embla `selectedIndex` — those run only after mount.

Reference implementation patterns: parent `Placeholder` + `renderEach` for slide/column shells; Embla carousel with `useClientMounted()` — see [page-assembly-fidelity.md](page-assembly-fidelity.md).

### Authoring / UX

- In **Pages editing mode** (`page.mode.isEditing`), keep the static track (all slides reachable) — do not init Embla or hide slides.
- Disable autoplay; respect `prefers-reduced-motion`.
- Match dots, arrows, and peek from section PNGs — reuse legacy control class names from the current capture when they match the design.

---

## Cookie banner (sticky, dismissible)

When `CookieBanner` is in the manifest:

1. `'use client'` — Accept button **must dismiss** the banner (localStorage/cookie); restore hidden state on reload.
2. Wire as a **Partial Design** (like Header/Footer), not as a page content rendering — so Pages Builder does not intercept the Accept button for link field editing.
3. Add layout placeholder (e.g. `headless-cookie`) in `Layout.tsx`.
4. Create `Presentation/Partial Designs/Cookie.yml` + `Placeholder Settings/Partial Design/Cookie.yml` (`sxa-cookie`).
5. Include Cookie partial design GUID in `Page Designs/Default` → `PartialDesigns`.

---

## Image fields

Use `FieldImage` + display modes so **any** uploaded asset matches the screenshot frame — see [image-display-modes.md](image-display-modes.md).

---

## Verification checklist

- [ ] Section matches desktop, tablet, and mobile **section** PNGs
- [ ] **Screenshot done gate passed** — [screenshot-done-gate.md](screenshot-done-gate.md)
- [ ] Column-split sections (text + image/video): side-by-side on desktop per PNG — [column-split-layouts.md](column-split-layouts.md)
- [ ] **Full-page** desktop / tablet / mobile PNGs match live route after assembly — [page-assembly-fidelity.md](page-assembly-fidelity.md)
- [ ] Wrapper sections: parent owns slide/column shells; placeholder children are content-only
- [ ] All images downloaded; media YAML exists; datasource `mediaid` values resolve
- [ ] Placeholder settings + rendering **Placeholders** field set when using nested placeholders
- [ ] Only `Default`, `Inversed`, `ImageTop`, `Animated` variant YAML (no `Carousel` variant)
- [ ] Carousel sections use Embla in `Default` with hydration-safe mount pattern
- [ ] Cookie banner dismiss works; cookie is on partial design when sticky
- [ ] Fonts from `site-summary.json` loaded; icon kit wired when `section.html` uses `fa-*` classes — [captured-css-and-fonts.md](captured-css-and-fonts.md)
- [ ] CSS classes match `section.html`; captured rules ported (not simplified tokens only)
- [ ] `npm run build` passes
