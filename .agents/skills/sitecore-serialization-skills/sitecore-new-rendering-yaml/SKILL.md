---
name: sitecore-new-rendering-yaml
description: Generate Sitecore Content Serialization YAML for a new headless Next.js rendering (JSON rendering, template branch, datasource/folder/parameters templates, insert-options rule). Requires an existing collection module. Does not create items in Sitecore CM — push with dotnet sitecore serialization push. Use when adding a new component to SitecoreAI authoring.
paths:
  - "authoring/items/**"
  - "**/*.module.json"
---

# Sitecore rendering YAML generator

Generate **serialization YAML on disk** for a **headless JSON rendering + template branch** under an existing collection — the same structure as a manual **NewComponent** setup (rendering, `{Name} Templates` branch, folder, parameters, insert-options rule).

**This skill does not create anything in Sitecore CM.** It only writes files under the collection's `serialized-content/`. Items appear in Sitecore after `dotnet sitecore serialization push`.

**Official references:**

- [YAML serialization format](https://doc.sitecore.com/xp/en/developers/104/sitecore-experience-manager/the-yaml-serialization-format.html)
- [Sitecore Content Serialization configuration reference](https://doc.sitecore.com/sai/en/developers/sitecoreai/sitecore-content-serialization/configuration/sitecore-content-serialization-configuration-reference.html) (includes, scope, `maxRelativePathLength`)
- [SCS module rules](https://doc.sitecore.com/sai/en/developers/sitecoreai/sitecore-content-serialization/configuration/sitecore-content-serialization-configuration-reference.html#rules) (scope, `allowedPushOperations`, `alias`)

**Reference:** [references/rendering-structure.md](references/rendering-structure.md)  
**Datasource field values (CtaLink, Image, Edge):** [references/datasource-field-values.md](references/datasource-field-values.md)

**Prerequisite:** Collection module exists — [sitecore-new-collection-yaml](../sitecore-new-collection-yaml/SKILL.md). Site YAML optional until you add datasource content.

---

## When to use

| Task | Script | Output |
|------|--------|--------|
| Generate **rendering + templates** | `Generate-SitecoreRendering.mjs` | Rendering, branch, insert-options rule |

Script: `.cursor/skills/sitecore-serialization-skills/sitecore-new-rendering-yaml/scripts/Generate-SitecoreRendering.mjs`

Templates: `.cursor/skills/sitecore-serialization-skills/sitecore-new-rendering-yaml/templates/`

---

## Inputs

| Input | Required | Example |
|-------|----------|---------|
| Component name (PascalCase) | Yes | `CookieBanner`, `FullBleedHeroBannerSection` |
| Collection display name | Yes — **ask if not provided** | `Company Name` |
| Fields spec (`--fields`) | No | `references/fields.example.json` |

**Component name** must match:

- Next.js `component-map.ts` registration (`componentName`)
- Rendering `componentName` shared field (set automatically)

---

## Run

```powershell
node .cursor/skills/sitecore-serialization-skills/sitecore-new-rendering-yaml/scripts/Generate-SitecoreRendering.mjs "ComponentName" --collection "Collection Display Name"
```

With template fields:

```powershell
node .cursor/skills/sitecore-serialization-skills/sitecore-new-rendering-yaml/scripts/Generate-SitecoreRendering.mjs "CookieBanner" --collection "Company Name" --fields path/to/fields.json
```

Writes locally under the collection module:

- `renderings/{collection-system}/{ComponentName}.yml`
- `templates/{collection-system}/{ComponentName} Templates/` (branch + datasource + folder + parameters + **Data** section)
- `project-settings/.../Add {ComponentName}s Data Item.yml`

Push (collection namespace):

```powershell
cd authoring/items/{Collection Display Name}
dotnet sitecore serialization validate --fix -i {collection-system}-scs
dotnet sitecore serialization push -n production -i {collection-system}-scs
```

---

## What is generated vs manual

| Generated automatically | Add manually / via `--fields` |
|-------------------------|-------------------------------|
| JSON rendering item | Template **fields** under `Data/` (or extra sections) |
| Template branch root | Default **datasource** items under site `Data/` |
| Datasource, folder, parameters templates | **Available Renderings** entry (if your site uses it) |
| `Data` section (empty) | Page layout / partial design placeholder wiring |
| Standard values + insert-options rule | |

See [field-types.md](references/field-types.md) for field type strings and [field-item.template.yml](references/field-item.template.yml) for hand-authored fields. After adding fields, run `validate --fix` (see **Path hashing** below).

---

## Item GUIDs (critical)

Every new item and field needs a **globally unique** random UUID across the whole repository.

```powershell
[guid]::NewGuid().ToString().ToLower()
```

The generator assigns fresh UUIDs to all items it creates and rewires `Parent`, `Template`, `__Standard values`, `__Masters`, and rendering GUID references.

**Do not** regenerate GUIDs for items already in CM. **Do not** use sequential placeholder patterns in output YAML.

**Forked batch generators** (`Generate-Jm3Components.mjs`, etc.): the MD5 seed prefix in `stableGuid` must be **unique per collection** (`jm3-`, not `jm2-`). Re-run the generator after changing the prefix. See [`unique-serialization-ids`](../unique-serialization-ids/SKILL.md).

System/foundation GUIDs (Standard template, field-type templates, insert-options bucket) stay fixed — see [system-ids.md](references/system-ids.md).

---

## Embedded templates

```
templates/
├── renderings/new-collection/NewComponent.yml
├── templates/new-collection/
│   ├── NewComponent Templates.yml
│   └── NewComponent Templates/
│       ├── NewComponent.yml, NewComponent/Data.yml, __Standard Values.yml
│       ├── NewComponent Folder.yml + __Standard Values.yml
│       └── NewComponent Parameters.yml + __Standard Values.yml
└── project-settings/new-collection/new-collection/
    └── Add NewComponents Data Item.yml
```

| Token | Replaced with |
|-------|---------------|
| `NewComponent` | Component name (PascalCase) |
| `NewComponent Templates` | `{ComponentName} Templates` |
| `new-collection` | Collection system name |
| `Add NewComponents Data Item` | `Add {ComponentName}s Data Item` |

Collection bridge IDs (`templates/{system}.yml`, `renderings/{system}.yml`, `project-settings/...`) are read from the existing collection YAML.

---

## Path hashing

When paths exceed `defaultMaxRelativeItemPathLength` (see `sitecore.json` and the [SCS configuration reference](https://doc.sitecore.com/sai/en/developers/sitecoreai/sitecore-content-serialization/configuration/sitecore-content-serialization-configuration-reference.html)), the CLI may store some files under **hash folders** on disk while siblings with shorter paths remain in readable folders. YAML `Path:` always stays the full logical Sitecore path. Deep template field paths under `{ComponentName} Templates/.../Data/{FieldName}` often trigger this after you add fields.

The generator runs `validate --fix` after writing files. Re-run before push when adding field YAML or editing templates:

```powershell
dotnet sitecore serialization validate --fix -i {collection-system}-scs
```

**Do not** guess hash folder names or change `Path:` to match disk layout — let the CLI relocate files.

---

## Checklist

- [ ] Collection module exists on disk
- [ ] Component name is PascalCase and matches planned TSX `componentName`
- [ ] `Generate-SitecoreRendering.mjs` succeeded
- [ ] Fields added (`--fields` or manual YAML under `Data/`)
- [ ] TSX registered in editing host component map
- [ ] Default datasource + layout wiring (if needed)
- [ ] `validate --fix` passes on `{collection-system}-scs`
- [ ] `push` run when ready for CM
