# Presentation styles (Spacing / editor styles → page YAML)

When a component needs **editor-selectable spacing** on its root, wire three artifacts:

1. **CSS** in the shared stylesheet for the scaffold class names
2. **Existing** Presentation style items from the site scaffold (do **not** invent new spacing YAML)
3. **Page `__Renderings`** — `Styles=` parameter on the rendering's `s:par` attribute

CSS alone is not enough: without (2) and (3), `params.styles` is empty at runtime.

---

## Use site-scaffold Spacing styles only

Every headless site created via [`sitecore-new-site-yaml`](../../../sitecore-serialization-skills/sitecore-new-site-yaml/SKILL.md) already includes **Spacing** style items under:

```
{siteContentPath}/Presentation/Styles/Spacing/
```

On disk (serialization module):

```
authoring/items/{Module}/serialized-content/{sitename}/{sitename}/Presentation/Styles/Spacing/
```

| Style item (file name) | `Value` field (CSS class) | Registry key for `page-decomposition.json` |
|------------------------|---------------------------|------------------------------------------|
| `Indent top.yml` | `indent-top` | `indent-top` |
| `Indent bottom.yml` | `indent-bottom` | `indent-bottom` |
| `Indent side.yml` | `indent` | `indent-side` |

**Do not** create custom items such as “Section spacing top/bottom” with new CSS classes (`spacing-section-top`, etc.). Reuse **Indent top** / **Indent bottom** for vertical section gaps.

**GUIDs differ per site** — never hardcode a style item ID from another module. Read the `ID:` field from **that site's** YAML file when building page `__Renderings`.

Example paths:

| Site | Indent top YAML |
|------|-----------------|
| jm3site | `authoring/items/JM3Collection/serialized-content/jm3site/jm3site/Presentation/Styles/Spacing/Indent top.yml` |
| forma-lux | `authoring/items/industry-verticals/sites/forma-lux/items/site-presentation/Presentation/Styles/Spacing/Indent top.yml` |

---

## Component TSX

Apply rendering parameters on the root node:

```tsx
<section className={`component my-section ${params?.styles ?? ''}`.trim()} />
```

The `styles` param receives space-separated class names from selected Presentation style items (`indent-top`, `indent-bottom`, `indent`, …).

### Full-bleed / composite bands — do not use `.section`

Generic `.section { padding: 3rem 0; }` band styles are for standard content sections. **Do not** add the `section` class to full-bleed heroes, composite bands, or other edge-to-edge layouts.

| Wrong | Right |
|-------|-------|
| `className="section component composite-hero-band …"` | `className="component composite-hero-band … ${params?.styles ?? ''}"` |
| Hardcoded `padding` / `margin` on the band root in CSS | `padding: 0` on the band; vertical gap via **Indent top/bottom** in page YAML `Styles=` |

Exact pixel match to the screenshot is not required — assign **indent-top**, **indent-bottom**, or both in `page-decomposition.json` so adjacent sections have visible separation. A few pixels difference is acceptable.

---

## CSS (editing host)

Match stylesheet rules to scaffold `Value` fields:

```css
.indent-top {
  margin-top: 2.5rem;
}
.indent-bottom {
  margin-bottom: 2.5rem;
}
.indent {
  padding-left: 15px;
  padding-right: 15px;
}
```

**Indent side** applies class `indent` (not `indent-side`) — the YAML `Value` is `indent`.

---

## Page `__Renderings` — `Styles=` encoding

Add `Styles` to the rendering's `s:par` (after `CSSStyles` and `FieldNames`):

```xml
s:par="CSSStyles&amp;FieldNames=%7B2A480CEC-3ABF-4584-9BF0-AFCDCB850FDF%7D&amp;Styles=%7BE1C0AF02-53AD-4491-A886-9FCF1D116097%7D"
```

