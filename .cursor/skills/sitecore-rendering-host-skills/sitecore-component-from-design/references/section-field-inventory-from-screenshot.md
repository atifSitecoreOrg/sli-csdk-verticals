# Section field inventory from screenshot — mandatory before schema/YAML

**Problem this solves:** Components are copied from sibling editing hosts (JM2/JM3) with wrong field lists — e.g. a merged `HomeHeroEventsSection` with no `BackgroundImage` when the hero PNG clearly shows a full-bleed photo plus brand overlay.

**Rule:** Derive **every Sitecore field** from **this project's section PNGs + `section.html` + `page-decomposition.json`**. Never reuse another host's component name or field schema without opening **this** capture first.

---

## Hard blockers

| # | Gate | How to verify |
|---|------|----------------|
| 1 | **One page band = one parent component** | Count horizontal bands in desktop section PNG; each band gets its own rendering on the page — do not merge hero + grid because another host did |
| 2 | **Every visible image → Image field** | PNG shows photo/logo/background → template has `BackgroundImage`, `BrandImage`, `Image`, or `Logo` — **missing image field = automatic fail** |
| 3 | **Field inventory table written** | Before TSX/YAML: list UI element → field name → type → default from `section.html` |
| 4 | **`page-decomposition.json` wins over sibling patterns** | If decomposition lists `hero-banner` → `FullBleedHeroBannerSection` and `these-events-will-be-teaser-grid` → events grid, wire **two** renderings — not one merged component |
| 5 | **No sibling-host starting point** | Do not open `editing-hosts/jm3/...` or copy its TSX as step 1 — [project-isolation.md](project-isolation.md) |

---

## Workflow (before any TSX)

```
1. Open section PNGs (desktop → tablet → mobile) for THIS band only
2. List visible regions: backgrounds, overlays, titles, CTAs, repeating cards
3. For each region, assign a Sitecore field (Image, Text, Link, …)
4. Cross-check section.html for class names, copy, img src, hrefs
5. Cross-check page-decomposition.json — one parent per sectionFolder
6. If section-plan.json contradicts PNG (wrong fields, merged bands), fix the plan
7. Only then: Generate-RaiComponents / TSX / datasource YAML
```

---

## Example — RAI home (correct vs wrong)

| Section folder | PNG shows | Correct component | Required image fields |
|----------------|-----------|-------------------|------------------------|
| `hero-banner` | Full-bleed venue photo + brand element bottom-left | `FullBleedHeroBannerSection` | `BackgroundImage`, `BrandImage` |
| `these-events-will-be-teaser-grid` | H4 title + 6 logo cards + ALL EVENTS CTA | `HomeHeroEventsSection` + `EventListCard` × 6 | `Image` on each card |
| `core-technical-capabilities-*` | Background band + inner blue card; photo \| text; background peek below card | `BackgroundPanelSection` | `BackgroundImage`, `Image`, `Title`, `Body`, `Cta` — [background-panel-block-fidelity.md](background-panel-block-fidelity.md) |

**Wrong:** Single `HomeHeroEventsSection` with `Title` + `Subtitle` only (copied from another host) — cannot render hero photo or event logos.

---

## Checklist (copy into every section task)

```
Section field inventory
- [ ] Opened this section's PNGs (not a sibling host's component)
- [ ] Wrote field inventory table from PNG + section.html
- [ ] Every visible image mapped to an Image field
- [ ] page-decomposition.json: one parent component per section band
- [ ] Did not merge separate bands into one component
- [ ] section-plan.json corrected if fields ≠ PNG
- [ ] Passed screenshot done gate — [screenshot-done-gate.md](screenshot-done-gate.md)
```
