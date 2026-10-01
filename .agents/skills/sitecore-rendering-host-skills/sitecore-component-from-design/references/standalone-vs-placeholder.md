# Standalone section vs placeholder + child card

Use this when decomposition or `section-plan.json` suggests a **grid + card placeholder**, but `section.html` and section PNGs show a **fixed two-column layout** instead of repeating tiles.

---

## When to use a standalone section (no placeholder)

| Signal in `section.html` / PNG | Use |
|--------------------------------|-----|
| Two (or three) **fixed** columns with **different roles** (text vs media, text vs video) | **One** section component with all fields on a single datasource |
| Left: `jmrich--text-inner` / rich text + CTA; right: `jmvideotempl` / video block | `TitleDescriptionVideoSection` — not `TitleDescriptionLinkGridSection` + card |
| Left: image; right: text (or inverse) — single band | `ImageRichTextSection` — not a teaser grid |
| Title + body + CTA only — no repeating tiles | `TitleDescriptionCtaSection` |
| `repeatCount === 1` and the “child” is really the second column | **Standalone** — do not invent a card placeholder |
| No repeated **identical** tile markup (same class on 2+ siblings) | **Standalone** |

**Rule:** A Bootstrap row with `col-lg-5` + `col-lg-7` is a **layout split**, not a card grid — unless both columns contain the **same** card pattern repeated 2+ times each.

---

## When to use placeholder + child cards

| Signal | Use |
|--------|-----|
| 2+ **identical** card nodes (same root class, same inner structure) | Grid section + `{Card}` placeholder |
| Carousel slides with same slide markup | Carousel section + slide card placeholder |
| Composite hero: slides + panels + stats | `CompositeHeroBandSection` + multiple placeholders |
| Section title on parent; **repeating** tiles below or beside in a grid | `TitleDescriptionTeaserGridSection`, `TitleDescriptionLinkGridSection`, etc. |

---

## Common misdetection (Developing the future… pattern)

Visual detection may label a section `HorizontalLinkCardGrid` with `repeatCount: 2` because it counts **two columns** as two tiles.

**Correct reading of `section.html`:**

- Column 1: heading, paragraphs, `jm_cta_button` → fields `Title`, `Body`, `Cta`
- Column 2: `jmvideotempl`, thumbnail image, play button → fields `VideoThumbnail`, `VideoThumbnailMobile` (when capture swaps src by viewport), `PlayVideoLabel`, `VideoLink`

**Wrong plan:** `TitleDescriptionLinkGridSection` + `HorizontalLinkCard` with body mapped to card `Title` and thumbnail to `Logo`.

**Fix:** Override decomposition to `TitleDescriptionVideoSection`; one datasource; no placeholder children in page YAML.

**Layout:** Implement side-by-side columns with explicit flex CSS — `col-lg-*` in `section.html` does not create columns without framework CSS. See [column-split-layouts.md](column-split-layouts.md).

---

## Checklist before building TSX

```
- [ ] Open section.html — count distinct column **roles**, not column count
- [ ] If columns differ (text vs video/image), prefer standalone section
- [ ] If repeatCount === 1 and no identical sibling tiles, prefer standalone
- [ ] Placeholder pattern only when 2+ identical card/slide nodes exist
- [ ] page-decomposition.json parent has placeholderKey: null for standalone bands
- [ ] Desktop side-by-side columns implemented (not Bootstrap class names alone) — [column-split-layouts.md](column-split-layouts.md)
```

See also [page-assembly-fidelity.md](page-assembly-fidelity.md) and [section-to-sitecore-mapping.md](../../sitecore-section-decomposition/references/section-to-sitecore-mapping.md).
