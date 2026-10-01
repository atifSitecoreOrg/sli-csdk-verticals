# Color palette extraction

`site-summary.json` and `page-manifest.json` → `design.colors` use a **five-category professional palette**. Each role (`primary`, `secondary`, `accent`, `neutrals`) is `{ hex: string[], gradients: string[] }` — solid colors and gradients are never mixed in one array.

---

## Categories

| Key | Role | `hex` | `gradients` |
|-----|------|-------|-------------|
| `primary` | Brand identity — nav, hero, logos, active states | 3–5 shades | 0–2 brand gradients |
| `secondary` | Supporting hues — footer, sub-nav, secondary UI | 1–2 colors | 0–1 |
| `accent` | Single CTA / action color | Exactly 1 | Usually `[]` |
| `neutrals` | Backgrounds, body text, borders | 5–10 gray/white/black | 0–2 neutral fades |
| `semantic` | System feedback: `success`, `error`, `warning`, `info` | Up to 4 (nullable) | — |

---

## Extraction pipeline (site-agnostic)

Colors are **not** guessed from screenshots. Sources, in order:

1. **Computed styles** on visible DOM (headings, sections, buttons, header/footer) — cookie/consent widgets excluded
2. **CSS custom properties** from live `:root` + downloaded stylesheets
3. **Semantic CSS rules** on page-matching selectors (hero, cta, header, section, …)
4. **Inline HTML** — `style=""` and `data-bgcolor` only

---

## Semantic colors — works on any site

Semantic detection is **not Sitecore-specific**. Two layers:

### 1. CSS variable names (any design system)

Variable **names** are matched with generic patterns:

| Slot | Matches variable names containing… |
|------|-----------------------------------|
| `success` | `--success`, `--green`, `green`, `success` |
| `error` | `--danger`, `--error`, `danger`, `destructive` |
| `warning` | `--warning`, `--yellow`, `--orange`, `amber` |
| `info` | `--info`, `--cyan`, `--sky` |

Examples that work today:

- **Bootstrap / Clay (Liferay):** `--success`, `--danger`, `--warning`, `--info`, `--green`, `--red`
- **Sitecore:** `--sc-green-500`, `--sc-red-800`, `--sc-sky-500`
- **Custom:** `--brand-success`, `--color-warning`, etc. (substring match)

Explicit semantic vars are kept even when the hex matches generic Bootstrap defaults (e.g. `--success: #28a745`).

### 2. HSL fallback (when no named token)

If a semantic slot is still empty, the script scans all sampled hex values and classifies by hue/saturation:

- Green (85°–155°) → `success`
- Red (≤20° or ≥355°) → `error`
- Orange/yellow (21°–55°) → `warning`
- Cyan/blue (165°–230°) → `info`

So a site that uses more green in UI will still surface a `success` color if it appears in DOM/CSS — even without `--sc-green-*` naming.

---

## Brand colors — generic + CMS extensions

### Generic (all sites)

| Category | CSS variable name patterns |
|----------|---------------------------|
| Primary | `--primary`, `--brand-primary`, `--brand-main`, `--theme-color`, keys containing `brand` + `primary` |
| Secondary | `--secondary`, `--brand-secondary` |
| Accent | `--accent`, `--cta`, `--action`, `--highlight` |
| Neutrals | `--neutral-*`, `--gray-*`, `--grey-*`, `--slate-*`, `--black`, `--white` |

Plus **usage-based** classification from computed styles (chromatic purples/blues → primary, dark navy → secondary, button colors → accent).

### CMS-specific extensions (optional boost)

When present, these add higher-confidence picks:

| Platform | Extra token patterns |
|----------|---------------------|
| **Sitecore** | `--sc-purple-500/600`, `--sc-blue-500`, `--sc-main-cta-color`, `--sc-gradient`, `--sc-neutral-*` |
| **Liferay** | `liferayThemeCSS` / `clay.css` variables (`--primary`, `--success`, …) |
| **AEM** | `clientlib-site` CSS variables + DOM sampling |

To support a **new** design system, extend patterns in `scripts/lib/extract-page-design.mjs` (`GENERIC_*_KEY`, `SC_*_TOKENS`, or add a new prefix block). Do not hard-code Sitecore-only logic in downstream skills — read whatever lands in `site-summary.json`.

---

## Gradients

Gradients are normalized (`rgb()` → hex) and stored in the matching role’s `gradients` array (not mixed with `hex`):

- Brand / hero / topbar gradients (e.g. `--sc-gradient`) → `primary.gradients`
- Nav / border gradients → `secondary.gradients`
- White/gray fade radials → `neutrals.gradients`
- CTA solid colors stay in `accent.hex` (button gradients usually roll up to `primary.gradients`)

---

## Regenerate

```bash
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/enrich-page-design.mjs \
  --project design-screenshots/{domain}
```

---

## Downstream usage

Read `colors.{role}.hex` and `colors.{role}.gradients` from `site-summary.json`, plus `colors.semantic`. Treat `semantic` values as nullable — not every site defines all four feedback colors in CSS.
