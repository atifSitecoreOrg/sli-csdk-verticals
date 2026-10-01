# Repeated patterns → child component + placeholder

When a section PNG shows **2 or more siblings with the same visual structure**, treat them as a **child rendering** placed through a Sitecore `<Placeholder>` — not as numbered fields on the parent (`Link1`, `Link2`, …) unless the pattern is truly fixed-count and never reordered by authors.

---

## When to use a placeholder

| Visual signal | Sitecore pattern |
|---------------|------------------|
| Row of icon+label links (FAQ, Contact, Search, …) | Parent + `HeaderIconLink` children |
| Carousel / slider slides | Parent section + card children in slide placeholder |
| Teaser grid tiles | Grid section + card placeholder |
| Footer social icons (fixed 3) | May stay as fields **if** PNG shows exactly 3 and no author reorder — otherwise child component |
| Event list cards | `EventListCard` in `event-cards` placeholder |

**Detection rule:** If you would copy-paste the same TSX block 2+ times with only field names changing → extract a child component.

---

## When numbered fields are OK

| Case | Example |
|------|---------|
| Fixed legal links (exactly 3, no icons) | Footer `LegalLink1`–`LegalLink3` on one Footer component |
| Single-row feature with max 4 items in capture spec | Rare — prefer placeholder if authors may add/remove |

When icons + identical markup repeat → **prefer placeholder**.

---

## Child component design

1. **Minimal fields** for one tile/link/card: only what differs per instance
2. **Parent owns layout shell** — flex row, grid column, carousel viewport. When using `<Placeholder>`, the **grid/flex wrapper must be inside the placeholder `render` / `renderEach` callback** — never assume `.row` + `col-*` on wrapped children will lay out placeholder output. See [placeholder-layout.md](../../sitecore-content-sdk-component/references/placeholder-layout.md).
3. **Child owns content** — link text, icon class, image, title (no column width / grid cell classes)
4. Create placeholder-setting YAML + parent rendering **Placeholders** field
5. Seed one datasource per visible item from `section.html` extraction

### HeaderIconLink example (RAI utility row)

**Parent:** `Navigation` — primary nav buttons + `<Placeholder name="header-utility-{id}" />`

**Child:** `HeaderIconLink`

| Field | Type | Purpose |
|-------|------|---------|
| `Link` | General Link | href + label (FAQ, Contact, …) |
| `IconClass` | Single-Line Text | Font Awesome classes from capture |
| `DropdownLink1` | General Link | Optional — language menu |
| `DropdownLink2` | General Link | Optional — second language |

**TSX (child):** one column — `<i className={IconClass} />` + link label, matching captured `flex flex-col gap-y-1 items-center` classes.

---

## Anti-patterns

| Wrong | Right |
|-------|-------|
| `UtilityLink1`–`UtilityLink4` without icons in TSX | HeaderIconLink children with `IconClass` |
| Hardcode 5 utility links in Navigation TSX | Placeholder + 5 seeded datasources |
| `.row` around `<Placeholder>` with `col-md-6` on each mapped child | Single grid host **returned from** `render={(components) => <div className="…__grid">…</div>}` — [placeholder-layout.md](../../sitecore-content-sdk-component/references/placeholder-layout.md) |
| Copy JM3 Navigation field schema without PNG check | Derive fields from **this** section PNG + HTML |

---

## section-plan.json

For each placeholder:

```json
{
  "key": "header-utility-{DynamicPlaceholderId}",
  "allowedRenderings": ["HeaderIconLink"],
  "layout": "horizontal icon links"
}
```

Add a second component entry under `implementationPlan.components` for the child, or document in parent `notes`.

---

## Checklist

- [ ] PNG shows 2+ identical-structure siblings
- [ ] Child component created with per-item fields only
- [ ] Parent TSX uses `<Placeholder>` for the row/grid/carousel
- [ ] Grid/flex wrapper is **inside** placeholder `render` / `renderEach` — not only on a parent `.row` ([placeholder-layout.md](../../sitecore-content-sdk-component/references/placeholder-layout.md))
- [ ] Placeholder setting + rendering Placeholders field in YAML
- [ ] Partial design / page YAML seeds one child rendering per visible item
- [ ] Child TSX matches one tile from PNG (icon classes included)
