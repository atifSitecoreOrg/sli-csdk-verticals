# Component reuse validation (before TSX/YAML)

Before creating a component for a section screenshot, read the page’s **`new-sections-manifest.json`** and domain **`component-blueprint.json`**.

Full rules: [component-reuse-validation.md](../../mimic-website-skills/visual-cms-component-detection/references/component-reuse-validation.md)

## Quick rules

| `new-sections-manifest` | Action |
|-------------------------|--------|
| `buildComponent: false` / `action: reuse` | Wire existing rendering in page YAML only |
| `buildComponent: true` / `action: promoted` | Create new component from `{domain}/sections/{domainFolder}/` |
| `action: variant` | Create **new** cmsName — same name exists but different look/fields |

When `cmsName` exists in blueprint but PNG/plan differs → **variant** with marketer-friendly name (e.g. `NewsArticleHeroSection`), never overwrite the existing component.
