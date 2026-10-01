# Component reuse validation (domain registry)

When [`sitecore-component-from-design`](../../sitecore-component-from-design/SKILL.md) or [`sitecore-page-from-design`](../../sitecore-page-from-design/SKILL.md) builds components from section screenshots, **check the domain registry before creating TSX/YAML**.

## Inputs

| File | Use |
|------|-----|
| `{domain}/sections/component-blueprint.json` | Existing Sitecore component names + fields for this domain |
| `{domain}/sections/manifest.json` | Section folders + `seenOnPages` |
| `{page-slug}/new-sections-manifest.json` | **`componentsToBuild`** — authoritative list for this page |
| `{domain}/sections/{folder}/*-desktop.png` | Visual comparison |

Paths are relative to `design-screenshots/{domain}/`.

## Decision flow

```
For each section on the page:
  Read new-sections-manifest.json
    buildComponent: false  → REUSE existing rendering (wire in page YAML only)
    buildComponent: true   → validate before create (below)

If building and proposed cmsName exists in component-blueprint.json:
  Open domain section PNG + existing component TSX (if any)
  Same layout, fields, placeholder pattern?
    YES → REUSE — do not create duplicate template/rendering
    NO  → CREATE variant with marketer-friendly unique cmsName
```

## Same look and feel (reuse)

Treat as **reuse** when **all** match:

| Check | Reuse signal |
|-------|----------------|
| Section fingerprint | Same as domain manifest entry (`action: reuse` in new-sections-manifest) |
| Screenshot | Same band structure (columns, card count, typography hierarchy) |
| `section.html` | Same landmark/class pattern and field-bearing nodes |
| `section-plan.json` | Same fields + placeholders |
| Existing TSX | Renders pixel-faithful to **this** section PNG |

**Examples:** `Header`, `Footer`, `Navigation`, `CookieBanner` on article pages; shared `ImageRichTextSection` when fingerprint matches science page block.

## Same name, different look (variant)

When proposed `cmsName` already exists in `component-blueprint.json` but the **new page section PNG** differs materially (different columns, fields, card pattern, hero layout):

1. **Do not** overwrite the existing component or YAML
2. Assign a **new marketer-friendly `cmsName`** from section heading + purpose — see [naming taxonomy](../../visual-cms-component-detection/references/naming-taxonomy.md)
3. Examples:
   - Existing `EventDetailHeroSection` (science landing) vs news article hero → `NewsArticleHeroSection`
   - Existing `ImageRichTextSection` vs press-release body → `ArticleBodySection`
4. Record in manifest review: `create (variant of EventDetailHeroSection)`
5. Use disambiguated folder from `new-sections-manifest.json` → `{domain}/sections/{domainFolder}/`

## Page assembly

[`sitecore-page-from-design`](../../sitecore-page-from-design/SKILL.md) Phase 4d reuse audit:

- Merge `componentsToBuild` from **all** `{page-slug}/new-sections-manifest.json` files processed in the session
- Skip TSX for components already in `editing-hosts/{app}/` **and** visually matching domain PNGs
- Add only **new** rows to user manifest review

## Do not

- Create a second `Header` because a new page was captured
- Reuse `ImageRichTextSection` when the article body has different fields (date, share icons, intro) — create `ArticleBodySection` instead
- Use section **folder names** as rendering names — use `cmsName` from blueprint / new-sections-manifest
