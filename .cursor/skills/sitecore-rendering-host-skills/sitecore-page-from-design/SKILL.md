---
name: sitecore-page-from-design
description: Decompose full-page designs into Sitecore Content SDK components from attached screenshots OR URLs (via url-screenshots skill). Desktop/tablet/mobile inputs; Header, Breadcrumb, HeroBanner, Sidebar, CookieBanner, Sections, Cards, Footer. Only builds regions present in the design.
paths:
  - "**/src/components/**/*.tsx"
  - "**/*.module.json"
---

# Sitecore page from design

Build a **complete page** from visual design inputs by detecting regions, splitting into components, and implementing each with TSX + Sitecore YAML.

**Design source (either or both):**

| Path | When |
|------|------|
| **Attached screenshots** | User uploads desktop / tablet / mobile PNGs in chat |
| **URLs** | User provides page URL(s) — run [`url-screenshots`](../../mimic-website-skills/url-screenshots/SKILL.md) first to generate PNGs |

Both paths converge on the same Phase 1 analysis — use whatever images are available.

**Per-component workflow:** [`sitecore-component-from-design`](../sitecore-component-from-design/SKILL.md)

**Core implementation rules:** [`sitecore-content-sdk-component`](../sitecore-content-sdk-component/SKILL.md)

**Serialization:** [`sitecore-new-collection-yaml`](../../sitecore-serialization-skills/sitecore-new-collection-yaml/SKILL.md) · [`sitecore-new-rendering-yaml`](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md) · [`sitecore-new-site-yaml`](../../sitecore-serialization-skills/sitecore-new-site-yaml/SKILL.md)

**Auth0 (Login / Register / Profile in design):** [`sitecore-auth0-authentication`](../sitecore-auth0-authentication/SKILL.md) → then [`sitecore-cloudsdk-identity-events`](../../sitecore-cloud-sdk-skills/sitecore-cloudsdk-identity-events/SKILL.md)

**Search (search box / results page in design):** [`sitecore-search-experience`](../../sitecore-search-experience/SKILL.md) — **App Router hosts only**

**Screenshot capture from URLs:** [`url-screenshots`](../../mimic-website-skills/url-screenshots/SKILL.md) (includes HTML)

**Visual component detection:** [`visual-cms-component-detection`](../../mimic-website-skills/visual-cms-component-detection/SKILL.md) — **required in Phase 1** before finalizing section manifest

**Section decomposition:** [`sitecore-section-decomposition`](../sitecore-section-decomposition/SKILL.md) — **required after section capture** — maps section screenshots to Sitecore component blueprints

**HTML from URLs:** [`url-page-html`](../../mimic-website-skills/url-page-html/SKILL.md)

**Decomposition guides:**

- [references/page-regions.md](references/page-regions.md) — full region catalog (Header, Breadcrumb, HeroBanner, Sidebar, …)
- [references/page-decomposition.md](references/page-decomposition.md) — order, dependencies, subset stacks
- [references/site-structure-from-links.md](references/site-structure-from-links.md) — stub content tree from nav/footer internal links
- [references/html-analysis.md](references/html-analysis.md) — use `page.html` / `main.html` with screenshots
- [references/partial-design-dynamic-placeholder.md](references/partial-design-dynamic-placeholder.md) — required TSX for Partial/Page Designs; copy to `editing-hosts/{app}/src/components/partial-design-dynamic-placeholder/`
- [references/partial-design-placeholder-settings/](references/partial-design-placeholder-settings/README.md) — site `Presentation/Placeholder Settings/Partial Design/` YAML (maps `sxa-header` / `sxa-footer`)
- [references/renderings-xml.md](references/renderings-xml.md) — **`__Renderings` XML rules** (escape `&amp;`, uppercase `p:after` UIDs, **`uid="{GUID}"` not `uid="{GUID}}"`**) — **required before page/partial-design YAML**
- [../sitecore-content-sdk-component/references/placeholder-settings.md](../sitecore-content-sdk-component/references/placeholder-settings.md) — **mandatory** project placeholder YAML + rendering `Placeholders` field for nested `<Placeholder>` components

