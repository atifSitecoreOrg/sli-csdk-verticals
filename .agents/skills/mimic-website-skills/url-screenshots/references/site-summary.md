# Site summary (`site-summary.json`)

Concise, site-wide design reference — **not** page-by-page.

| File | When written | Purpose |
|------|--------------|---------|
| `{page}/page-manifest.json` → `design` | During capture / enrich | Per-page detail (fonts, colors, CSS paths) |
| `{page}/css/*.css` | During capture / enrich | Downloaded stylesheets |
| `site-summary.json` | After section-capture or `enrich-page-design.mjs` | Merged URLs, fonts, colors, section names |

**Color palette details:** [color-palette.md](color-palette.md) — five categories, generic vs CMS-specific extraction, semantic detection.

---

## Location

```
design-screenshots/{domain}/
  site-summary.json              ← read this first
  matthey-com--home/
    page-manifest.json           ← per-page design detail
    css/
  sections/
    manifest.json
```

---

## Schema

```json
{
  "version": 1,
  "project": "matthey-com",
  "urls": ["https://matthey.com/", "https://matthey.com/about-us"],
  "sections": {
    "site": ["CookieBanner", "Footer", "Header"],
    "content": ["HorizontalLinkCardGrid", "RichTextImageBlock"]
  },
  "fonts": [
    { "family": "JMSansMedium", "weight": 608, "sources": ["…woff2", "…woff"] }
  ],
  "colors": {
    "primary": {
      "hex": ["#1e22aa"],
      "gradients": []
    },
    "secondary": {
      "hex": ["#c8c8e9"],
      "gradients": []
    },
    "accent": {
      "hex": ["#0062cc"],
      "gradients": []
    },
    "neutrals": {
      "hex": ["#212529", "#6c757d", "#f2f2f2", "#ffffff"],
      "gradients": []
    },
    "semantic": {
      "success": "#28a745",
      "error": "#dc3545",
      "warning": "#ffc107",
      "info": "#17a2b8"
    }
  },
  "stylesheets": ["clay.css", "main.css"]
}
```

### `colors` — five categories

Each palette role (`primary`, `secondary`, `accent`, `neutrals`) is an object with separate arrays:

| Sub-key | Contents |
|---------|----------|
| `hex` | Solid `#rrggbb` values for that role |
| `gradients` | CSS gradient strings classified into that role |

| Role | Typical `hex` | Typical `gradients` |
|------|---------------|---------------------|
| `primary` | 3–5 brand shades | 0–2 brand/hero/topbar gradients |
| `secondary` | 1–2 supporting colors | 0–1 nav/border gradients |
| `accent` | Exactly one CTA color | Usually empty |
| `neutrals` | 5–10 grays/whites | 0–2 neutral fade radials |
| `semantic` | Object with `success`, `error`, `warning`, `info` (any may be `null`) | — |

Hex and gradients are **never mixed** in the same array. There is no top-level `gradients` or `other` key.

Extraction is **site-agnostic** (DOM + CSS variable names + HSL heuristics). Sitecore `--sc-*` tokens are one supported extension — see [color-palette.md](color-palette.md).

---

## Regenerate

```bash
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/enrich-page-design.mjs \
  --project design-screenshots/matthey-com
```

---

## Downstream skills

| Skill | Reads from `site-summary.json` |
|-------|-------------------------------|
| `sitecore-component-from-design` | `fonts`, `colors` |
| `sitecore-page-from-design` | `urls`, `sections` (+ `sections/manifest.json` for detail) |
| Theme / scaffold setup | `fonts`, full `colors` object |
