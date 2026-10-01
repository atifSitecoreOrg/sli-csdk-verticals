# Panel / tile link patterns (decorator-only CTA)

Captured sites often emit **two `<a>` elements** with the same `href`:

```html
<a class="text-panel-full-link text-panel-full-link-hgt" href="…" aria-label="…"></a>
<div class="text-panel-link">
  <a href="…" aria-label="Read the Full Article">
    <span class="arrow__forward"></span>
  </a>
</div>
```

The first link is an **invisible overlay** for a larger click target on the static site. The second is the **visible arrow** in the corner.

---

## Headless mimic rule — render the visible link only

**For Sitecore Content SDK components, implement only the visible decorator link** unless the screenshot proves a full-tile click target is missing *and* you can position an overlay without affecting layout.

| Captured HTML | Headless TSX |
|---------------|--------------|
| `text-panel-full-link` (empty overlay) | **Skip** — do not add a second `<SitecoreLink>` |
| `text-panel-link` + `arrow__forward` | **One** `<SitecoreLink>` with icon child only |

```tsx
<div className="text-panel-link">
  <SitecoreLink field={fields.Cta} aria-label="Read the Full Article">
    <span className="arrow__forward" aria-hidden="true" />
  </SitecoreLink>
</div>
```

### Why not replicate the overlay?

1. **Screenshot fidelity** — the PNG shows title, body, and corner arrow. No visible “Read more” text or extra vertical space.
2. **Layout breakage** — overlay classes (`text-panel-full-link`, `text-panel-full-link-hgt`) often set `height: 75%` or `position: absolute`. With parent wrappers using `position: static` (e.g. `.panels-hero-panels`), the overlay lands in normal flow or expands the card.
3. **Content SDK friction** — an empty `<SitecoreLink>` renders link field text (“Read more”); workarounds (child spans, `font-size: 0`) add DOM noise without visual benefit.
4. **Duplicate semantics** — two links to the same URL on one card is redundant for headless; one accessible link on the arrow is enough.

**Do not** add overlay links “because section.html has them”. Grep `section.html` to understand the pattern, then implement what the **screenshot** requires.

---

## Content SDK — decorator-only link

When `<SitecoreLink>` has **children** and no `showLinkTextWithChildrenPresent`, link field text is hidden — correct for icon-only arrows:

```tsx
<SitecoreLink field={fields.Cta} aria-label="…">
  <span className="arrow__forward" aria-hidden="true" />
</SitecoreLink>
```

Use a meaningful `aria-label` (from capture) since the visible affordance is icon-only.

---

## CSS — arrow position is context-specific

Grep captured `main.css` for the **parent scope**:

| Context | Typical `.text-panel-link` position |
|---------|-------------------------------------|
| Default panel card scope | `right: 40px; bottom: 37px` |
| Dense/compact panel scope | `right: 10px; bottom: 10px` |

Port decorator span dimensions (`width`/`height`, `background-image` or SVG) from captured CSS. **Verify arrow corner against the section PNG.**

---

## Pseudo-link copy in Body (not a second link)

“View highlights >>” and similar text is often **body copy on a second line**, not another `<a>`:

```html
<p>Annual Report and Accounts 2026<br>
View highlights &gt;&gt;</p>
```

| Region | Field |
|--------|-------|
| Title | `PanelTitle` |
| Body (with line breaks) | `Body` — preserve `<br>` as `\n` in authoring |
| Arrow CTA | `Cta` (General Link) — single link only |

Use `white-space: pre-line` on `.text-panel-body p` when the field contains `\n`.

---

## Detection workflow

1. **Grep** `section.html` for `text-panel-link`, `arrow__forward` (and note `text-panel-full-link` only as “skip in TSX”).
2. Implement **one** `<SitecoreLink>` on the arrow wrapper.
3. Port **arrow** CSS from captured styles for the correct parent scope.
4. Check body for `<br>` + trailing pseudo-link text — keep in `Body`, not a new link field.
5. **Verify PNG:** arrow in correct corner; no extra card height or visible link label; body line breaks correct.

---

## When an overlay might still be needed (rare)

Only consider a full-tile overlay if **all** of:

- Screenshot / UX explicitly requires clicking anywhere on the tile (not just the arrow), **and**
- Overlay is `position: absolute; inset: 0` relative to a **`position: relative`** panel root that does not use `position: static` overrides, **and**
- Computed layout shows **zero** extra height in DevTools.

Prefer wrapping the whole card in one link (single `<SitecoreLink>` around content + arrow) over duplicating two links to the same field.

---

## Related

- [General Link inner markup patterns](visual-fidelity.md#general-link-cta-fields--inner-markup-patterns)
- [composite-hero-band.md](../../sitecore-section-decomposition/references/composite-hero-band.md)
