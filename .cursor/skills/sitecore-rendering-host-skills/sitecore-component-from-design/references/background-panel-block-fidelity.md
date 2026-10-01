# Background panel block fidelity — layered band + full-height image column

Applies to **`BackgroundPanelSection`** (and any `panel_block` / `jmpanelblock` band). Use with [boundary-rules §10](../../../mimic-website-skills/visual-cms-component-detection/references/boundary-rules.md#10-fixed-layout-slots-are-not-child-components), [media-frame-fidelity.md](media-frame-fidelity.md), and [column-split-layouts.md](column-split-layouts.md).

---

## Visual model (two layers — detect from PNG)

| Layer | What the screenshot shows | CSS / field |
|-------|---------------------------|-------------|
| **Outer band** | Full-width **background photo** visible above the H2, **below** the inner card, and at the sides | `BackgroundImage` on `.panel_block.jmpanelblock`; **keep section padding** (`padding-top` + **`padding-bottom`**) |
| **Inner card row** | Solid brand-colour block (e.g. blue) with **two columns**: photo \| text + CTA | `.jmpanelblock__row { background: … }` — not a repeating card grid |

**Screenshot signals (mandatory PNG check):**

1. Background texture/peek **under** the bottom edge of the inner card → **do not collapse** bottom padding on the outer band to “tighten” the layout.
2. Photo column **same height** as the text column (top and bottom edges align with the inner card).
3. H2 sits **on** the background layer, **outside** the solid inner row.
4. Only **one** editorial story — not 2–4 homogeneous teaser tiles (that is a montage grid).

**HTML / CSS signals (grep `section.html` + captured `main.css`):**

| Signal | Meaning |
|--------|---------|
| `panel_block`, `jmpanelblock` | Outer band wrapper |
| `background-image` on `#panel_block-*` or `.jmpanelblock` | `BackgroundImage` field |
| `.jmpanelblock { padding: 90px 0 100px }` (or inline `7.5rem 0`) | **Preserve** — bottom padding exposes background below inner card |
| `.jmpanelblock__row { background: #1E22AA }` | Inner card shell — distinct from outer background |
| `.text-panel-img` + `.text-panel-matter` | Role columns — image vs prose, not child cards |
| `.text-panel-img img { height: 100%; object-fit: cover }` | Image fills **full inner card height** |

---

## Field inventory (BackgroundPanelSection)

| UI region (PNG) | Field | Notes |
|-----------------|-------|-------|
| Full-bleed band behind H2 + below inner card | `BackgroundImage` | CSS `background-size: cover` on `.panel_block.jmpanelblock` |
| Section H2 | `Title` | Renders in `.jmpanelblock__header`, **outside** inner row |
| Left column photo | `Image` | Fills **100% height** of inner card column |
| Right column copy | `Body` | Multi-Line Text |
| CTA pill | `Cta` | General Link |

---

## Layout implementation (required)

### 1 — Padding on the background element

Apply **`padding-top` and `padding-bottom`** to the element that carries **`BackgroundImage`** (`.panel_block.jmpanelblock`), not only the outer `<section>`.

**Wrong:** zero bottom padding on the background wrapper so the inner blue row sits flush with the section edge — background no longer visible below the card.

**Right:** port captured `.jmpanelblock` padding (e.g. `90px 0 100px`) so the PNG’s background peek below the inner card is reproduced.

### 2 — Inner image = full column height

The photo column must **stretch to the text column height** (Bootstrap `.row` equal-height columns or explicit flex stretch).

```css
/* Pattern — scope under .background-panel */
.jmpanelblock__row > .col-md-6 { display: flex; flex-direction: column; }
.jm-panel.jmtext--panel-temp { position: relative; flex: 1; }
.text-panel-img {
  position: absolute;
  inset: 0 auto 0 -15px;   /* or left: -15px; height: 100% — match capture */
  width: calc(100% + 15px);
  overflow: hidden;
}
.text-panel-img img,
.text-panel-img .jm-img__cover-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

**Wrong:** fixed `min-height: 320px` on desktop when text column is taller — image stops short of card bottom.

**Wrong:** `FieldImage` `fill-width` or unconstrained height — photo does not fill inner card.

**Right:** `FieldImage` **`mode="cover"`** inside absolutely positioned `.text-panel-img`; column height driven by text sibling.

### 3 — Grep captured CSS before TSX

```bash
rg "jmpanelblock|panel_block|text-panel-img" design-screenshots/{page}/css/main.css
```

Port padding, row background, and `.text-panel-img` positioning from capture — do not invent spacing.

---

## Detection workflow (for decomposition + component build)

```
1. Open section desktop PNG
2. Count layers: background band + inner solid card? → BackgroundPanelSection (not TeaserGrid)
3. Measure: background visible below inner card? → note "keep bottom padding on jmpanelblock"
4. Measure: image column height = text column height? → note "stretch + cover, no fixed min-height"
5. Grep section.html for panel_block / jmpanelblock / text-panel-img
6. Grep captured main.css for .jmpanelblock padding and .text-panel-img rules
7. Write field inventory (BackgroundImage + Image + Title + Body + Cta)
8. Implement CSS before marking done — pass screenshot done gate
```

---

## Checklist

```
- [ ] PNG: background visible above H2 and below inner card (padding preserved)
- [ ] PNG: inner photo column same height as text column
- [ ] BackgroundImage on .panel_block.jmpanelblock (not only on <section>)
- [ ] jmpanelblock padding ported from captured CSS (top + bottom)
- [ ] jmpanelblock__row solid background colour from capture
- [ ] text-panel-img position absolute + height 100% + object-fit cover
- [ ] No arbitrary desktop min-height on image column
- [ ] Distinct from montage grid (4 tiles) — see boundary-rules §10
```

---

## Related

- [teaser-grid-archetypes.md](teaser-grid-archetypes.md) — montage grid is a different archetype
- [layout-archetype-detection.md](layout-archetype-detection.md)
- [section-field-inventory-from-screenshot.md](section-field-inventory-from-screenshot.md)