**Orchestrated by mimic-url:** When invoked from [`mimic-url`](../../mimic-website-skills/mimic-url/SKILL.md), follow the **mandatory user review gate** in [component-manifest-review.md](../../mimic-website-skills/mimic-url/references/component-manifest-review.md) before Phase 3 (build).

**Project isolation:** Page and component YAML, renderings, and datasources must come from the **current** module only — never wire another project's GUIDs or copy another site's `Home.yml` renderings verbatim — [project-isolation.md](../sitecore-component-from-design/references/project-isolation.md).

**Documentation:** MCP `search_sitecore_knowledge_sources` (`user-documentation`) for layout, placeholders, and page structure.

---

## Only build what is present

Screenshots rarely include every region type. During analysis, classify each candidate from [page-regions.md](references/page-regions.md) as:

| Status | Action |
|--------|--------|
| **Present** | Add to manifest; implement |
| **Absent** | Omit — do not scaffold empty components |
| **Unclear** | Ask user before adding to manifest |

Never assume Header, Breadcrumb, HeroBanner, Sidebar, CookieBanner, or Footer exist unless visible (or explicitly requested).

**Cookie banner:** frequently sticky at the bottom until the user accepts cookies. It may **not appear** in screenshots if consent was already given — mark **Unclear** and ask whether to include a `{Name}CookieBanner` layout component. See [page-regions.md](references/page-regions.md#cookie-banner-notes).

**Sticky navigation:** fixed/sticky headers and nav bars are captured by [`url-screenshots`](../../mimic-website-skills/url-screenshots/SKILL.md) **before** they are hidden for section crops. Use the `navigation/` (or `header/`) crop from `sections/manifest.json` for nav chrome; use post-hide section crops for content bands. See [sticky-navigation.md](../../mimic-website-skills/url-screenshots/references/sticky-navigation.md).

---

## Phase 0 — Resolve design images

Choose **one** starting path (or combine as noted):

### A — User attached screenshots

Use uploaded PNGs directly as desktop / tablet / mobile inputs. **Do not** re-capture from URL unless user asks to refresh.

### B — User provided URL(s) only

1. Confirm dev server is running if URLs are `localhost`.
2. Run [`url-screenshots`](../../mimic-website-skills/url-screenshots/SKILL.md):

```bash
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/capture.mjs \
  --urls "https://www.example.com/page" \
  --out "./design-screenshots/{page-slug}" \
  --manifest
```

3. Use generated files:
   - `{out}/{slug}/desktop.png` — full-page reference
   - `{out}/{slug}/tablet.png` — responsive
   - `{out}/{slug}/mobile.png` — responsive
   - `{out}/{slug}/page.html` — full DOM (header, footer, landmarks)
   - `{out}/{slug}/main.html` — main content bands
4. Set **base URL** to the page origin (from `source-url.txt`) for asset download.

If HTML is missing for a page, run [`url-page-html`](../../mimic-website-skills/url-page-html/SKILL.md) `fetch-html.mjs` for that URL.

### B2 — Auto section discovery (required when HTML exists)

**Do not ask the user to list components upfront.** After full-page capture, run section discovery:

```bash
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/section-capture.mjs \
  --page-dir "./design-screenshots/{slug}" \
  --refresh-html \
  --load domcontentloaded
```

For multiple pages, pass `--urls` with the same `--out` project folder (e.g. `./design-screenshots/matthey-com`).

Read **`{project}/sections/manifest.json`**, **`{project}/sections/component-blueprint.json`**, **`{project}/{page-slug}/page-decomposition.json`**, and **`{project}/{page-slug}/new-sections-manifest.json`** (`componentsToBuild` — only these need new TSX). Use domain section crops at `{project}/sections/{folder-name}/{folder-name}-desktop.png`. See [domain-section-merge.md](../../mimic-website-skills/url-screenshots/references/domain-section-merge.md).

### C — Both URLs and attachments

Use **attachments** for the target page; optional URL capture for **additional** routes (e.g. `/about`, `/contact`).

---

## Inputs

| Input | Source | Use |
|-------|--------|-----|
| Desktop page screenshot | Upload **or** URL capture (`desktop.png`) | Primary structure and section boundaries |
| Tablet / mobile screenshots | Upload **or** URL capture | Responsive splits; may add mobile-only sections |
| Page URL(s) | User | Triggers Phase 0B when no uploads |
| Section manifest | `{project}/sections/manifest.json` | Global components keyed by `cmsName` |
| Page section order | `{project}/{page-slug}/page-manifest.json` | Which components appear on each page |
| New sections queue | `{project}/{page-slug}/new-sections-manifest.json` | `componentsToBuild` — sections needing new components vs reuse |
| Per-section screenshots | `{project}/sections/{folder}/{folder}-{viewport}.png` | Shared crops — Header/Footer once per project |
| Optional outer HTML (full page or main) | `page.html` / `main.html` from capture **or** user paste | Copy, links, assets, semantic landmarks — see [html-analysis.md](references/html-analysis.md) |
| Target page name / route | User | Drives page YAML path under site content |
| Base URL | Origin of reference page | Required for relative asset paths in HTML |

---

## Phase 1 — Analyze (no code yet)

1. Identify rendering host app and `*.module.json` (namespace, paths).
2. **Run [`visual-cms-component-detection`](../../mimic-website-skills/visual-cms-component-detection/SKILL.md)** on full-page screenshots + section crops:
   - Produce component inventory JSON (top → bottom, parent/child grids)
   - Apply [naming taxonomy](../../mimic-website-skills/visual-cms-component-detection/references/naming-taxonomy.md) — reject generic DOM names
   - Mark `confidence` per component; ask user when `low`
3. **Read `{project}/sections/manifest.json`** — merge visual inventory with DOM discovery output. Use taxonomy `cmsName` (`VerticalTeaserGrid`, `StatsBar`, `HeroBanner`, `Header`, …). Map relationships:
   - `grid` / `section` + `placeholderFor` → Section TSX with `<Placeholder>` + separate Card TSX
   - `card` + `parentSection` → child card component (do not duplicate as standalone section)
   - `scope: "site"` → build once, reuse on all pages
4. **Read HTML** — use each component's `selector` (from DOM pass) to extract copy from `page.html` / `main.html`.
5. Walk [page-regions.md](references/page-regions.md) — confirm or refine using **visual inventory + section crops + HTML**.
6. Mark horizontal **bands** top → bottom using manifest `order` for all **Present** regions.
7. Produce a **component manifest** with **evidence** for every row (section crop path, visual role, `selector`, source URL).

| ID | Proposed component | Region type | Page | Band | Evidence | Action | Notes |
|----|-------------------|-------------|------|------|----------|--------|-------|
| S1 | Header | Navigation | all | 0 | `sections/header/…`; visual: site-wide nav | create | site-scoped |
| H1 | StatsBar | StatsBar | Home | 2 | `sections/stats-bar/…`; 3× `StatsItem` | create | `placeholderFor: StatsItem` |
| G1 | VerticalTeaserGrid | Grid | About | 4 | visual: 3-col teaser cards | create | `placeholderFor: VerticalTeaserCard` |
| C1 | VerticalTeaserCard | Card | About | — | `sections/vertical-teaser-card/…` | create | child of VerticalTeaserGrid |
| … | … | … | … | … | … | create / reuse / skip / unclear | |

**Action** values: `create` | `reuse` | `skip` | `unclear`. Full format: [component-manifest-review.md](../../mimic-website-skills/mimic-url/references/component-manifest-review.md).

8. **Stop — present manifest to user** and wait for approval before Phase 2/3. User may accept, skip rows, rename, split, merge, add components, or attach context.
9. Apply feedback → **revised manifest**; re-confirm when changes are non-trivial.
10. Resolve all **Unclear** rows with the user (hero vs page title, grid vs carousel, cookie banner, sidebar vs full-width).

**Login in header:** If auth row is **Present** and approved, run [`sitecore-auth0-authentication`](../sitecore-auth0-authentication/SKILL.md) during build.

**Search UI:** If search row is **Present** and approved, run [`sitecore-search-experience`](../../sitecore-search-experience/SKILL.md) — target host must be **App Router** with next-intl (Phase 0). Then npm deps, copy TSX + YAML. Ask for search index ID if unknown.

---

## Phase 2 — Reuse audit

Before creating items, search:

- `src/components/**/*.tsx` for matching chrome/sections
- Serialized renderings under `{renderingsInclude}/`
- Existing Header/Footer on layout partial designs

Reuse and extend when ≥80% match; create new only for net-new UI.

### PartialDesignDynamicPlaceholder + placeholder settings (required before layout chrome)

**Before** building Header/Footer YAML or section components with nested placeholders:

1. **Editing host TSX** — copy `PartialDesignDynamicPlaceholder` to `editing-hosts/{app}/src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx`; register in `.sitecore/component-map.ts` **without** `componentType: 'client'` ([partial-design-dynamic-placeholder.md](references/partial-design-dynamic-placeholder.md))
2. **Site partial-design placeholders** — `{siteContentPath}/Presentation/Placeholder Settings/Partial Design/` + **mandatory child YAML** `Header.yml` / `Footer.yml` with Placeholder Key `sxa-header` / `sxa-footer` ([partial-design-placeholder-settings](references/partial-design-placeholder-settings/README.md)). The scaffold folder alone is insufficient.
3. **Component placeholder settings** — for every TSX `<Placeholder>` prefix (`teaser-cards`, `link-cards`, `stats-items`, `header-nav`, `footer-links`): create project YAML at `/sitecore/layout/Placeholder Settings/Project/{project}/{key}` **and** set **Placeholders** field on the parent rendering ([placeholder-settings.md](../sitecore-content-sdk-component/references/placeholder-settings.md))
4. Confirm `*.module.json` includes the `placeholder-settings` subtree
5. Run `npm run build` and fix errors before Phase 3

`create-content-sdk-app` does not include `PartialDesignDynamicPlaceholder` — it must be added to every editing host.

---

## Phase 3 — Build components (ordered)

Follow dependency order in [page-decomposition.md](references/page-decomposition.md) — **skip absent regions**:

1. Layout chrome — Header, Footer, Announcement, **CookieBanner** (if Present or user confirms when Unclear)
   - If Header shows Login/Join → apply [`sitecore-auth0-authentication`](../sitecore-auth0-authentication/SKILL.md) (auth libs + Register + Profile + logged-in header)
2. Breadcrumb, SectionWrapper + sidebar (if Present)
3. HeroBanner / PageTitle (if Present)
4. Main sections top → bottom (if Present)
5. Card components for section placeholders (before page YAML)
6. Sidebar nav / promo components (if Present)

For **each** manifest row marked create + Present, run [`sitecore-component-from-design`](../sitecore-component-from-design/SKILL.md):

- Use **section crop PNGs** from `sections/{name}/` (desktop primary; tablet/mobile for responsive)
- Content inventory from section HTML fragment (match manifest `selector` in `page.html` / `main.html`)
- Asset download with user-provided base URL
- TSX + variants per [component-variants.md](../sitecore-content-sdk-component/references/component-variants.md) (`Default`, `Animated` always; `Inversed` / `ImageTop` / `ImageBottom` / `Carousel` when applicable)
- Full YAML artifact set

Do **not** rely on manual mental cropping from full-page `desktop.png` when section crops exist.

**After each component (or after each logical batch):** run `npm run build` from the rendering host app root and **fix all errors** before starting the next component. See [`sitecore-content-sdk-component`](../sitecore-content-sdk-component/SKILL.md) Step 4.

---

## Phase 4 — Assemble page YAML

After all components exist:

**GUID rule:** every new page/layout/datasource item needs a **fresh random UUID** — never sequential placeholders (`*-0001-4000-8000-*`). See [GUID rules](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md#item-guids-critical) (components) and site content under [`sitecore-new-site-yaml`](../../sitecore-serialization-skills/sitecore-new-site-yaml/SKILL.md).

**Content tree placement — all pages under Home:** every page except the site root lives as a **child (or nested descendant) of the `Home` item**, never as a direct sibling of `Home` under the site node. The **`Home` item itself is the homepage (`/`)** — renderings go on `Home.yml`, not `Home/Home.yml`. See [page-decomposition.md — Page content tree](references/page-decomposition.md#page-content-tree) and [homepage-authoring.md](references/homepage-authoring.md).

**Page design — use `TemplatesMapping`, not per-page `Page Design`:** do **not** set the `Page Design` shared field (`24171bf1-c0e1-480e-be76-4c0a1876f916`) on individual page items under `Home/`. Instead, map page templates to page designs once on `{siteContentPath}/Presentation/Page Designs.yml` via `TemplatesMapping` (`ba1f60d6-3deb-40cc-bb61-eec772279ee1`). See [page-decomposition.md — Page design mapping](references/page-decomposition.md#page-design-mapping).

**Partial designs + placeholder settings (mandatory for Header/Footer chrome):** when creating `Partial Designs/Header`, `Footer`, and `Page Designs/Default`, also create **child** items under `Presentation/Placeholder Settings/Partial Design/` — one per partial design with Placeholder Key `sxa-{signature}`. The site scaffold creates the **folder only**; missing `Header.yml` / `Footer.yml` children causes `Placeholder 'sxa-footer' was not found` and Pages canvas **500** on `sxa-jss`. See [partial-design-placeholder-settings/README.md](references/partial-design-placeholder-settings/README.md).

**Content tree from links:** after capture, run `write-site-content-tree.mjs` → `site-content-tree.json`. Create stub page YAML for every linked route before push — [site-structure-from-links.md](references/site-structure-from-links.md).

1. Derive the YAML file path from the design URL (see page-decomposition mapping table). **Also** read `site-content-tree.json` for all routes referenced in nav/footer/links.
2. Set `Parent` to the **Home item ID** (for a top-level section page) or the intermediate folder/page item ID (for nested URLs).
3. Set `Path` to `{siteContentPath}/Home/…` matching the folder nesting on disk.
4. Add presentation: renderings order matching visual top → bottom.
5. Wire datasource items from `Data/{Component}s/Default …`.
6. **Do not** create `Home/Home` for the mimicked homepage — wire renderings on `{siteContentPath}/Home.yml`; keep `StartItem` on that same item ([homepage-authoring.md](references/homepage-authoring.md)).
7. Pull layout patterns from an existing similar page in the same site include — do not invent layout XML shape.
8. **Valid `__Renderings` XML (mandatory)** — follow [references/renderings-xml.md](references/renderings-xml.md):
   - Escape every `&` in `s:par` as `&amp;` (e.g. `CSSStyles&amp;DynamicPlaceholderId=1`)
   - Use **uppercase** GUIDs in both `uid="{…}"` and `p:after="r[@uid='{…}']"` — lowercase `p:after` references break Content Editor
   - Every layout `<r>` must use **`uid="{GUID}"`** — **not** `uid="{GUID}}"` (extra `}` zeros UIDs in edit layout → React duplicate key `00000000-…`)
   - In authoring scripts: `escapeRenderingPar()` + `guidUpper(uid)` for `uid="${guidUpper(uid)}"` — never `uid="{${uid}}}"`
   - Invalid XML often surfaces as a **Content Editor error when opening the page item** while Edge still renders
9. **Select Headless Variant explicitly** — every rendering in `__Renderings` / `__Final Renderings` must set `FieldNames` to the correct Headless Variant item GUID (URL-encoded `{GUID}`). Use **Default** for grids/stacks; use **Carousel** when the design shows slider controls (prev/next, dots, peek slides). When `page-decomposition.json` specifies `headlessVariant`, use that variant's GUID. Without `FieldNames`, Pages may pick a non-default variant arbitrarily.

```yaml
# s:par fragment — FieldNames = Default variant item ID for this rendering
s:par="GridParameters=%7B7465D855-992E-4DC2-9855-A03250DFA74B%7D&amp;FieldNames=%7B{D8210FEA-1A71-4F66-8AFC-76E5FF0E41A5}%7D&amp;Styles&amp;RenderingIdentifier&amp;CSSStyles"
```

Lookup: `{siteContentPath}/Presentation/Headless Variants/{ComponentName}/{Variant}.yml` → use that item's `ID`. Match rendering `s:id` to the Json rendering item, then set `FieldNames` on the **same** `<r>` block. Apply to page items **and** Partial Design items (Header, Footer).

**Presentation styles (spacing, indent):** reuse site-scaffold **Indent top**, **Indent bottom**, and **Indent side** from `{siteContentPath}/Presentation/Styles/Spacing/` — do not create custom section spacing YAML. Wire GUIDs in `s:par` via `Styles=%7B{GUID}%7D`. Declare per section in `page-decomposition.json` → `parentComponent.presentationStyles` (`indent-top`, `indent-bottom`, `indent-side`). GUIDs are per-site — read from that site's YAML files. See [presentation-styles.md](references/presentation-styles.md).

**Composite hero bands:** when `page-decomposition.json` has `compositeBand: true`, wire each `subComponents[]` entry in DOM order and preserve spatial layout from `section.html` — see [composite-hero-band.md](../sitecore-section-decomposition/references/composite-hero-band.md).

**Execute** (do not only document) — then **media before validate/push** ([media-from-mimic.md](../../sitecore-yaml/references/media-from-mimic.md)): harvest `img`/`srcset`/background URLs from `section.html` + `page.html`, run [`sitecore-media-from-url-yaml`](../../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md), wire `mediaid`, then:

```powershell
dotnet sitecore serialization validate --fix -i MODULE_NAMESPACE
dotnet sitecore serialization push -n ENVIRONMENT_NAME
```

Run **`npm run build`** again after all page components and YAML are in place. **Fix every build error** before considering the page complete.

---

## Phase 5 — Responsive page behavior

| Source | Action |
|--------|--------|
| Desktop screenshot | Default section ordering |
| Tablet screenshot | Adjust grids in Section TSX |
| Mobile screenshot | Stack order, mobile nav in Header variant if needed |

Optional: add `Compact` or `MobileStacked` Headless variant when mobile design differs materially from desktop (not just scale).

---

## Phase 6 — Verification

- [ ] `npm run build` passes with zero errors in the rendering host app
- [ ] Every visible text block traceable to a Sitecore field + datasource value
- [ ] Every image was downloaded via sitecore-media-from-url-yaml; Image fields use `mediaid`; media-library **pushed** to CM ([media-from-mimic.md](../../sitecore-yaml/references/media-from-mimic.md))
- [ ] `PartialDesignDynamicPlaceholder` TSX in `editing-hosts/{app}/src/components/partial-design-dynamic-placeholder/` + component-map entry (no `componentType: 'client'`)
- [ ] Site `Partial Design/Header` + `Footer` **child** placeholder settings with `sxa-header` / `sxa-footer` keys — not folder-only ([partial-design-placeholder-settings](references/partial-design-placeholder-settings/README.md))
- [ ] Pages editor opens Home without `sxa-footer` / `sxa-jss` 500 errors
- [ ] Project placeholder settings exist for every nested `<Placeholder>` prefix (`teaser-cards-{*}`, `link-cards-{*}`, etc.)
- [ ] Parent renderings have **Placeholders** field linking to placeholder-setting GUID(s)
- [ ] `__Renderings` XML valid per [renderings-xml.md](references/renderings-xml.md) — `&amp;` in `s:par`; uppercase `uid` + `p:after` GUIDs; **no** `uid="{GUID}}"` (extra `}`)
- [ ] Content Editor opens page + partial design items without layout XML errors
- [ ] Header nav placeholder accepts NavLink/LinkList renderings (when Header present)
- [ ] Breadcrumb present only when in manifest
- [ ] Section placeholders have `Carousel` variant + YAML when applicable
- [ ] Sidebar/wrapper placeholders wired when two-column layout detected
- [ ] Hero vs page title not duplicated
- [ ] Footer placeholders configured (when Footer present)
- [ ] CookieBanner sticky on layout when in manifest; dismiss hides until cleared (client-side)
- [ ] Page renders in editor with all sections
- [ ] Every page/partial-design rendering has `FieldNames` set to the intended Headless Variant GUID (**Carousel** when design is a slider)
- [ ] Composite hero bands decomposed and laid out per [composite-hero-band.md](../sitecore-section-decomposition/references/composite-hero-band.md)
- [ ] Homepage mimicked from `/` has `__Renderings` on `{siteContentPath}/Home.yml` — no `Home/Home` item; `StartItem` matches `Home.yml` ID ([homepage-authoring.md](references/homepage-authoring.md))
- [ ] `site-content-tree.json` generated; stub page YAML exists for every `status: stub` route ([site-structure-from-links.md](references/site-structure-from-links.md))
- [ ] Navigation/Footer links resolve to created content items (internal links or matching routes)
- [ ] Same-origin General Link fields in chrome datasources use `linktype="internal"` when route exists in `site-content-tree.json` — [site-structure-from-links.md](references/site-structure-from-links.md)
- [ ] Non-homepage pages are nested under `{siteContentPath}/Home/…` (not direct children of the site item)
- [ ] Page items under `Home/` have **no** `Page Design` shared field — design assignment is via `Presentation/Page Designs.yml` → `TemplatesMapping`
- [ ] Serialization validates with zero errors

---

## Communication template

After Phase 1, **stop** and share the full manifest:

> **Analysis complete** — **N** components across **P** page(s) (**M** shared chrome).  
>  
> | ID | Component | Page | Band | Evidence | Action |  
> |----|-----------|------|------|----------|--------|  
> | … | … | … | … | … | … |  
>  
> Please **approve** or reply with changes:  
> - **Skip** — e.g. "skip cookie banner"  
> - **Rename** — e.g. "call it JMHeroCarousel"  
> - **Split** — e.g. "split hero into carousel + news bar"  
> - **Merge** — e.g. "combine stats into hero"  
> - **Add** — e.g. "add Breadcrumb on About"  
> - **Context** — behaviour, variants, copy notes  

Do **not** start TSX/YAML until the user approves (or approves a revised manifest).

---

## Do not

- Start implementation before the user approves the component manifest (when invoked standalone or from mimic-url)
- Mark component or page work complete while `npm run build` still fails
- Implement the whole page as one monolithic TSX file
- Skip Card components when design shows repeating tiles
- Invent Header, Footer, Breadcrumb, Hero, Sidebar, or CookieBanner when not in screenshot (unless user asks)
- Hardcode page copy in layout TSX
- Write bare `&` in `__Renderings` `s:par`, lowercase GUIDs in `p:after`, or **`uid="{GUID}}"`** (extra `}` on layout `<r>` entries) — see [renderings-xml.md](references/renderings-xml.md)
- Create Partial Designs + Page Designs without **child** placeholder-setting YAML (`Header.yml`, `Footer.yml` under `Placeholder Settings/Partial Design/`) — site scaffold creates the folder only; see [partial-design-placeholder-settings/README.md](references/partial-design-placeholder-settings/README.md)
- Use site-specific paths — resolve from module config

---

## Scope control

If the page has 10+ sections, propose phased delivery (layout chrome first, then content bands) unless user requests full page in one pass.
