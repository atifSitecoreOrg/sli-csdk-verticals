# Image display modes — match screenshot for any authored asset

Authors can upload images with **any dimensions or aspect ratio**. TSX and CSS must enforce the **layout frame** from the section screenshot — not the pixel size of the source file.

Apply during [`sitecore-component-from-design`](../SKILL.md) Step 4 (TSX) and shared stylesheet work.

---

## Decide mode from screenshot + `section.html`

**First:** measure frame dimensions — [media-frame-fidelity.md](media-frame-fidelity.md) (media YAML `Width`/`Height` or section PNG bbox). Set `aspect-ratio` before choosing mode.

| Visual in screenshot | Mode | CSS intent | Typical DOM |
|----------------------|------|------------|-------------|
| Full-bleed background (hero, carousel slide) | **`cover`** | Fill frame; crop overflow (`background-size: cover` or `object-fit: cover`) | Absolute layer behind copy |
| Image column beside text (50/50 band) | **`column-cover`** | Width 100% of column; min-height fills column; `object-fit: cover` | `.s2c__col--img`, feature column |
| Card / tile header photo | **`column-cover`** or **`cover`** | Fixed-height head; image fills head | `.card__head` |
| Logo, icon, small mark | **`contain`** | Max width/height; preserve aspect; no crop | Header logo, link-card logo |
| Inline content width (diagram, portrait) | **`fill-width`** | `width: 100%`; height auto; `max-width: 100%` | Fluid column content |
| Video thumbnail / promo still in fixed box | **`column-cover`** + frame CSS | Parent `aspect-ratio` or `min-height` from PNG + captured `object-fit` (`fill` / `cover`) | `.jmvideotempl__thumb-frame`, hero still |

When `section.html` uses `background-image` on a div, use **`cover`** with a shell + hidden `<Image>` for Experience Editor field editing.

**Video thumbnails and column promos:** read [media-frame-fidelity.md](media-frame-fidelity.md) — `fill-width` alone is usually wrong.

---

## Implementation rules

1. **Never rely on intrinsic image size** — no fixed `width`/`height` from the source asset in TSX.
2. **Parent defines the frame** — hero min-height, slide height, card head min-height, column flex basis. Child image fills the frame.
3. **Always keep `<Image field={…}>`** (or project `FieldImage` wrapper) for Sitecore authoring — do not hardcode `src` in production JSX.
4. **Cover mode:** prefer a wrapper with `background-size: cover; background-position: center` plus `u-sr-only` `<Image>` for EE, **or** `object-fit: cover` on `<img>` with `width/height: 100%` inside an overflow-hidden parent.
5. **Contain mode:** `object-fit: contain` + explicit max dimensions on the img or wrapper.
6. **Add shared CSS** in `src/styles/{project}.css` for each mode class (e.g. `.jm-img--cover`, `.jm-img--contain`) — not one-off inline styles per component.
7. **Record measured `aspect-ratio`** on the frame wrapper (from media YAML or section PNG) — see [media-frame-fidelity.md](media-frame-fidelity.md).
8. **Verify with a tall, wide, and square test image** — layout frame must not change; only cropping/letterboxing adjusts.

---

## Reusable helper (required per editing host)

Add `src/lib/field-image.tsx` and project-scoped `.img--*` rules in **this host's** stylesheet (pattern only — do not import from other hosts).

```tsx
<FieldImage field={fields.Image} mode="cover" className="hero__bg2 u-hide-mobile" />
<FieldImage field={fields.Logo} mode="contain" className="header__logo" />
<FieldImage field={fields.Image} mode="column-cover" className="s2c__col__img" />
```

Copy the helper into new editing hosts or inline equivalent markup — the **mode + CSS contract** matters more than the file name.

---

## Checklist (per Image field)

- [ ] Screenshot display mode identified (cover / contain / fill-width / column-cover)
- [ ] Parent wrapper sets width/height or min-height from design
- [ ] CSS mode class applied; works for landscape, portrait, and square uploads
- [ ] EE still exposes Image field (not background-only without `<Image>`)
- [ ] Dual mobile/desktop images use `u-hide-*` on the **same mode**, not different sizing logic
- [ ] Video/promo frames: aspect-ratio + object-fit from captured CSS — [media-frame-fidelity.md](media-frame-fidelity.md)

---

## Do not

- Use raw `<img src={fields.Image.value.src}>` without fill/contain CSS
- Use `fill-width` for video hero thumbnails or fixed-frame promos without a parent frame — see [media-frame-fidelity.md](media-frame-fidelity.md)
- Assume datasource default media aspect matches future author uploads
- Skip stylesheet rules and rely on inline `style={{ width: image.naturalWidth }}`
- Use `FeatureCarouselCard` text-only cards when slides need full-bleed **cover** images
