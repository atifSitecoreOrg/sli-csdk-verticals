# Domain section merge (page → site registry)

After **each page** is section-captured, content sections live under the **page folder** first, then merge into the **domain** registry.

## Paths (relative to repo root)

| Path | Role |
|------|------|
| `design-screenshots/{domain}/` | Site / host project root (`{domain}` = host slug, e.g. `matthey-com`) |
| `design-screenshots/{domain}/{page-slug}/sections/` | **Page-local staging** — content section crops for this URL only |
| `design-screenshots/{domain}/sections/` | **Domain registry** — deduplicated sections shared across pages |
| `design-screenshots/{domain}/{page-slug}/new-sections-manifest.json` | **Build queue** — sections that need new Sitecore components |

**Site chrome** (`Header`, `Footer`, `Navigation`, `CookieBanner`, `TopBar`) is captured **directly** into `{domain}/sections/` and skipped on later pages when unchanged.

## Why page-local staging exists

When `{domain}/sections/` already exists from a prior page (e.g. home or science-and-innovation), a new page capture must still:

1. Discover and crop **all bands on that page** under `{page-slug}/sections/`
2. Compare each band to the domain registry
3. Promote **only new or visually different** sections into `{domain}/sections/`

Without staging, agents may skip section capture entirely when domain sections exist — leaving new pages with only `page.html` and full-page PNGs.

## Merge actions

Implemented in `scripts/lib/merge-domain-sections.mjs` (called automatically from `section-capture.mjs`):

| Action | When | Domain `{domain}/sections/` | Component build? |
|--------|------|------------------------------|------------------|
| `reuse` | Same `cmsName` + same structure fingerprint | No copy — add page to `seenOnPages` | **No** — reuse existing component |
| `promoted` | First time this section type appears on the domain | Copy folder into domain registry | **Yes** |
| `variant` | Same `cmsName` as domain entry but **different** fingerprint | Copy under **new** marketer-friendly folder + `cmsName` | **Yes** — new component (do not overwrite) |

### Fingerprint

Hash of normalized `section.html` + desktop PNG size. Same fingerprint ⇒ same layout/structure ⇒ safe to reuse.

### Variant naming

When `cmsName` collides but look differs:

- **Folder:** `{page-short}-{original-folder}` (e.g. `pgm-market-report-article-hero-section`)
- **cmsName:** purpose prefix from section heading + original name (e.g. `PgmMarketReportArticleHeroSection`)
- Refine via [`visual-cms-component-detection`](../visual-cms-component-detection/SKILL.md) before YAML/TSX

## `new-sections-manifest.json`

Written under each `{page-slug}/` after merge:

```json
{
  "pageSlug": "matthey-com--media-2026-johnson-matthey-publishes-2026-pgm-market-report1",
  "pageDir": "matthey-com/matthey-com--media-2026-johnson-matthey-publishes-2026-pgm-market-report1",
  "componentsToBuild": ["NewsArticleHeroSection", "ArticleBodySection"],
  "sections": [
    {
      "action": "promoted",
      "cmsName": "NewsArticleHeroSection",
      "sourceCmsName": "ArticleHeroSection",
      "domainFolder": "news-article-hero-section",
      "buildComponent": true
    },
    {
      "action": "reuse",
      "cmsName": "Header",
      "buildComponent": false
    }
  ]
}
```

**Downstream skills** ([`sitecore-page-from-design`](../../sitecore-rendering-host-skills/sitecore-page-from-design/SKILL.md), [`sitecore-component-from-design`](../../sitecore-rendering-host-skills/sitecore-component-from-design/SKILL.md)) must:

- Build TSX/YAML only for entries in `componentsToBuild` (or `buildComponent: true`)
- Reuse existing renderings for `action: reuse`
- Read section crops from `{domain}/sections/{domainFolder}/` (not page staging)

## Manual merge (existing page folders)

If `section-capture.mjs` was not run but `{page-slug}/sections/` exists:

```bash
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/merge-page-sections.mjs \
  --page-dir "./design-screenshots/{domain}/{page-slug}"
```

Requires `{page-slug}/page-manifest.json` from a prior section capture.

## Agent checklist

- [ ] Every new URL runs **`section-capture.mjs`** (not only `capture.mjs`)
- [ ] `{page-slug}/sections/` exists after capture
- [ ] `{page-slug}/new-sections-manifest.json` lists promoted vs reused sections
- [ ] Domain `{domain}/sections/manifest.json` updated with `seenOnPages` for reused chrome
- [ ] Component skills consume `componentsToBuild` — do not rebuild Header/Footer when `reuse`
