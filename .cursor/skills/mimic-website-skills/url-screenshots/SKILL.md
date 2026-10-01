---
name: url-screenshots
description: Captures desktop, tablet, and mobile PNG screenshots plus rendered HTML (page.html) for one or more URLs using Playwright. Runs visual CMS component detection before DOM section discovery. Use when the user provides URLs instead of design uploads, before sitecore-page-from-design, or when asked to screenshot a website at multiple breakpoints.
paths:
  - "**/design-screenshots/**"
  - "**/screenshots/**"
---

# URL screenshots (desktop / tablet / mobile)

Capture **three breakpoint screenshots per URL** plus **rendered HTML** for use as design inputs — especially before [`sitecore-page-from-design`](../../sitecore-rendering-host-skills/sitecore-page-from-design/SKILL.md).

**HTML only (no PNGs):** [`url-page-html`](../url-page-html/SKILL.md) → `fetch-html.mjs`

Works alongside manual screenshot uploads: **either** attached images **or** URLs (or both).

**Viewports:** [references/viewports.md](references/viewports.md)

**Manifest reference:** [references/section-manifest.md](references/section-manifest.md) · **Domain merge:** [references/domain-section-merge.md](references/domain-section-merge.md) · **Section plan:** [references/section-plan.md](references/section-plan.md) · **Site summary:** [references/site-summary.md](references/site-summary.md) · **Site content tree:** [references/site-content-tree.md](references/site-content-tree.md) · **Color palette:** [references/color-palette.md](references/color-palette.md) · **Sticky overlays:** [references/sticky-overlays.md](references/sticky-overlays.md) · **Site chrome:** [references/sticky-navigation.md](references/sticky-navigation.md)

**Component detection:** [`visual-cms-component-detection`](../visual-cms-component-detection/SKILL.md) — visual-first section detection on page screenshots (required before finalizing manifest)

**Section decomposition:** [`sitecore-section-decomposition`](../../sitecore-rendering-host-skills/sitecore-section-decomposition/SKILL.md) — after section crops are stored, map each section to Sitecore components + placeholders

- [scripts/capture.mjs](scripts/capture.mjs) — full-page screenshots + HTML (default)
- [scripts/section-capture.mjs](scripts/section-capture.mjs) — **auto-discover sections** + per-component element screenshots + `section-plan.json`
- [scripts/merge-page-sections.mjs](scripts/merge-page-sections.mjs) — promote `{page-slug}/sections/` → `{domain}/sections/` (manual re-run)
- [scripts/lib/merge-domain-sections.mjs](scripts/lib/merge-domain-sections.mjs) — fingerprint compare + `new-sections-manifest.json`
- [scripts/enrich-page-design.mjs](scripts/enrich-page-design.mjs) — download CSS + extract fonts/colors for existing page folders; writes `site-summary.json`
- [scripts/write-site-summary.mjs](scripts/write-site-summary.mjs) — regenerate `site-summary.json` from existing page manifests (no browser)
- [scripts/write-site-content-tree.mjs](scripts/write-site-content-tree.mjs) — harvest internal links → `site-content-tree.json` for stub page YAML
- [scripts/lib/build-site-content-tree.mjs](scripts/lib/build-site-content-tree.mjs) — link harvest + route → Sitecore path mapping
- [scripts/fetch-html.mjs](scripts/fetch-html.mjs) — HTML only
- [scripts/lib/discover-sections.mjs](scripts/lib/discover-sections.mjs) — DOM section discovery heuristics
- [scripts/lib/cookie-banner.mjs](scripts/lib/cookie-banner.mjs) — cookie banner detect / dismiss / hide
- [scripts/lib/sticky-overlays.mjs](scripts/lib/sticky-overlays.mjs) — detect/hide cookie, nav, topbar, chat, side buttons
- [scripts/lib/site-chrome.mjs](scripts/lib/site-chrome.mjs) — legacy header/nav helpers (superseded by sticky-overlays)
- [scripts/lib/sticky-navigation.mjs](scripts/lib/sticky-navigation.mjs) — legacy sticky-only detection (superseded by site-chrome for capture)

