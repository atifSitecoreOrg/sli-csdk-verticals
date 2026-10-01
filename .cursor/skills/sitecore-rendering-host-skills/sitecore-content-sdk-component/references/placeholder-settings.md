# Placeholder settings (mandatory checklist)

Sitecore has **two separate** placeholder-setting locations. Both are required for a typical headless site with Partial/Page Designs and section components that use nested `<Placeholder>`.

**After authoring:** `dotnet sitecore serialization validate --fix -i MODULE_NAMESPACE` then push.

---

## 1. Component placeholders (project layout)

**Path:** `/sitecore/layout/Placeholder Settings/Project/{project}/{placeholderKey}`

**Module include:** `*.module.json` must include:

```json
{
  "name": "placeholder-settings",
  "path": "/sitecore/Layout/Placeholder Settings/Project/{project}",
  "allowedPushOperations": "CreateUpdateAndDelete",
  "scope": "ItemAndDescendants"
}
```

Create **one YAML file per placeholder prefix** used in TSX (template `5c547d4e-7111-4995-95b0-6b561751bf2e`):

| TSX pattern | Placeholder Key | Allowed Controls |
|-------------|-----------------|------------------|
| `` `teaser-cards-${DynamicPlaceholderId}` `` | `teaser-cards-{*}` | child rendering GUID(s), e.g. `VerticalTeaserCard` |
| `` `link-cards-${DynamicPlaceholderId}` `` | `link-cards-{*}` | `HorizontalLinkCard` |
| `` `stats-items-${DynamicPlaceholderId}` `` | `stats-items-{*}` | `StatsItem` |
| `` `header-nav-${DynamicPlaceholderId}` `` | `header-nav-{*}` | `Navigation` |
| `` `footer-links-${DynamicPlaceholderId}` `` | `footer-links-{*}` | `LinkList` |

```yaml
SharedFields:
- ID: "7256bdab-1fd2-49dd-b205-cb4873d2917c"
  Hint: Placeholder Key
  Value: "teaser-cards-{*}"
- ID: "e391b526-d0c5-439d-803e-17512eae6222"
  Hint: Allowed Controls
  Value: |
    {CHILD-RENDERING-GUID}
```

**Where to look in CM:** Layout → Placeholder Settings → Project → `{project}` — **not** under the site content tree.

---

## 2. Link rendering → placeholder setting (required)

Every Json rendering whose TSX uses `<Placeholder>` **must** set the **Placeholders** shared field (`069a8361-b1cd-437c-8c32-a3be78941446`) to the placeholder-setting item GUID(s).

Without this field, Pages/Experience Editor cannot resolve allowed child components in nested placeholders.

```yaml
# On /sitecore/layout/Renderings/Project/{project}/TitleDescriptionTeaserGridSection
SharedFields:
- ID: "069a8361-b1cd-437c-8c32-a3be78941446"
  Hint: Placeholders
  Value: |
    {TEASER-CARDS-PLACEHOLDER-SETTING-GUID}
```

Apply to every parent rendering with placeholders: `Header`, `Footer`, `TitleDescriptionTeaserGridSection`, `TitleDescriptionLinkGridSection`, `TitleStatsBarSection`, etc.

### Placeholders field GUID format (single braces only)

The **Placeholders** field on Json renderings (`069a8361-b1cd-437c-8c32-a3be78941446`) and **Allowed Controls** on placeholder-setting items must reference item GUIDs with **one** pair of braces on CM:

| Correct (CM + serialized YAML) | Wrong (breaks CM resolution) |
|--------------------------------|------------------------------|
| `{5BA957B3-C64B-4C34-9766-0AF1F75CEF37}` | `{{5BA957B3-C64B-4C34-9766-0AF1F75CEF37}}` |

**Do not** use double braces `{{GUID}}` in the **Placeholders** field. Unlike some other SCS escaping cases, double braces are **not** unwrapped on push — they land literally on CM. Sitecore then cannot resolve the placeholder-setting item, Content Editor shows broken references, and the browser logs `Placeholder 'header-nav-1' was not found in the current rendering data`.

**Verify in Content Editor** after push: open e.g. `/sitecore/layout/Renderings/Project/{project}/Footer` → **Placeholders** must show `{GUID}`, not `{{GUID}}`. Cross-check the GUID against the matching file under `/sitecore/layout/Placeholder Settings/Project/{project}/` (e.g. `footer-links.yml` → `{5BA957B3-…}`).

**Authoring script rule:**

```javascript
function guidUpper(id) {
  return `{${id.toUpperCase()}}`;  // single braces — correct for Placeholders + Allowed Controls
}
// Do NOT emit `{{${id.toUpperCase()}}}` for Placeholders field values
```

