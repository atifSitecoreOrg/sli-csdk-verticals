# Layout archetype detection (same cmsName, different DOM)

A Sitecore `cmsName` is a taxonomy label, not a DOM contract. The same component name can map to different structures across projects.

Before writing TSX, inspect the current section HTML/screenshot and choose the matching archetype. Never copy implementation from another website just because the component name matches.

---

## Common image+text archetypes

| Archetype | HTML signals | Desktop layout |
|-----------|--------------|----------------|
| **A — Column split** | Dedicated media/text wrappers, two sibling columns | Two-column row (media + text) |
| **B — Rich text first, media secondary** | Rich text container with inline CTA/decorators and separate media container | Optional full-width title, then text column + media column |
| **C — Structured editorial block** | Nested wrappers for title/body/media with custom decorative nodes | Explicit zones and spacing hierarchy beyond basic two-column |

---

## Detection workflow

1. Open `{sectionFolder}/section.html` and the matching screenshots (desktop/tablet/mobile).
2. Identify wrapper hierarchy and media placement:
   - Are media/text siblings in columns?
   - Is heading full-width above columns?
   - Are links plain, decorated, or overlay-style?
3. Map fields to the visible regions in that exact structure.
4. Implement TSX/CSS for the chosen archetype only.
5. Add `Inversed` only if left/right regions can truly mirror.

---

## Implementation guidance

- Prefer explicit wrapper classes per region: `__columns`, `__text`, `__media`, `__cta`.
- Use `<RichText>` for rich body fields; avoid splitting rich content into multiple `<Text>` nodes.
- Keep image in its own media container when the screenshot shows separate media framing.
- Port CTA inner markup exactly (text-only, icon-only, text+decorator) based on captured HTML.

---

## Pitfalls

| Mistake | Fix |
|---------|-----|
| Reusing a different project's two-column TSX | Rebuild structure from current section HTML |
| Rendering rich body as plain text paragraphs | Use `<RichText>` with authored HTML |
| Forcing a heading when screenshot has none | Make heading optional and conditionally render |
| Floating image inside text when screenshot shows a dedicated media column | Use explicit `__media` column wrapper |

---

## Checklist

```
- [ ] Chosen archetype from current screenshot + HTML, not by component name alone
- [ ] Media placement matches desktop/tablet/mobile captures
- [ ] CTA classes and inner markup match captured HTML
- [ ] Rich text fields use `<RichText>` where applicable
- [ ] `Inversed` exists only when true left/right mirroring is possible
```

---

## Related

- [column-split-layouts.md](column-split-layouts.md)
- [visual-fidelity.md](visual-fidelity.md#field-to-dom-mapping-one-field-one-node)
- [dual-link-cta-patterns.md](dual-link-cta-patterns.md)
- [project-isolation.md](project-isolation.md)