---

## When to apply

| Trigger | Action |
|---------|--------|
| User provides one or more URLs to build from | Run capture → pass PNGs to page-from-design |
| User says “screenshot this site/page” | Run capture |
| Page-from-design starts but only URLs given (no uploads) | Run this skill first (Phase 0) |
| User already attached desktop/tablet/mobile PNGs | **Skip** — use uploads directly |

---

## One-time setup

The skill is **self-contained** — it does not require `industry-verticals/travel` or any app folder.

From the skill directory (path may differ per repo; resolve `.cursor/skills/mimic-website-skills/url-screenshots/`):

```bash
cd .cursor/skills/mimic-website-skills/url-screenshots
npm install
npm run setup
```

`npm run setup` runs `playwright install chromium` (browser binary, ~once per machine).

**Agent rule:** If capture fails with “Could not find playwright”, run `npm install` and `npm run setup` in the skill folder before retrying.

**Fallback:** If another project in the workspace already has `playwright` installed, the script discovers it by walking up from the current directory. Optional `industry-verticals/*` apps are scanned only when that folder exists.

Run capture from **any** working directory:

```bash
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/capture.mjs --urls "https://www.example.com"
```

Or via npm from the skill folder:

```bash
npm run capture -- --urls "https://www.example.com" --manifest
```

---

## Capture workflow

### 1. Confirm inputs

| Input | Required |
|-------|----------|
| URL(s) | At least one `http(s)://` URL |
| Output folder | Optional — default `./design-screenshots` |
| Local dev | Dev server running if URL is `localhost` |

### 2. Run script

**Comma-separated URLs:**

```bash
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/capture.mjs \
  --urls "https://www.example.com,https://www.example.com/about" \
  --out "./design-screenshots/example-site" \
  --manifest
```

**URL list file** (`urls.txt` — one URL per line, `#` comments allowed):

```bash
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/capture.mjs \
  --file urls.txt \
  --out "./design-screenshots" \
  --manifest
```

**Positional URL** (also accepted):

```bash
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/capture.mjs https://www.example.com
```

### 3. Options

| Flag | Default | Purpose |
|------|---------|---------|
| `--full-page` | on | Full scroll capture for page decomposition |
| `--viewport-only` | — | Above-the-fold only |
| `--wait-ms 2000` | 1500 | Wait after `networkidle` |
| `--devices desktop,tablet` | all three | Subset of breakpoints |
| `--manifest` | off | Write `manifest.json` with paths |
| `--no-html` | off | Skip `page.html` |

### Output layout

```
design-screenshots/{project}/                    ← e.g. rai-nl (one folder per site/host)
  sections/                                      ← site-specific; shared across pages of this site only
    manifest.json                                ← global component registry
    header/
      header-desktop.png
      header-tablet.png
      header-mobile.png
      section.html                 ← outerHTML of the matched section element
      section-plan.json            ← reviewable TSX + YAML build plan (before authoring)
    footer/
    cookie-banner/                               ← captured BEFORE dismiss (if visible)
    navigation/                                  ← captured BEFORE hide (if sticky/fixed)
    hero-panel-section/
    hero-panel-card/
    …
  {page-slug}/
    desktop.png              ← full page WITH sticky overlays
    desktop-clean.png        ← full page AFTER sticky overlays hidden
    tablet.png / tablet-clean.png
    mobile.png / mobile-clean.png
    page.html
    source-url.txt
    page-manifest.json                           ← section order + design tokens (fonts, colors, css/)
    css/                                         ← key downloaded stylesheets
    site-summary.json                            ← aggregated fonts, colors, sections (project root)
```

**Site-scoped components** (`Header`, `Footer`, `Navigation`, `CookieBanner`) are screenshot **once** — subsequent pages reuse existing crops.

**Dual screenshot sets** — see [sticky-overlays.md](references/sticky-overlays.md):

