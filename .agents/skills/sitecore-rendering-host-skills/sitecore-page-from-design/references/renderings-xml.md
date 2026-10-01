# `__Renderings` field XML (pages + partial designs)

The **`__Renderings`** shared field (`f1a1fe9e-a60c-4ddb-a3a0-bb5b29fe732e`) stores layout as XML on:

- Page items under `{siteContentPath}/Home/…`
- Partial Design items (Header, Footer, …)
- Page Design items when layout is defined there

Invalid XML in this field is a **common Content Editor failure**: opening the item shows a parsing/layout error (often generic). The front-end may still render via Edge while the editor breaks.

**Always copy layout XML shape from a working page in the same site module** (e.g. `{this-module}/serialized-content/{sitename}/{sitename}/Home.yml`) — do not invent structure. You may read a sibling module only for XML **syntax**; rendering and datasource GUIDs must be from the current module — [project-isolation.md](../../sitecore-component-from-design/references/project-isolation.md).

---

## Rule 1 — Escape `&` in `s:par` as `&amp;`

Parameter strings use `&` as a separator. In XML attributes that character must be escaped.

| Wrong (breaks Content Editor) | Correct |
|-------------------------------|---------|
| `s:par="CSSStyles&DynamicPlaceholderId=1"` | `s:par="CSSStyles&amp;DynamicPlaceholderId=1"` |
| `s:par="GridParameters=%7B…%7D&FieldNames=%7B…%7D&Styles"` | `s:par="GridParameters=%7B…%7D&amp;FieldNames=%7B…%7D&amp;Styles"` |

**Authoring scripts:** escape every `s:par` value before writing YAML:

```javascript
function escapeRenderingPar(par) {
  return par.replace(/&/g, '&amp;');
}
```

**Verify before push:**

```powershell
# Any unescaped & inside s:par is a bug (should return no matches)
rg 's:par="[^"]*&(?!amp;)' authoring/items/
```

---

## Rule 2 — `p:after` UID references must match `uid` casing

Each `<r>` block has `uid="{UPPERCASE-GUID}"`. The next rendering's `p:after` must reference that **same uppercase** GUID:

```xml
<r
  uid="{72AD3F22-F46C-4FC4-A5B4-26F2885E96DF}"
  p:before="*"
  s:id="{1C71421B-E6A7-4965-83EB-8BE15CA4DE63}"
  s:par="CSSStyles"
  s:ph="headless-main" />
<r
  uid="{012B12C9-3D24-486D-9F47-6853F4FB0635}"
  p:after="r[@uid='{72AD3F22-F46C-4FC4-A5B4-26F2885E96DF}']"
  s:id="{0E9EEC5F-6ECF-4723-88F8-FDF3EF11EE49}"
  s:par="CSSStyles&amp;DynamicPlaceholderId=1"
  s:ph="headless-main" />
```

| Wrong | Why |
|-------|-----|
| `uid="{72AD3F22-F46C-4FC4-A5B4-26F2885E96DF}}"` | Extra `}` after GUID — Sitecore cannot parse layout UID; edit layout returns `00000000-…` and React duplicate-key warnings |
| `p:after="r[@uid='{72ad3f22-f46c-4fc4-a5b4-26f2885e96df}']"` | Lowercase GUID does not match `uid` attribute — layout ordering breaks in Content Editor |

**Authoring scripts:** uppercase both the rendering `uid` and any `p:after` reference:

```javascript
function buildRenderingEntry({ uid, renderingId, dsId, ph, par = 'CSSStyles', before, after }) {
  const afterRef = after ? after.toUpperCase() : null;
  const pos = before
    ? `p:before="${before}"`
    : afterRef
      ? `p:after="r[@uid='{${afterRef}}']"`
      : `p:after="*[1=2]"`;
  return `        <r
          uid="${guidUpper(uid)}"
          ${pos}
          s:ds="${dsId}"
          s:id="${guidUpper(renderingId)}"
          s:par="${escapeRenderingPar(par)}"
          s:ph="${ph}" />`;
}
```

First rendering in a device block: `p:before="*"`. Chain subsequent entries via `p:after` referencing the **previous** entry's `uid`.

---

## Rule 3 — Standard device wrapper

Headless pages use the default device ID on the outer `<d>` element:

```xml
<r xmlns:p="p" xmlns:s="s" p:p="1">
  <d id="{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}">
    <!-- <r> rendering entries -->
  </d>
</r>
```

Copy this wrapper from an existing page in the same collection — do not change the device ID unless the site module defines otherwise.

---

## Rule 4 — Dynamic placeholders

Section components with nested cards use:

- `s:par="CSSStyles&amp;DynamicPlaceholderId=N"` on the **parent** section rendering (`N` = 1, 2, 3… per section instance on the page)
- `s:ph="/headless-main/carousel-slides-N"` (or the placeholder key from the parent rendering's **Placeholders** field) on **child** card renderings

Parent and child placeholder keys must match the TSX `<Placeholder>` prefix and project placeholder-settings YAML.

---

## Rule 5 — Presentation styles (`Styles`)

When spacing/indent/background classes are authored via **Presentation → Styles** (not hardcoded in TSX), the page layout must reference style item GUIDs in `s:par`:

```xml
s:par="CSSStyles&amp;FieldNames=%7B…%7D&amp;Styles=%7BE1C0AF02-53AD-4491-A886-9FCF1D116097%7D"
```

(`E1C0AF02-…` is **Indent top** on jm3site — read `ID` from that site's `Presentation/Styles/Spacing/Indent top.yml`.)

| Styles selected | Encoded value |
|-----------------|---------------|
| One | `Styles=%7B{GUID}%7D` |
| Multiple | `Styles=%7C%7B{GUID1}%7D%7C%7B{GUID2}%7D` |

GUIDs = `ID` from `{siteContentPath}/Presentation/Styles/…/*.yml`. Component TSX must apply `${params?.styles ?? ''}` on the root element.

Full workflow: [presentation-styles.md](presentation-styles.md).

---

## Rule 6 — Headless Variant (`FieldNames`)

Set `FieldNames` in `s:par` to the **intended** Headless Variant item GUID (URL-encoded). See [sitecore-page-from-design SKILL — Phase 4](../SKILL.md#phase-4--assemble-page-yaml).

| Design / decomposition | `FieldNames` target |
|------------------------|---------------------|
| Grid, stack, static band | **Default** variant GUID |
| Carousel with prev/next, dots, peek slides | **Carousel** variant GUID |
| Explicit `headlessVariant` in `page-decomposition.json` | That variant's GUID |

**Default is not always correct** — a section with a `Carousel` TSX export that matches the screenshot must use the **Carousel** variant GUID in page YAML, or Pages renders the grid/stack layout.

Lookup: `{siteContentPath}/Presentation/Headless Variants/{ComponentName}/{Variant}.yml` → use that item's `ID`.

---

## YAML field shape

In serialized page YAML, `__Renderings` is a multiline shared field:

```yaml
SharedFields:
- ID: "f1a1fe9e-a60c-4ddb-a3a0-bb5b29fe732e"
  Hint: __Renderings
  Value: |
    <r xmlns:p="p" xmlns:s="s"
      p:p="1">
      <d
        id="{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}">
        ...
      </d>
    </r>
```

---

## Pre-push checklist

- [ ] Copied XML structure from a working page in the same site module
- [ ] Every `s:par` uses `&amp;`, never bare `&`
- [ ] Every `uid` and every `p:after='{…}'` GUID is **uppercase** and consistent
- [ ] Every layout `<r>` uses `uid="{GUID}"` — **not** `uid="{GUID}}"` (extra `}` zeros UIDs in edit layout)
- [ ] First `<r>` has `p:before="*"`; rest chain with `p:after`
- [ ] `s:ds` GUIDs point at existing datasource items
- [ ] `s:id` GUIDs match Json rendering items under `/sitecore/layout/Renderings/Project/{collection}/`
- [ ] Spacing/indent styles: `Styles=` in `s:par` matches Presentation/Styles item GUIDs — [presentation-styles.md](presentation-styles.md)
- [ ] `dotnet sitecore serialization validate --fix -i {collection}-scs` passes
- [ ] Content Editor opens the page item without layout XML errors after push

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Homepage `/` empty (header/footer only) | Renderings on `Home/Home` instead of scaffold `Home`; or `StartItem` ≠ `Home.yml` ID | Put `__Renderings` on `{siteContentPath}/Home.yml`; delete `Home/Home`; keep `StartItem` on `Home` — [homepage-authoring.md](homepage-authoring.md) |
| Content Editor error opening Home (or any page) | Invalid `__Renderings` XML | Apply rules 1–2; validate; push |
| Pages editor shows wrong variant | Missing or wrong `FieldNames` in `s:par` | Set Headless Variant GUID — **Carousel** when design is a slider |
| Carousel shows as static grid | `FieldNames` points to Default, not Carousel | Use Carousel variant GUID from Headless Variants folder |
| Hero slides missing background images | Wrong card component or missing Image field | Use `HeroSlideCard`; extract slide `background-image` URLs from section HTML |
| News/stats panels in wrong place on homepage | Composite band split into stacked full-width sections | Use `CompositeHeroBandSection` with `hero-panels-*` and `hero-stats-*` placeholders — [composite-hero-band.md](../../sitecore-section-decomposition/references/composite-hero-band.md) |
| Nested cards missing on page | Wrong `s:ph` or `DynamicPlaceholderId` | Align with placeholder-settings + TSX |
| Edit layout / React key `00000000-…` for all page renderings | `uid="{GUID}}"` in `__Renderings` (extra `}`) | Fix to `uid="{GUID}"`; push pages + partial designs; verify with layout inspect script |
| Serialization validates but editor still broken | CM has stale layout from prior push | Re-push affected page + partial design items |

**Reference implementations:** use a working `Home.yml` from the current project's serialized site tree as the baseline pattern.
