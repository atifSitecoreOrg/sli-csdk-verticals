# Teaser grid archetypes (Section + Card placeholders)

`TitleDescriptionTeaserGridSection` + `VerticalTeaserCard` are a common **parent/child** pattern linked by `teaser-cards-{DynamicPlaceholderId}`.

The same component names can map to very different DOM structures between projects. Always derive implementation from the current screenshot and `section.html`, not from another website.

---

## Detection workflow

1. Open the target section's `section.html` and desktop/mobile screenshots.
2. Identify structural signals:
   - list/grid wrappers (`ul`, `row`, custom track)
   - card shell (`article`, `li`, overlay link wrappers)
   - media placement (head image, side image, split columns)
3. Pick section + child variants based on actual structure.
4. Map page YAML `FieldNames` to the matching Headless Variant GUIDs for the current site.

---

## Archetype A — simple card grid/list

| Signal | Repeating cards with consistent structure and CTA placement |
| Section | `Default` (grid/stack wrapper around placeholder) |
| Child | `Default` (single presentational card layout) |

Use this when cards are visually uniform and each card has the same image/title/body/cta hierarchy.

---

## Archetype B — editorial layered cards (montage grid)

| Signal | Overlay link + rich card shell + asymmetric internal image/text composition |
| Section | `Default` — **placeholder owns grid** via `render` callback (see below) |
| Child | `VerticalTeaserCard` — content only; no column/grid classes on the card root |

**JM3 “Explore more” pattern:** `TitleDescriptionTeaserGridSection` + `teaser-cards-{DynamicPlaceholderId}` + N × `VerticalTeaserCard`.

```tsx
<div className="teaser-grid__montage-grid">
  <Placeholder
    name={`teaser-cards-${params.DynamicPlaceholderId}`}
    rendering={rendering}
    renderEach={(component, index) => (
      <div key={`teaser-card-${index}`} className="teaser-grid__montage-cell montage__data">
        {component}
      </div>
    )}
  />
</div>
```

Use **`renderEach`** (not `render` + `map`) so each placeholder child gets its own grid cell in both browse and Pages editing mode.

Use this when cards include layered wrappers, decorative arrows, or non-standard CTA placement.

---

## Archetype C — asymmetric split band

| Signal | Parent section combines different child roles (e.g., media-only column + text column) |
| Section | Often `ImageTop` or another explicit alternate variant required by screenshot |
| Child | Distinct variants per role (for example, one media-focused and one text-focused) |

Use this when sibling child items are intentionally not the same card shape.

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Reusing card TSX from another project because component names match | Rebuild DOM and styles from current screenshot/HTML |
| Applying one child variant to all placeholder items in asymmetric layouts | Use role-specific variants where required |
| Treating Rich Text as plain text | Use `<RichText>` for rich fields |
| Wrong `FieldNames` GUID in page YAML | Use GUID from `{site}/Presentation/Headless Variants/{Component}/{Variant}.yml` |
| Missing placeholder wrapper layout | Use `<Placeholder render={(components) => ...}>` with explicit grid/flex wrapper |

---

## Checklist

```
- [ ] Validated section/card structure from current screenshot and HTML
- [ ] Section + child variant selection matches real layout (not template assumptions)
- [ ] Page YAML FieldNames points to the correct current-site variant GUIDs
- [ ] Rich Text fields render with `<RichText>`
- [ ] Placeholder wrapper enforces desktop/tablet/mobile layout correctly
- [ ] No code or CSS copied from another site's implementation unless fully revalidated
```

---

## Related

- [layout-archetype-detection.md](layout-archetype-detection.md) — identify layout type from screenshot/HTML
- [placeholder-layout.md](../../sitecore-content-sdk-component/references/placeholder-layout.md) — wrapper layout for `<Placeholder>` children
- [visual-fidelity.md](visual-fidelity.md) — field-to-DOM and rich text mapping rules
- [component-types.md](../../sitecore-content-sdk-component/references/component-types.md) — section/card conventions