| Mode | Files | Used to detect |
|------|-------|----------------|
| **Overlay** | `{device}.png`, `{section}-{device}.png` | Sticky UI: CookieBanner, TopBar, Header, Navigation, ChatWidget, FloatingActionButton |
| **Clean** | `{device}-clean.png` | Full-page content view (sticky overlays hidden) |
| **Section HTML** | `sections/{folder}/section.html` | outerHTML of the discovered section element (saved with first capture) |

**Capture order** (per page):

1. **Cookie banner first** — detect → capture while visible (all viewports) → hide banner + dim backdrop
2. **Other sticky overlays** — TopBar, Header, Navigation, chat (after cookie hidden; re-capture if cookie was present on a prior run)
3. **Full-page** — per viewport: overlay PNG → hide all sticky → clean PNG
4. **Visual section detection** on **clean** full-page screenshots
5. **Section crops** — one PNG per viewport; **site chrome hidden before every content crop**; selector re-resolved per viewport
6. **Section HTML** — `section.html` in each section folder (outerHTML of matched element)
7. **Design tokens** — downloads key CSS into `{page}/css/`, extracts fonts + five-category palette (`primary`, `secondary`, `accent`, `neutrals`, `semantic`) into `page-manifest.json` → `design`. Each role is `{ hex, gradients }` — solid colors and gradients are never mixed in one array. Extraction is **site-agnostic** (DOM + CSS variable names + HSL); Sitecore `--sc-*` is one optional extension. Semantic colors use generic names (`--success`, `--green`, `--danger`, …) on any site — see [color-palette.md](references/color-palette.md). Re-run with `enrich-page-design.mjs` to refresh without re-capturing PNGs.
8. **Section plan** — `section-plan.json` in each section folder: start with `review.narrativeSummary` (components, **placeholder keys**, what goes inside each placeholder, parent vs child fields), then check `responsiveLayout` when desktop/tablet/mobile differ, and **`review.contentGuidance`** when the image column in the screenshot contains text baked into the image asset (do not add extra fields for that text)
9. **Site summary** — `site-summary.json` at project root: merged typography, palette, and section inventory across all pages
10. **Site content tree** — `site-content-tree.json` at project root: internal routes from header/footer/nav links + captured pages (run `write-site-content-tree.mjs` after section HTML exists). See [site-content-tree.md](references/site-content-tree.md) and [site-structure-from-links.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/site-structure-from-links.md).
11. **Decompose** (optional) → `component-blueprint.json` + `page-decomposition.json`

Use `--refresh-chrome` to force re-capture of site-scoped overlays (Header, TopBar, CookieBanner, …) even when already in the manifest.

HTML is saved on the **first** device load (same DOM as desktop capture). Use [`html-analysis.md`](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/html-analysis.md) in page-from-design.

### 4. Section discovery + component crops (required before page-from-design)

After full-page capture (and HTML saved), **automatically discover main page sections** — do **not** ask the user to list components upfront.

**Visual-first rule:** Run [`visual-cms-component-detection`](../visual-cms-component-detection/SKILL.md) on:
- **Overlay** shots (`desktop.png`) — sticky components only
- **Clean** shots (`desktop-clean.png`) and `-clean` section crops — content sections

Rename generic DOM outputs to taxonomy names before finalizing manifest.

```bash
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/section-capture.mjs \
  --urls "https://www.example.com/,https://www.example.com/about" \
  --out "./design-screenshots/example-site" \
  --load domcontentloaded
```

Use `--no-decompose` when you only need screenshots + section HTML (skip Sitecore blueprint JSON).

Use `--refresh-chrome` to re-capture site-scoped overlays (CookieBanner, Header, TopBar, Navigation) even if already stored in the manifest.

Or from existing page captures: `--page-dir "./design-screenshots/example-site/page-slug"`

**Cookie banner workflow:**

