# YAML artifacts per component

Create rendering and template YAML via [`sitecore-new-rendering-yaml`](../../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md). Site datasources and page content: [`sitecore-new-site-yaml`](../../../sitecore-serialization-skills/sitecore-new-site-yaml/SKILL.md). Validate/push: [`sitecore-new-collection-yaml`](../../../sitecore-serialization-skills/sitecore-new-collection-yaml/SKILL.md). Replace `{project}`, `{siteContentPath}`, `{componentName}`, paths from the target module's `*.module.json`, and **every GUID with a fresh random UUID** (`[guid]::NewGuid().ToLower()`).

**Never** use sequential placeholder GUIDs (`c3000001-0001-4000-8000-…`, `a1000001-0001-4000-8000-…`). IDs must be unique repo-wide. Before push: `node authoring/scripts/Check-SerializationUniqueIds.mjs` then `dotnet sitecore serialization validate --fix -i MODULE_NAMESPACE`. See [`unique-serialization-ids`](../../../sitecore-serialization-skills/unique-serialization-ids/SKILL.md).

## Checklist (every component)

| # | Artifact | Sitecore path pattern |
|---|----------|------------------------|
| 1 | Template branch | `/sitecore/templates/Project/{project}/{Component}/…` — must include `{Component} Template.yml` (datasource template), not just the branch root |
| 2 | Rendering | `/sitecore/layout/Renderings/Project/{project}/{ComponentName}` |
| 3 | Placeholder settings | `/sitecore/layout/Placeholder Settings/Project/{project}/{placeholderKey}` (if TSX uses `<Placeholder>`) — see [placeholder-settings.md](placeholder-settings.md) |
| 3b | Rendering **Placeholders** field | Link parent rendering to placeholder-setting GUID(s) — **mandatory** when step 3 applies |
| 4 | Headless Variants folder | `{siteContentPath}/Presentation/Headless Variants/{Display Name}` |
| 5 | Variant definitions | `…/Headless Variants/{Display Name}/{VariantName}.yml` per TSX export |
| 6 | Available Renderings entry | Add rendering GUID to site presentation folder |
| 7 | Data folder | `{siteContentPath}/Data/{ComponentName}s` |
| 8 | Default datasource(s) | `…/Data/{ComponentName}s/Default {ComponentName}.yml` with all field values |
| 9 | Media items | `{mediaInclude}/{project}/{site}/…` — **reuse existing** media by Sitecore `Path` when present; otherwise download + create YAML via [`sitecore-media-from-url-yaml`](../../../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md); reference via `mediaid` in datasource (orchestrated from [`sitecore-component-from-design`](../../sitecore-component-from-design/references/media-orchestration.md)) |
| 10 | Partial Design placeholder settings | `{siteContentPath}/Presentation/Placeholder Settings/Partial Design/{Header,Footer}.yml` with Placeholder Key `sxa-{signature}` — **child YAML required** (site scaffold creates folder only) — see [partial-design-placeholder-settings](../../sitecore-page-from-design/references/partial-design-placeholder-settings/README.md) |

Template branch structure: run [`Generate-SitecoreRendering.mjs`](../../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md) or see [rendering-structure.md](../../../sitecore-serialization-skills/sitecore-new-rendering-yaml/references/rendering-structure.md) and [field-types.md](../../../sitecore-serialization-skills/sitecore-new-rendering-yaml/references/field-types.md).

## Rendering item (Json rendering)

Template ID: `04646a89-996f-4ee7-878a-ffdbf1f0ef0d`

Key shared fields:

```yaml
SharedFields:
- ID: "037fe404-dd19-4bf7-8e30-4dadf68b27b0"
  Hint: componentName
  Value: FeatureSection          # must match component-map key
- ID: "1a7c85e5-dc0b-490d-9187-bb1dbcb4c72f"
  Hint: Datasource Template
  Value: "{DATASOURCE-TEMPLATE-GUID}"
- ID: "a77e8568-1ab3-44f1-a664-b7c37ec7810d"
  Hint: Parameters Template
  Value: "{RENDERING-PARAMS-TEMPLATE-GUID}"
- ID: "b5b27af1-25ef-405c-87ce-369b3a004016"
  Hint: Datasource Location
  Value: "query:$site/*[@@name='Data']/*[@@name='FeatureSections']"
- ID: "069a8361-b1cd-437c-8c32-a3be78941446"
  Hint: Placeholders
  Value: |
    {PLACEHOLDER-SETTING-GUID}   # REQUIRED when TSX uses <Placeholder>; single {GUID} only — NOT {{GUID}}
```

