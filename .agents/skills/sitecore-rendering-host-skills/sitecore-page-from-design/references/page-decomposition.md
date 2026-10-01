# Page decomposition patterns

When splitting a full-page screenshot into components, use top-to-bottom regions and assign types before implementation.

**Important:** Not every page includes every region. Use the full catalog in [page-regions.md](page-regions.md) and mark each as Present / Absent / Unclear — only build what the screenshot (and HTML) supports.

---

## Maximum page stack (reference only)

Many pages are a **subset** of this stack:

```
┌─────────────────────────────┐
│ Announcement bar (optional) │
├─────────────────────────────┤
│ Header (+ nav placeholder)  │
├─────────────────────────────┤
│ Breadcrumb (optional)       │
├─────────────────────────────┤
│ HeroBanner / PageTitle      │  optional — rarely both
├─────────────────────────────┤
│ Main: sections OR           │
│   SectionWrapper            │
│     ├─ main placeholder     │
│     └─ sidebar (optional)   │
├─────────────────────────────┤
│ Footer (+ link placeholders)│
└─────────────────────────────┘
     ╎ Cookie banner (optional) — sticky overlay, often bottom; may be
     ╎ absent from screenshot if consent already given
```

---

## Quick detection map

| Visual region | Component type | See page-regions.md |
|---------------|----------------|---------------------|
| Top bar, logo, menu | Header | Layout chrome |
| Link trail | Breadcrumb | Layout chrome |
| Full-bleed hero | HeroBanner / HeroSection | Hero & above-the-fold |
| Narrow title strip | PageTitleSection | Hero & above-the-fold |
| Main + side column | SectionWrapper + sidebar components | Layout with sidebar |
| Repeating tiles (grid) | Section + Card | Main content bands |
| Horizontal slides, dots | Section (**Carousel** variant) + Card | Main content bands |
| Composite hero (carousel + news + stats in one band) | Multiple sections per [composite-hero-band.md](../../sitecore-section-decomposition/references/composite-hero-band.md) | Hero & above-the-fold |
| Bottom link columns | Footer | Layout chrome |
| Sticky bar, cookie/policy text, Accept | CookieBanner | Layout chrome |

Full table with placeholders: [page-regions.md](page-regions.md).

---

## Implementation order

**Prerequisites before page YAML:**

1. `PartialDesignDynamicPlaceholder` in `editing-hosts/{app}/src/components/partial-design-dynamic-placeholder/` — [partial-design-dynamic-placeholder.md](partial-design-dynamic-placeholder.md)
2. Site `Partial Design` placeholder settings (`sxa-header`, `sxa-footer`) — **child YAML required**, not folder-only — [partial-design-placeholder-settings/README.md](partial-design-placeholder-settings/README.md)
3. Project placeholder settings + rendering **Placeholders** field for nested section/header/footer placeholders — [placeholder-settings.md](../../sitecore-content-sdk-component/references/placeholder-settings.md)

Build only **present** regions, in this dependency order:

1. **Layout chrome** — Header, Footer, Announcement, **CookieBanner** (if present or requested)
2. **Page shell** — Breadcrumb, SectionWrapper (if present)
3. **Hero / title** — HeroBanner or PageTitleSection (if present)
4. **Sections** — top → bottom in main column
5. **Card components** — before page YAML (placeholder Allowed Controls need Card rendering GUIDs)
6. **Sidebar components** — into sidebar placeholder of wrapper
7. **Page YAML** — wire renderings and datasources

---

## Dependency graph (example — omit absent nodes)

```
[AnnouncementSection]? 
HeaderSection
[Breadcrumb]?
[HeroSection | PageTitleSection]?
[SectionWrapper → main + sidebar]?  OR  stacked Sections
  StatsSection → StatCard
  FeatureSection
  GridSection → ItemCard
  CarouselSection (Carousel variant) → ItemCard
FooterSection
[CookieBanner]?   ← layout overlay; sticky bottom until accepted
```

---

## Page content tree

All content pages belong **under the `Home` item** in the Sitecore content tree. The `Home` item is the homepage (`/`). Do **not** create page items as direct children of the site root (siblings of `Home`).

| Design URL path | Serialized YAML path | Sitecore `Path` |
|-----------------|----------------------|-----------------|
| `/` | `{siteContentPath}/Home.yml` | `…/Home` |

**Homepage rule (critical):** when the mimicked URL is `/` (or language root only), put all homepage `__Renderings` on **`Home.yml`** itself. **Never** create `Home/Home.yml` or change `StartItem` to a nested child. See [homepage-authoring.md](homepage-authoring.md).

| `/about-us` | `{siteContentPath}/Home/About Us.yml` | `…/Home/About Us` |
| `/science-and-innovation` | `{siteContentPath}/Home/Science and Innovation.yml` | `…/Home/Science and Innovation` |
| `/about-us/our-strategy` | `{siteContentPath}/Home/About Us/Our Strategy.yml` | `…/Home/About Us/Our Strategy` |
| `/products/markets/pgms` | `{siteContentPath}/Home/Products/Markets/PGMs.yml` | `…/Home/Products/Markets/PGMs` |

**Rules:**

