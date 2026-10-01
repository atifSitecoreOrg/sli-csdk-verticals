# Partial Design placeholder settings (site presentation)

Required when using **Partial Designs** + **Page Designs** for Header/Footer chrome. Maps each partial design to the `sxa-*` placeholder key passed as `params.sig` to `PartialDesignDynamicPlaceholder`.

**Canonical examples in repo:** inspect any working project’s `Presentation/Placeholder Settings/Partial Design/` tree and mirror the structure in the current project.

---

## Symptoms when children are missing

The site scaffold and `Generate-SitecoreSite.mjs` create the **`Partial Design` folder only** — not Header/Footer children. If you add Partial Designs + Page Designs but skip the child placeholder-setting items, Pages/edit mode breaks even when `PartialDesignDynamicPlaceholder` TSX is registered:

| Symptom | Where |
|---------|--------|
| `Placeholder 'sxa-footer' was not found in the current rendering data` | Browser console / dev server |
| `Placeholder 'sxa-header' was not found…` | Same (header partial design) |
| `Http failure … /sitecore/api/layout/render/sxa-jss … 500` | Pages canvas setup |
| Duplicate React key `00000000-0000-0000-0000-000000000000` | Browser (layout children missing real UIDs) |
| Duplicate React key after fixing `Placeholders` `{GUID}` | **`__Renderings` `uid="{GUID}}"`** — extra `}` on layout `<r>` entries (see [renderings-xml.md](../renderings-xml.md#rule-2--pafter-uid-references-must-match-uid-casing)) |

Edge preview may partially work; **Pages editor and `/api/editing/render` fail** until placeholder-setting children exist and are pushed.

---

## Required items (every new website with partial designs)

Under `{siteContentPath}/Presentation/Placeholder Settings/`:

| # | Item | Template GUID | Notes |
|---|------|---------------|-------|
| 1 | `Partial Design` folder | `52288e39-7830-4694-b62d-32a54c6ef7ba` | Created by site scaffold — **folder alone is not enough** |
| 2 | **One child YAML per partial design** | `d2a6884c-04d5-4089-a64e-d27ca9d68d4c` | **Mandatory:** `Header.yml`, `Footer.yml`, … |

Each child sets **Placeholder Key** (`7256bdab-1fd2-49dd-b205-cb4873d2917c`) to `sxa-{signature}` where `{signature}` matches the partial design **Signature** field (`55faae90-3bba-4f7f-96fe-13c3f40055ff`).

| Partial Design item | `Signature` field | Placeholder-setting child | Placeholder Key |
|--------------------|-------------------|---------------------------|-----------------|
| `Partial Designs/Header` | `header` | `Placeholder Settings/Partial Design/Header` | `sxa-header` |
| `Partial Designs/Footer` | `footer` | `Placeholder Settings/Partial Design/Footer` | `sxa-footer` |
| `Partial Designs/Default Header` | `default-header` | `…/Default Header` | `sxa-default-header` |

**Rule:** every partial design GUID listed in `Page Designs/{Name}` → `PartialDesigns` must have a matching placeholder-setting child with `sxa-{Signature}`.

---

## How it connects

```
Page Design (Default)
  └─ PartialDesigns: Header GUID | Footer GUID
       │
       ├─ Partial Designs/Header  (Signature: header, __Renderings: Header + nav)
       └─ Partial Designs/Footer  (Signature: footer, __Renderings: Footer + links)

Placeholder Settings/Partial Design/
  ├─ Header  → Placeholder Key: sxa-header   ← maps Header partial design
  └─ Footer  → Placeholder Key: sxa-footer   ← maps Footer partial design

Layout injects PartialDesignDynamicPlaceholder with params.sig = "sxa-header" | "sxa-footer"
  └─ <Placeholder name={sig} /> resolves children from matching partial design __Renderings
```

Without step 2 (child items), Sitecore injects `PartialDesignDynamicPlaceholder` with `sig=sxa-footer` but **does not nest** Footer partial-design renderings — hence the placeholder-not-found error.

---

## Templates in this folder

- [Partial Design.yml](Partial%20Design.yml) — folder item
- [Header.yml](Header.yml) — header partial-design placeholder setting
- [Footer.yml](Footer.yml) — footer partial-design placeholder setting

Replace `{siteContentPath}`, GUIDs, item names, and signatures from the target site. Generate fresh UUIDs — see [GUID rules](../../../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md#item-guids-critical).

**Parent ID:** use the existing `Partial Design` folder item ID from `{siteContentPath}/Presentation/Placeholder Settings/Partial Design.yml` (from site scaffold).

---

## Authoring scripts (mandatory when generating partial designs)

When a script writes `Presentation/Partial Designs/Header.yml` and `Footer.yml`, it **must also** write matching placeholder-setting children in the **same run** — do not assume the site scaffold created them:

```javascript
// After writing Partial Designs/Header.yml + Footer.yml
for (const [name, phKey] of [['Header', 'sxa-header'], ['Footer', 'sxa-footer']]) {
  await writeYaml(
    `${siteRel}/Presentation/Placeholder Settings/Partial Design/${name}.yml`,
    { Parent: PARTIAL_DESIGN_PH_FOLDER_ID, Template: 'd2a6884c-04d5-4089-a64e-d27ca9d68d4c',
      PlaceholderKey: phKey, Path: `${sitePath}/Presentation/Placeholder Settings/Partial Design/${name}` }
  );
}
```

Reference: use the current project's authoring scripts as the baseline pattern.

---

## Verify before push

```powershell
# Must list Header.yml and Footer.yml (not just Partial Design.yml)
Get-ChildItem "authoring/items/{project}/serialized-content/{site}/{site}/Presentation/Placeholder Settings/Partial Design/*.yml"

# Each child must contain Placeholder Key sxa-header / sxa-footer
rg 'Hint: Placeholder Key' -A1 "authoring/items/{project}/.../Partial Design/"
```

Cross-check: `Page Designs/Default.yml` → `PartialDesigns` lists Header + Footer GUIDs; both partial designs have `Signature: header|footer`; both placeholder-setting children exist with matching `sxa-*` keys.

---

## Checklist (with PartialDesignDynamicPlaceholder)

1. `Partial Design` folder exists under site `Presentation/Placeholder Settings/`
2. **Child YAML exists for each partial design** referenced in Page Designs (`Header.yml`, `Footer.yml`, …) — not folder-only
3. Placeholder Key = `sxa-{partialDesign.Signature}` on every child
4. `PartialDesignDynamicPlaceholder` TSX in `editing-hosts/{app}/src/components/partial-design-dynamic-placeholder/` + component-map entry (no `componentType: 'client'`)
5. Project-level placeholder settings for nested component placeholders (`teaser-cards-{*}`, etc.) + **Placeholders** field on parent renderings — see [placeholder-settings.md](../../../sitecore-content-sdk-component/references/placeholder-settings.md)
6. Partial design + page `__Renderings` valid — [renderings-xml.md](../renderings-xml.md)
7. `dotnet sitecore serialization validate --fix -i MODULE_NAMESPACE`
8. Pages editor opens Home without `sxa-footer` / `sxa-jss` 500 errors

---

## Multiple header partial designs (optional)

Some projects add extra items when multiple header partial designs exist (e.g. `Default Header` → `sxa-default-header`, `Homepage Header` → `sxa-homepage-header`). Add one placeholder-setting child per partial design signature.