## Placeholder setting

Template ID: `5c547d4e-7111-4995-95b0-6b561751bf2e`

```yaml
SharedFields:
- ID: "7256bdab-1fd2-49dd-b205-cb4873d2917c"
  Hint: Placeholder Key
  Value: "statsCards-{*}"              # matches TSX prefix before DynamicPlaceholderId
- ID: "e391b526-d0c5-439d-803e-17512eae6222"
  Hint: Allowed Controls
  Value: "{ALLOWED-RENDERING-GUID}"    # repeat or multiline for multiple
```

## Headless variant definition

Template ID: `4d50cdae-c2d9-4de8-b080-8f992bfb1b55`

Create one YAML file per variant export (`Default`, `Inversed`, `ImageTop`, `ImageBottom`, `Animated`, `Carousel`, …). Parent is the Headless Variants folder item for the component (template `49c111d0-6867-4798-a724-1f103166e6e9`).

**Sort order — Default must be first:** every variant definition YAML needs a `SharedFields` entry for `__Sortorder` so Sitecore lists **Default** first in the variant picker (without it, items sort alphabetically and Animated appears before Default):

| Variant item name | `__Sortorder` |
|-------------------|---------------|
| `Default` | `100` |
| `Inversed` | `200` |
| `ImageTop` | `300` |
| Additional custom variants (if needed) | `275`–`325` |
| `ImageBottom` | `350` |
| `Animated` | `400` |
| `Carousel` | `500` |

Only create YAML for exports that exist in TSX — see [component-variants.md](component-variants.md).

```yaml
SharedFields:
- ID: "ba3f86a2-4a1c-4d78-b63d-91c2779c1b5e"
  Hint: __Sortorder
  Value: 100   # Default only — use 200/300/400 for other variants
```

Variant item name must equal TSX export name exactly (`Default`, `Inversed`, `ImageTop`, `ImageBottom`, `Animated`, `Carousel`, …). **Do not** create `InversedAnimated`.

## Default datasource

- **Template ID** = the `{Component} Template` item GUID from `{Component} Template.yml` — **not** the branch folder GUID from `{Component}.yml`.
- Before push, confirm that template item exists in serialization (`dotnet sitecore serialization validate -i MODULE_NAMESPACE`). Error `Template ID … did not exist` means the datasource references a template that was never serialized or was lost as an orphan.
- Each component needs the **full template subtree**: branch → `{Component} Folder` → `{Component} Template` → `Data` → field items. A branch YAML alone is not enough.
- When generating many components via script, assert every `templateId` in the ID map appears in some file under `serialized-content/templates/` before writing datasource YAML or pushing.

```powershell
# Quick check — replace with your template GUID
Select-String -Path "authoring/items/*/serialized-content/templates/**/*.yml" -Pattern "038b3358-1ab6-4e8a-9102-600d5bf751b2"
```

- Each field uses the **same field GUID** as the template `Data/{Field}.yml` files.
- Populate values from design HTML/screenshot — explicit `Value:` for every field (do not rely on `$name` for display text).
- **Image fields:** use `<image mediaid="{lowercase-media-item-guid}" />` — never external `src` URLs. **Reuse** an existing media item when the same asset URL/path already exists; only create new media YAML when no matching item is found (see [`sitecore-media-from-url-yaml`](../../../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md#reuse-existing-media) and [media-orchestration](../../sitecore-component-from-design/references/media-orchestration.md)).

## After YAML changes

```powershell
dotnet sitecore serialization validate --fix -i MODULE_NAMESPACE
dotnet sitecore serialization push -n ENVIRONMENT_NAME
```
