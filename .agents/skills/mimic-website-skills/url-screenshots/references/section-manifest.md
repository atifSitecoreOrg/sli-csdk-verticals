# Section manifest reference

Produced by `scripts/section-capture.mjs` under `{project}/sections/manifest.json`.

**Naming:** `cmsName` values must follow [`visual-cms-component-detection`](../visual-cms-component-detection/SKILL.md) taxonomy — visual analysis overrides DOM generic names.

## Layout

```
design-screenshots/{project}/
  sections/
    manifest.json              ← section screenshot registry (shared)
    component-blueprint.json   ← Sitecore rendering blueprints
    top-bar/
    header/
    navigation/
    footer/
    cookie-banner/
    hero-panel-section/
      hero-panel-section-desktop.png
      section.html
      section-plan.json         ← reviewable TSX/YAML build plan
    hero-panel-card/
  {page-slug}/
    page-manifest.json         ← section order for one page
    new-sections-manifest.json ← componentsToBuild + reuse vs promoted (see domain-section-merge.md)
    page-decomposition.json    ← Sitecore components + placeholders for this page
    sections/                  ← page-local staging (before merge to domain registry)
```

## Global manifest (`sections/manifest.json`)

```json
{
  "projectRoot": "…/design-screenshots/matthey-com",
  "sectionsRoot": "…/sections",
  "components": {
    "Header": {
      "cmsName": "Header",
      "folderName": "header",
      "type": "header",
      "scope": "site",
      "selector": "#banner",
      "reason": "Site header / banner landmark",
      "outputs": { "desktop": "header/header-desktop.png", … },
      "sectionHtml": "header/section.html",
      "captured": true,
      "seenOnPages": ["matthey-com--home", "matthey-com--about-us"]
    },
    "VerticalTeaserGrid": {
      "cmsName": "VerticalTeaserGrid",
      "type": "grid",
      "placeholderFor": "VerticalTeaserCard",
      "source": "visual",
      "confidence": "high"
    },
    "VerticalTeaserCard": {
      "cmsName": "VerticalTeaserCard",
      "type": "card",
      "parentSection": "VerticalTeaserGrid"
    }
  },
  "pages": [ … ]
}
```

## Section + Card split

When HTML shows a parent with **2+ similar children** (same class, e.g. `.hero-panels-panel`):

| Manifest entry | Sitecore role |
|----------------|---------------|
| `{Base}Section` | Section component with `<Placeholder>` |
| `{Base}Card` | Card component slotted in placeholder |

Example: `hero-panels-panel` × 2 → `HeroPanelSection` + `HeroPanelCard`.

## Cookie banner

If visible on load:

1. `CookieBanner` screenshots taken **with banner visible**
2. Banner dismissed (Accept All click or CSS hide)
3. Sticky navigation handling (below), then all other components captured

## Sticky navigation

If a header or nav bar is **fixed/sticky**:

1. `Navigation` (or sticky `Header`) screenshots taken **while the bar is visible**
2. Sticky nav hidden (CSS / remove fixed positioning)
3. Section discovery + all remaining component crops run **after** hide

See [sticky-navigation.md](sticky-navigation.md) for detection heuristics and manifest fields.

## Site-scoped deduplication

`Header`, `Footer`, `Navigation`, `CookieBanner` use `scope: "site"`. First page capture writes PNGs to `{domain}/sections/`; later pages skip re-capture and reference the same folder.

**Content sections** are staged under `{page-slug}/sections/`, then merged into `{domain}/sections/` — see [domain-section-merge.md](domain-section-merge.md). Only **new or visually different** bands are copied; identical fingerprints reuse the existing domain entry.

**Build queue:** `{page-slug}/new-sections-manifest.json` → `componentsToBuild[]` for [`sitecore-component-from-design`](../../sitecore-rendering-host-skills/sitecore-component-from-design/SKILL.md).