(`E1C0AF02-…` = **Indent top** on jm3site — read from that site's `Indent top.yml`, not from this example.)

| Count | Decoded `Styles` value | Encoded in `s:par` |
|-------|------------------------|-------------------|
| **One** style | `{E1C0AF02-53AD-4491-A886-9FCF1D116097}` | `Styles=%7BE1C0AF02-53AD-4491-A886-9FCF1D116097%7D` |
| **Two+** styles | `\|{guid1}\|{guid2}` | `Styles=%7C%7BGUID1%7D%7C%7BGUID2%7D` |

Rules:

- GUIDs are **uppercase** inside braces.
- `%7B` = `{`, `%7D` = `}`, `%7C` = `|` (pipe separator for multiple styles).
- Escape every `&` in `s:par` as `&amp;` — see [renderings-xml.md](renderings-xml.md).

**Authoring helper — load IDs from site YAML:**

```javascript
const SPACING_STYLE_FILES = {
  'indent-top': 'Indent top.yml',
  'indent-bottom': 'Indent bottom.yml',
  'indent-side': 'Indent side.yml',
};

function loadSpacingStyleIds(siteRelPath) {
  const spacingDir = join(moduleRoot, siteRelPath, 'Presentation', 'Styles', 'Spacing');
  const ids = {};
  for (const [key, fileName] of Object.entries(SPACING_STYLE_FILES)) {
    const content = readFileSync(join(spacingDir, fileName), 'utf8');
    const idMatch = content.match(/^ID:\s*"([^"]+)"/m);
    if (idMatch) ids[key] = idMatch[1];
  }
  return ids;
}
```

---

## Declaring styles per section (page assembly)

In `page-decomposition.json`, use scaffold registry keys on `parentComponent`:

```json
{
  "sectionFolder": "johnson-matthey-is-a-cta-block",
  "parentComponent": {
    "cmsName": "TitleDescriptionCtaSection",
    "presentationStyles": ["indent-top"]
  }
}
```

Both top and bottom:

```json
"presentationStyles": ["indent-top", "indent-bottom"]
```

**Composite hero band (homepage):** gap below the band only — hero sits flush under the header; next section follows after `indent-bottom`:

```json
"parentComponent": {
  "cmsName": "CompositeHeroBandSection",
  "presentationStyles": ["indent-bottom"]
}
```

Avoid doubling gaps: if the band above has `indent-bottom`, the section below usually does **not** also need `indent-top`.

Horizontal inset:

```json
"presentationStyles": ["indent-side"]
```

Authoring scripts resolve keys → GUIDs from the **current site's** `Presentation/Styles/Spacing/*.yml` when building page `__Renderings`.

---

## Workflow when a section needs vertical spacing

1. **Screenshot audit** — section needs extra vertical gap.
2. **Confirm** scaffold Spacing items exist under `{siteContentPath}/Presentation/Styles/Spacing/` (they should after site YAML creation).
3. **Add/verify CSS** for `.indent-top` / `.indent-bottom` / `.indent` in the editing-host stylesheet.
4. **Set `presentationStyles`** in `page-decomposition.json` (`indent-top`, `indent-bottom`, and/or `indent-side`).
5. **Wire `Styles=`** in page YAML using GUIDs from that site's style item files (or re-run authoring script).
6. **Verify** in browser: root element has `indent-top` (etc.) from `params.styles`.

**Do not** add new Presentation style YAML for one-off section spacing.

---

## Checklist

- [ ] Using **Indent top / Indent bottom / Indent side** scaffold items — no custom “Section spacing …” YAML
- [ ] Style GUIDs read from **this site's** `Presentation/Styles/Spacing/*.yml`
- [ ] CSS classes match scaffold `Value` fields (`indent-top`, `indent-bottom`, `indent`)
- [ ] Component root uses `${params?.styles ?? ''}`
- [ ] Page `__Renderings` includes encoded `Styles=` GUID(s)
- [ ] `page-decomposition.json` uses `indent-top` / `indent-bottom` / `indent-side` keys

## Related

- [renderings-xml.md](renderings-xml.md) — `s:par` escaping and layout XML
- [visual-fidelity.md](../../sitecore-component-from-design/references/visual-fidelity.md) — layout fidelity
