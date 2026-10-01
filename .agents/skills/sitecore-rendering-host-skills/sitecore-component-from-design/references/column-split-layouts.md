# Column-split layouts (text + media side-by-side)

When `section.html` shows a **fixed two-column band** (text left, image/video right — or inverse), implement **explicit layout CSS** in the editing host. Do not assume Bootstrap (or any grid framework) is loaded.

---

## Root cause to avoid

Captured HTML often uses Bootstrap classes:

```html
<div class="row">
  <div class="col col-lg-5">…text…</div>
  <div class="col col-lg-7">…video…</div>
</div>
```

**Copying those class names into TSX without the framework CSS produces a single stacked column** — exactly like mobile layout on desktop.

Content SDK editing hosts typically ship **custom** stylesheets (`src/styles/…`), not Bootstrap grid.

---

## Required workflow

1. **Read desktop section PNG first** — confirm columns are **side-by-side**, not stacked.
2. **Parse `section.html` for column ratios** — map `col-lg-5` / `col-lg-7` → ~42% / ~58%; `col-md-6` → 50% / 50%; note breakpoint prefix (`lg` ≈ 992px, `md` ≈ 768px unless project defines otherwise).
3. **Implement component BEM layout** — e.g. `{component}__ctn`, `{component}__col--text`, `{component}__col--media` with `display: flex` and `flex-basis` / `max-width` at the desktop breakpoint.
4. **Stack on mobile** — `flex: 1 1 100%` below the breakpoint; verify against mobile PNG (text above media unless capture shows otherwise).
5. **Inversed variant** — `flex-direction: row-reverse` on the container at desktop only if design shows media left.
6. **Gate:** compare live desktop route to **desktop section PNG** before marking done — stacked columns on wide viewport = layout failure even if copy and colors match.
7. **Media column:** grep captured CSS for `img` rules on the media wrapper; set frame + `object-fit` per [media-frame-fidelity.md](media-frame-fidelity.md).

---

## Reference pattern in this repo

| Pattern | Example component | Layout classes | When |
|---------|-------------------|----------------|------|
| Image + text **column-split** | `ImageRichTextSection` | `.{component}__ctn`, `__col--media`, `__col--text` | HTML shows explicit sibling columns |
| Image + text **rich-text-first** | `ImageRichTextSection` | `.{component}__body`, `__columns`, `__media` | HTML shows rich-text container plus media region |
| Text + video split | `TitleDescriptionVideoSection` | `.title-description-video__ctn`, `__col--text`, `__col--media` | HTML uses column structure or equivalent wrappers |

Reuse the **approach** (read capture → pick archetype → implement CSS), not TSX from another host — [project-isolation.md](project-isolation.md).

---

## CSS template (adapt ratios from capture)

```css
.{component}__ctn {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  width: 100%;
}
.{component}__col {
  flex: 1 1 100%;
  max-width: 100%;
  min-width: 0;
}
@media (min-width: 992px) {
  .{component}__col--text {
    flex: 0 0 41.666667%;
    max-width: 41.666667%;
  }
  .{component}__col--media {
    flex: 0 0 58.333333%;
    max-width: 58.333333%;
  }
}
```

Adjust breakpoint and percentages to match **this** section’s PNG and `col-*` classes.

---

## Do not

- Paste `row` / `col-lg-*` into TSX and stop — unless Bootstrap grid CSS is explicitly added to **this** host (rare).
- Rely on global `.row { display: flex; flex-wrap: wrap; gap: … }` alone — without column width rules, children still stack full-width.
- Mark a text+media section done after checking copy only — **column layout is part of fidelity**.

---

## Checklist

```
- [ ] Desktop PNG shows side-by-side columns
- [ ] Column width ratio extracted from section.html col-* classes
- [ ] Component-specific flex/grid CSS added to host stylesheet
- [ ] Mobile PNG shows stack order correct
- [ ] Inversed variant swaps columns when design requires
- [ ] Live desktop viewport matches desktop PNG (not stacked)
```

See also [standalone-vs-placeholder.md](standalone-vs-placeholder.md) (when to use one section vs grid+placeholder) and [visual-fidelity.md](visual-fidelity.md).