1. If a cookie/consent banner is visible on first load → capture `CookieBanner` screenshots (desktop / tablet / mobile) **while the banner is shown**
2. **Hide the banner and any dimming backdrop** (TrustCommander `#tc-privacy-wrapper`, OneTrust dark filter, etc.)
3. **Then** capture TopBar, Header, Navigation — without the grey overlay
4. If Header was previously captured with a cookie backdrop active, re-capture automatically when cookie is detected (or pass `--refresh-chrome`)
5. Continue to content section discovery and crops **without** overlays

**Cookie CMP support:** OneTrust, Osano, **TrustCommander** (`#tc-privacy-wrapper`), Didomi, Cookiebot, Usercentrics, plus a **generic heuristic** for fixed privacy/consent overlays (see `cookie-banner.mjs`).

**Site chrome workflow (required — not optional):**

Content section screenshots must **never** include the site header or primary navigation.

1. **Capture** `TopBar` (if present), then `Header`, then `Navigation` — desktop / tablet / mobile
2. **Hide** all site chrome before section discovery and before each content section crop (`Header`, `Navigation`, `TopBar`, cookie, chat, fixed top bars)
3. **Discover + capture** content section bands only after hide → `sections/{folder-name}/`

See [sticky-navigation.md](references/sticky-navigation.md) and [boundary-rules.md](../visual-cms-component-detection/references/boundary-rules.md).

**Important distinctions:**

| Component | When captured | Hidden before other crops? |
|-----------|---------------|----------------------------|
| `CookieBanner` | On first load, before dismiss | Yes |
| `TopBar` / `Header` / `Navigation` | After cookie dismiss; always hidden before content crops | Yes |
| Content sections, grids, footer | After site chrome hidden | — |

**What it does:**

1. Loads the live page
2. Captures cookie banner (if present), then dismisses it
3. Captures sticky navigation (if detected), then hides it
4. **Visual component detection** — analyze screenshots per [`visual-cms-component-detection`](../visual-cms-component-detection/SKILL.md)
5. DOM inspection via `discover-sections.mjs` — selectors and bounds validation only
6. Merges visual taxonomy names into `cmsName` (visual names override DOM generic names)
7. Creates **page-local** `{page-slug}/sections/{folder-name}/` for content bands
8. **Merges** into domain `{domain}/sections/` — reuses unchanged chrome/content; promotes only new/different bands — see [domain-section-merge.md](references/domain-section-merge.md)
9. Writes `{page-slug}/new-sections-manifest.json` with `componentsToBuild` for component skills
10. Captures element screenshots: `{folder-name}-{viewport}.png`
11. Saves section HTML: `{folder-name}/section.html` (outerHTML of the matched element)
12. Downloads key CSS + extracts fonts/colors into `page-manifest.json` → `design`
13. Writes `section-plan.json` per section folder (review before TSX/YAML)
14. Writes global `sections/manifest.json` + per-page `page-manifest.json` + `site-summary.json`
15. Runs [`sitecore-section-decomposition`](../../sitecore-rendering-host-skills/sitecore-section-decomposition/SKILL.md) → `component-blueprint.json` + `page-decomposition.json` (skip with `--no-decompose`)

**Output layout (per domain):**

```
design-screenshots/{domain}/
  sections/                          ← all section screenshots live here
    manifest.json
    component-blueprint.json         ← Sitecore rendering names + fields
    header/, top-bar/, footer/, …
    {section-folder}/
      {section-folder}-desktop.png
  {page-slug}/
    desktop.png                      ← full-page reference
    sections/                        ← page-local staging (content sections for this URL)
    new-sections-manifest.json       ← promoted vs reused; componentsToBuild for downstream skills
    page-manifest.json
    page-decomposition.json          ← page assembly plan
```

**Discovery pipeline:**

| Step | Source | Purpose |
|------|--------|---------|
| 1 | Full-page screenshot (visual) | Identify section bands top → bottom |
| 2 | Section crops | Store in `sections/{folder-name}/` |
| 3 | `discover-sections.mjs` (DOM) | Selectors, landmarks, repeat counts |
| 4 | Merge | Section screenshot `cmsName` from visual skill; `selector` from DOM |
| 5 | Section decomposition | Map sections → Sitecore parent + child components |