**Generator rule:** when creating renderings via script, emit `Placeholders` whenever `comp.placeholders` is non-empty, using **single-brace** GUIDs that match the placeholder-setting item `ID:` in the paired `placeholder-settings/{project}/{key}.yml` file.

---

## 3. Partial design placeholders (site presentation)

**Full reference:** [partial-design-placeholder-settings/README.md](../../sitecore-page-from-design/references/partial-design-placeholder-settings/README.md)

**Path:** `{siteContentPath}/Presentation/Placeholder Settings/Partial Design/{Header|Footer}.yml`

Template for children: `d2a6884c-04d5-4089-a64e-d27ca9d68d4c`

One **child YAML per partial design**; **Placeholder Key** = `sxa-{signature}` matching the partial design **Signature** field:

| Partial design `Signature` | Placeholder Key | Child item |
|-----------------------------|-----------------|------------|
| `header` | `sxa-header` | `Partial Design/Header.yml` |
| `footer` | `sxa-footer` | `Partial Design/Footer.yml` |

**Site scaffold gap:** `Generate-SitecoreSite.mjs` creates `Partial Design.yml` (folder) only. You must add `Header.yml` and `Footer.yml` when building partial designs — missing children cause `Placeholder 'sxa-footer' was not found` and Pages canvas **500** on `sxa-jss`.

**Canonical examples:** use any working project's `Presentation/Placeholder Settings/Partial Design/` tree, then mirror that structure in the current project.

---

## 4. PartialDesignDynamicPlaceholder TSX (editing host)

`create-content-sdk-app` does **not** scaffold this. **Always** add it to every `editing-hosts/{app}/` app:

| Step | Action |
|------|--------|
| Copy TSX | `editing-hosts/{app}/src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx` |
| Source | [partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx](../../sitecore-page-from-design/references/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx) or `industry-verticals/kpmg/src/components/partial-design-dynamic-placeholder/` |
| Register | `.sitecore/component-map.ts` → `['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }]` — **no** `componentType: 'client'` |
| Build | `npm run build` from editing host root |

---

## 5. `__Renderings` XML (pages + partial designs)

**Full reference:** [renderings-xml.md](../../sitecore-page-from-design/references/renderings-xml.md)

Invalid `__Renderings` XML is a **frequent Content Editor failure** when opening page or partial-design items.

| Rule | Requirement |
|------|-------------|
| **`s:par` escaping** | `&` → `&amp;` (e.g. `CSSStyles&amp;DynamicPlaceholderId=1`) |
| **`p:after` UID casing** | Must match uppercase `uid="{…}"` on the referenced rendering |
| **Authoring scripts** | `escapeRenderingPar(par)` + `.toUpperCase()` on all layout GUIDs |

```xml
<!-- Correct -->
<r uid="{72AD3F22-F46C-4FC4-A5B4-26F2885E96DF}" p:before="*" … />
<r uid="{012B12C9-…}" p:after="r[@uid='{72AD3F22-F46C-4FC4-A5B4-26F2885E96DF}']"
   s:par="CSSStyles&amp;DynamicPlaceholderId=1" … />
```

Bare `CSSStyles&DynamicPlaceholderId=1` or lowercase `p:after` GUIDs break Content Editor XML parsing.

---

## Troubleshooting (nested placeholders)

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Content Editor: placeholder item not found on rendering **Placeholders** field | Double braces `{{GUID}}` pushed to CM | Change to single `{GUID}`; push renderings; verify in CM UI |
| Browser: `Placeholder 'header-nav-1' was not found in the current rendering data` | Broken **Placeholders** link on parent rendering (`Header`, `Footer`, section) | Fix GUID braces; confirm placeholder-setting item exists at `/sitecore/layout/Placeholder Settings/Project/{project}/{key}` |
| Browser: `Placeholder 'sxa-footer' was not found` | Missing Partial Design placeholder-setting **children** | See [partial-design-placeholder-settings/README.md](../../sitecore-page-from-design/references/partial-design-placeholder-settings/README.md) |

---

## Verification checklist

- [ ] `placeholder-settings` include in `*.module.json`
- [ ] Project placeholder YAML for **every** TSX `<Placeholder>` prefix
- [ ] Parent rendering items have **Placeholders** field → placeholder-setting GUID(s) with **single** `{GUID}` braces (not `{{GUID}}`)
- [ ] Site `Partial Design/Header` + `Footer` **children** with `sxa-header` / `sxa-footer` keys (not folder-only)
- [ ] `PartialDesignDynamicPlaceholder` TSX + component-map in `editing-hosts/{app}/`
- [ ] `__Renderings` valid per [renderings-xml.md](../../sitecore-page-from-design/references/renderings-xml.md) — `&amp;` in `s:par`; uppercase `p:after` GUIDs
- [ ] `dotnet sitecore serialization validate --fix` passes
