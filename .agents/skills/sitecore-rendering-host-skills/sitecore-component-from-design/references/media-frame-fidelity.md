# Media frame fidelity — images that must match screenshot shape

When a section PNG shows a **video thumbnail**, **hero photo**, or **column image** with a specific **aspect ratio**, **crop**, or **viewport-specific art direction**, picking `fill-width` or guessing `aspect-ratio` without **measuring** produces frames that are too tall, too wide, or misaligned with page margins.

Apply with [image-display-modes.md](image-display-modes.md) and [column-split-layouts.md](column-split-layouts.md).

---

## Authority order for image shape

| Priority | Source | Use for |
|----------|--------|---------|
| 1 | **Section PNG** (desktop + mobile) | Visible frame bbox, alignment vs text column, page side margins |
| 2 | **Serialized media YAML** (`Width` / `Height` on downloaded assets) | **`aspect-ratio: W / H`** per art-direction asset |
| 3 | **`design-screenshots/{page}/css/main.css`** + `clay.css` | `object-fit`, container max-width, padding, column gutter |
| 4 | **`section.html`** | Art-direction URLs (desktop vs mobile `src`), wrapper classes |
| 5 | Datasource default media | Content only — not layout |

**Do not** guess aspect ratio (e.g. `766 / 540`) or copy `min-height` from unrelated breakpoints without measuring.

---

## Measure the frame (required)

Use **at least one** of these methods before writing CSS:

### A — From downloaded media YAML (fastest, most accurate for aspect ratio)

After `sitecore-media-from-url-yaml` / authoring download, read:

```yaml
Hint: Width
Value: 1200
Hint: Height
Value: 600
```

→ Desktop frame: `aspect-ratio: 1200 / 600` (2:1).

Repeat for **each** art-direction asset (e.g. mobile `654 × 690`).

Store in component CSS as custom properties:

```css
.title-description-video {
  --video-thumb-aspect-desktop: 1200 / 600;
  --video-thumb-aspect-mobile: 654 / 690;
}
```

### B — From section desktop/mobile PNG (bbox)

1. Open `{sectionFolder}-desktop-clean.png` at **known width** (e.g. 1440px).
2. Measure the visible image rectangle in px: `frameW × frameH`.
3. Set `aspect-ratio: frameW / frameH`.
4. Optional: `frameW / pageContentWidth` validates the media column width vs [column-split-layouts.md](column-split-layouts.md).

If section PNGs are missing, crop from `{page}/desktop-clean.png` or use method A.

### C — Cross-check against full-page PNG

On desktop, confirm:

- Image height ≈ title + body (usually **shorter** than title + body + CTA).
- Left/right margins match container (`container-fluid-max-xl` ≈ **1140px** centered, **15px** side padding, **30px** gutter between columns in common enterprise captures).

---

## Container and horizontal margins

Image “margins” are usually **page container padding + column gutter**, not margin on the `<img>`.

From captured project CSS:

| Token | Typical value |
|-------|----------------|
| `.container-fluid-max-xl` | `max-width: 1140px`, centered |
| `.container-fluid` padding | `15px` left/right |
| Bootstrap `.row` gutter | `30px` between columns (`gap: 30px` or 15px col padding) |

Implement these in the host stylesheet when `section.html` uses `container-fluid container-fluid-max-xl` — do not leave `container-fluid-max-xl` undefined.

---

## Workflow (every Image / VideoThumbnail field)

1. **Measure** aspect ratio (method A or B) for **desktop and mobile** assets separately.
2. **Grep captured CSS** for wrapper rules (`object-fit`, avoid blind `min-height`):
   ```bash
   rg "jmvideotempl img" design-screenshots/{page}/css/main.css
   ```
3. **Define parent frame** — `aspect-ratio: W / H` from measurement; **`min-height: 0`** unless PNG proves a floor; `overflow: hidden`.
4. **Child fills frame** — `column-cover` + `width/height: 100%` + captured `object-fit` (for some video thumbnails this may be `fill`).
5. **Art direction** — different desktop/mobile files → second Image field + `u-hide-mobile` / `u-hide-desktop`.
6. **Gate:** compare live desktop to section/full-page PNG — if image is **too tall**, aspect ratio or spurious `min-height` is wrong, not the asset.

---

---

## Background panel image column (`jmpanelblock` / `BackgroundPanelSection`)

Not the same as a fixed-aspect video frame — the photo column **fills the inner card height** (driven by the text column), with `object-fit: cover`.

| Signal | Implementation |
|--------|----------------|
| PNG: photo top/bottom align with inner blue card | Equal-height columns + `.text-panel-img { height: 100% }` |
| PNG: background visible below inner card | Keep `.jmpanelblock` **bottom padding** — do not collapse |
| Captured `.text-panel-img img { height: 100%; object-fit: cover }` | `FieldImage` `mode="cover"` in absolute fill shell |
| Arbitrary `min-height: 320px` on desktop | **Wrong** when text column is taller |

Full workflow: [background-panel-block-fidelity.md](background-panel-block-fidelity.md).

---

## Video thumbnail pattern (`jmvideotempl`)

| Signal | Implementation |
|--------|----------------|
| Desktop asset 1200×600, mobile 654×690 | CSS vars + `aspect-ratio` per breakpoint |
| `.jmvideotempl img { object-fit: fill }` | Frame sized first; then `fill` |
| JS swaps `src` by viewport | `VideoThumbnail` + `VideoThumbnailMobile` fields |
| Play button overlay | Absolute layer on `.jmvideotempl__thumb-frame` |

**Wrong:** `fill-width`, guessed `766/540`, or `min-height: 420px` without measurement → desktop image too tall.

**Right:** measured `1200/600` at 7/12 column width ≈ **332px** height inside 1140px container (not ~490px).

---

## Checklist

```
- [ ] Width × Height read from media YAML (per art-direction asset)
- [ ] aspect-ratio set from measurement (not guessed)
- [ ] No arbitrary min-height on desktop unless PNG/CSS proves it
- [ ] container-fluid-max-xl + padding + column gap match capture
- [ ] object-fit from captured CSS
- [ ] u-hide-* pair when mobile/desktop assets differ
- [ ] Desktop PNG: image height ≤ text column to CTA (usually stops above button)
- [ ] Test square upload — frame size unchanged
```

---

## Do not

- Guess aspect ratio or copy values from a different section/site
- Use `min-height: 600px` from mobile capture CSS on desktop
- Use `fill-width` for fixed-frame video/promo stills
- Omit `container-fluid-max-xl` rules when markup uses that class

See also [visual-fidelity.md](visual-fidelity.md) · [image-display-modes.md](image-display-modes.md) · [column-split-layouts.md](column-split-layouts.md).