**DOM fallback rules** (when visual analysis is unavailable — implement in `discover-sections.mjs`):

| Signal | `cmsName` / type |
|--------|------------------|
| Thin strip above header (utilities, promo) | `TopBar` |
| `<header>`, `#banner` | `Header` (capture before hide) |
| `<nav role="navigation">` | `Navigation` (capture before hide when separate from header) |
| Cookie / OneTrust banner | `CookieBanner` (capture before dismiss) |
| First main band + `h1` | `HeroBanner` (prefer over generic `HeroSection`) |
| Swiper / slider / `.owl-carousel` | `HeroCarousel` (full-bleed) or teaser carousel — see decomposition |
| **Composite hero band** (carousel widget + panel row in one DOM band) | `CompositeHeroBand` → `CompositeHeroBandSection` + child placeholders — [composite-hero-band.md](../../sitecore-rendering-host-skills/sitecore-section-decomposition/references/composite-hero-band.md) |
| **AEM compound section** (one `.cmp-container--section` with multiple title + content blocks) | Split into separate bands; use `bandSelectors` for title + grid/carousel crops |
| **Corporate AEM page grid** (Bekaert-style `.contentBlockMain`, `.corporateCards`, …) | One section per `.aem-GridColumn` content component under `.root.responsivegrid` |
| Image + text block | `RichTextImageBlock` or `HorizontalFeatureBlock` |
| Row of metric tiles | `StatsBar` + `StatsItem` |
| `<footer>` | `Footer` |
| **Sitecore JSS / Next.js** (`#web-default-layout`, `.flex-container.component`) | `HeroBanner`, `{Purpose}TeaserGrid` + `EventListCard`, `NewsArticlesSection` + `NewsArticleCard`, `CalendarListingSection`, `EventDetailHeroSection`, `EventDetailInfoSection` |
| **Repeated child blocks** | `{Purpose}TeaserGrid` / `{Purpose}LinkGrid` + `placeholderFor` (no title-row card crop) |
| Background image + text | `{Purpose}BackgroundImageBlock` |
| Side-by-side image + text | `{Purpose}HorizontalFeatureBlock` |
| Text + CTA, no image | `{Purpose}CtaBlock` |

**Section + Card split (placeholder pattern):**

When a parent container holds **2+ structurally similar children** (visually or in DOM), emit **two** components using the [naming taxonomy](../visual-cms-component-detection/references/naming-taxonomy.md):

**Exception:** when the same band also contains `.owl-carousel` (or similar) **and** a `.panels-hero-panels` row, classify as **composite hero** — do not reduce the whole band to `HorizontalLinkCardGrid`. See [composite-hero-band.md](../../sitecore-rendering-host-skills/sitecore-section-decomposition/references/composite-hero-band.md).

| Role | Naming | Sitecore mapping |
|------|--------|------------------|
| Parent (includes section title) | e.g. `ExploreMoreTeaserGrid`, `StatsBar` | Section with `sectionTitle` field + `<Placeholder>` |
| Repeating tile (metadata only) | e.g. `VerticalTeaserCard` | Card in placeholder — **no separate screenshot** unless a valid repeating tile crop exists |

Derive names from **section heading + layout** (background image, horizontal, CTA-only). See [boundary-rules.md](../visual-cms-component-detection/references/boundary-rules.md).

When semantic tags are missing, infer from large visual blocks — never crop every `div`. See [`visual-cms-component-detection`](../visual-cms-component-detection/SKILL.md).

### 5. Hand off to design skills

After capture, tell the user where files are saved and continue with:

- [`sitecore-page-from-design`](../../sitecore-rendering-host-skills/sitecore-page-from-design/SKILL.md) — read manifest + run [`visual-cms-component-detection`](../visual-cms-component-detection/SKILL.md) to refine inventory
- [`sitecore-component-from-design`](../../sitecore-rendering-host-skills/sitecore-component-from-design/SKILL.md) — one `cmsName` entry = one component task

Reference paths:

```
design-screenshots/{project}/sections/manifest.json
design-screenshots/{project}/sections/{folder}/{folder}-desktop.png
design-screenshots/{project}/{page-slug}/page-manifest.json
design-screenshots/{project}/{page-slug}/page.html
```

Set **base URL** for asset download to the captured page’s origin (from `source-url.txt`).

---

## Coexistence with manual uploads

| Source | Priority |
|--------|----------|
| User attached PNGs in chat | Use attachments — do not re-capture unless user asks |
| User provided URLs only | Run this skill first |
| Both URLs and attachments | Prefer **attachments** for the page being built; use URL capture for **additional** pages |
| User says “refresh screenshots from URL” | Re-run capture, overwrite `--out` folder |

Never discard user uploads in favor of automated capture without asking.

---

## Verification

- [ ] Each URL produced `desktop.png`, `tablet.png`, `mobile.png` (or requested subset)
- [ ] `page.html` present (unless `--no-html`)
- [ ] `sections/manifest.json` at **project** level with taxonomy `cmsName` per component (not generic DOM names)
- [ ] Visual detection skill applied; parent/child grid pairs use taxonomy names (`VerticalTeaserGrid` + `VerticalTeaserCard`, not three unrelated cards)
- [ ] Each `{page-slug}/sections/` exists after section capture (page-local staging)
- [ ] `{page-slug}/new-sections-manifest.json` lists promoted vs reused sections
- [ ] Domain `{project}/sections/` contains only deduplicated registry (not overwritten by unrelated pages)
- [ ] Cookie banner captured before dismiss when visible; remaining crops taken after dismiss
- [ ] Sticky navigation captured before hide when detected; section discovery + remaining crops taken after hide
- [ ] Each section folder has `{folder-name}-desktop.png`, `-tablet.png`, `-mobile.png`
- [ ] Section+Card pairs present in manifest when HTML has repeated child blocks (`placeholderFor` / `parentSection`)
- [ ] Images are readable (not error pages / login walls unless intentional)
- [ ] `source-url.txt` matches intended URL
- [ ] For localhost — dev server was running during capture
- [ ] Output path communicated before starting page-from-design

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Could not find playwright` | `cd .cursor/skills/mimic-website-skills/url-screenshots && npm install && npm run setup` |
| `Executable doesn't exist` (browser) | `npm run setup` in the skill folder |
| Blank / partial page | Increase `--wait-ms`; check network tab manually |
| Timeout | Increase `--timeout-ms 120000` |
| Login redirect | Use public URL or authenticated storage state (custom extension) |
| Cookie banner in every shot | Re-run section capture; ensure dismiss/hide runs before discovery |
| Sticky nav overlays section crops | Re-run section capture; ensure sticky nav hide runs before discovery |
| Sticky nav not detected | Check computed `position`; scroll page before capture; add site-specific selector to hide script |
| Only header/footer found (no content sections) | Site may use Sitecore JSS / Next.js layout (`#web-default-layout`) — ensure `discover-sections.mjs` is current; re-run with `--refresh-chrome` |
| Sections merged into `design-screenshots/sections/` | Pass `--out ./design-screenshots/{host-slug}` or let auto host-slug resolution run (do not use bare `./design-screenshots` for multi-site repos without host subfolder) |
| New page has no `{page-slug}/sections/` | Run `section-capture.mjs` for that URL — `capture.mjs` alone does not create sections; domain registry from a prior page does not replace per-page capture |

---

## Do not

- Capture URLs the user did not provide
- Commit large screenshot folders to git unless user requests
- Assume screenshots replace HTML — **always use HTML when available** for copy, links, and landmarks
- Block page-from-design on failed mobile capture if desktop succeeded — proceed with available breakpoints and note gaps