1. Parse the design URL pathname (strip domain, query, hash). Split on `/` and drop empty segments.
2. Map each segment to a Sitecore item name — title case with spaces (e.g. `about-us` → `About Us`, `science-and-innovation` → `Science and Innovation`).
3. Nest folders under `Home/` to mirror URL depth. Create intermediate **folder items** when a segment is not the final page (e.g. `Home/About Us/` folder before `Our Strategy` page).
4. Set `Parent` on each page YAML to its immediate parent item ID (`Home` item for top-level section pages).
5. Match on-disk folder structure to Sitecore path: `Home/About Us.yml` ↔ `Path: "…/Home/About Us"`.
6. Update `*.module.json` site include rules: a single `/home` rule with `ItemAndDescendants` covers all pages under Home — do **not** add separate site-root rules per page.

**Link-derived routes:** internal hrefs in Header, Footer, Navigation, and LinkList components define additional pages that must exist in the content tree — even without components. Harvest routes into `site-content-tree.json` and create **stub** page YAML for link-only paths. See [site-structure-from-links.md](site-structure-from-links.md).

---

## Page design mapping

Assign page designs **site-wide** via `TemplatesMapping` on the **Page Designs folder item** — never set `Page Design` on individual page YAML files under `Home/`.

| Artifact | Path | Field |
|----------|------|-------|
| Page Designs folder | `{siteContentPath}/Presentation/Page Designs.yml` | `TemplatesMapping` |
| Default page design | `{siteContentPath}/Presentation/Page Designs/Default.yml` | `PartialDesigns` (Header \| Footer GUIDs) |

**TemplatesMapping format** — URL-encoded `{PageTemplateGUID}={PageDesignGUID}`. Multiple mappings join with `%26` (`&`):

```yaml
# Presentation/Page Designs.yml — maps Page template → Default page design
SharedFields:
- ID: "ba1f60d6-3deb-40cc-bb61-eec772279ee1"
  Hint: TemplatesMapping
  Value: "%7b744B5800-BFBE-444F-99CC-AECB8C292990%7d%3d%257BF2255D3C-1A73-4D86-B91E-9B49D81C4029%257D"
```

Decoded: `{744B5800-BFBE-444F-99CC-AECB8C292990}={F2255D3C-1A73-4D86-B91E-9B49D81C4029}`

- **Left GUID** — page content template ID (e.g. `{project}/Page` template → `744b5800-bfbe-444f-99cc-aecb8c292990`)
- **Right GUID** — page design item ID (e.g. `Presentation/Page Designs/Default` → `f2255d3c-1a73-4d86-b91e-9b49d81c4029`)

When a new page template needs a different design, append `%26` + another `{template}={design}` pair (copy pattern from `authoring/items/millerhomes/site/Miller Homes/Presentation/Page Designs.yml`).

**Do not** add this to page items:

```yaml
# ❌ Wrong — omit from Home.yml and all Home/*.yml page items
- ID: "24171bf1-c0e1-480e-be76-4c0a1876f916"
  Hint: Page Design
  Value: "{f2255d3c-1a73-4d86-b91e-9b49d81c4029}"
```

---

## Page content YAML

After components exist, seed a page under `{siteContentPath}/Home/…` (never at site root):

- **Design input:** `{project}/sections/manifest.json` + `{page-slug}/page-manifest.json` from [`url-screenshots`](../../../mimic-website-skills/url-screenshots/SKILL.md)
- **Visual naming:** apply [`visual-cms-component-detection`](../../../mimic-website-skills/visual-cms-component-detection/SKILL.md) taxonomy to all `cmsName` values before build
- **Overlay crops:** `CookieBanner` and sticky `Navigation`/`Header` captured before dismiss/hide
- **Section + Card pairs:** when manifest has `HeroPanelSection` + `HeroPanelCard`, wire Card renderings inside the Section placeholder in page YAML
- Add renderings in visual top → bottom order (match `page-manifest.json` `sectionOrder`) — **mimicked pages only**
- **Do** create stub page YAML for every route in `site-content-tree.json` with `status: stub` — navigation must resolve to real items — [site-structure-from-links.md](site-structure-from-links.md)
- Reference datasource items under `Data/`
- Nest child renderings in section placeholders with correct keys + `DynamicPlaceholderId`
- For sidebar layouts, place sidebar renderings in the wrapper's sidebar placeholder
- **`__Renderings` XML:** follow [renderings-xml.md](renderings-xml.md) — escape `&amp;` in `s:par`; uppercase `uid` + `p:after` GUIDs (Content Editor breaks on invalid layout XML)
- **Presentation styles:** reuse scaffold Indent top/bottom/side — read GUIDs from that site's `Presentation/Styles/Spacing/*.yml` — [presentation-styles.md](presentation-styles.md)

Discover layout JSON from sibling pages in the same site include.

---

## One component at a time

For each **present** region, run [`sitecore-component-from-design`](../sitecore-component-from-design/SKILL.md) (inventory → assets → TSX → YAML).

---

## Avoid duplication

Search `src/components/` and existing renderings before creating Header, Footer, Breadcrumb, CookieBanner, or common sections. Reuse when ≥80% match.
