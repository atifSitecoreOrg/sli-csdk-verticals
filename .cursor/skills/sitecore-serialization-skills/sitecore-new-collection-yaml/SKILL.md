---
name: sitecore-new-collection-yaml
description: Generate Sitecore Content Serialization YAML for a new headless site collection (tenant, project templates, branches, renderings, project settings). Does not create items in Sitecore CM — push with dotnet sitecore serialization push. Use when bootstrapping a new collection module or before adding sites. For sites under the collection, use sitecore-new-site-yaml.
paths:
  - "authoring/items/**"
  - "**/*.module.json"
---

# Sitecore collection YAML generator

Generate **serialization YAML on disk** for a **Headless Tenant / site collection** from embedded templates — the same structure as a `dotnet sitecore serialization pull` of **New Collection**, with unique GUIDs and cross-reference wiring.

**This skill does not create anything in Sitecore CM.** It only writes files under `authoring/items/`. Items appear in Sitecore after `dotnet sitecore serialization push`.

**Official references:**

- [YAML serialization format](https://doc.sitecore.com/xp/en/developers/104/sitecore-experience-manager/the-yaml-serialization-format.html)
- [Sitecore Content Serialization configuration reference](https://doc.sitecore.com/sai/en/developers/sitecoreai/sitecore-content-serialization/configuration/sitecore-content-serialization-configuration-reference.html) (includes, scope, `maxRelativePathLength`)
- [SCS module rules](https://doc.sitecore.com/sai/en/developers/sitecoreai/sitecore-content-serialization/configuration/sitecore-content-serialization-configuration-reference.html#rules) (scope, `allowedPushOperations`, `alias`)

**Reference:** [references/collection-structure.md](references/collection-structure.md)

**Related:** After the collection exists (YAML on disk and ideally pushed to CM), add sites with [`sitecore-new-site-yaml`](../sitecore-new-site-yaml/SKILL.md). For a wizard-created isolated collection (Legal pattern), follow [`isolated-collection-site`](../isolated-collection-site/SKILL.md) — keep wizard IDs, unique GUID prefix, include project placeholder-settings in the module.

---

## When to use

| Task | Script | Output |
|------|--------|--------|
| Generate **collection** YAML | `Generate-SitecoreCollection.mjs` | Local `authoring/items/{Collection}/` module + YAML |

Script: `.cursor/skills/sitecore-serialization-skills/sitecore-new-collection-yaml/scripts/Generate-SitecoreCollection.mjs`

Templates: `.cursor/skills/sitecore-serialization-skills/sitecore-new-collection-yaml/templates/`

---

## Inputs

| Input | Required | Example |
|-------|----------|---------|
| Collection display name | Yes | `Company Name` |
| Folder name override | No | `--folder "Company Name"` |

System name: lowercase, spaces → hyphens (`Company Name` → `company-name`).

---

## Run

```powershell
node .cursor/skills/sitecore-serialization-skills/sitecore-new-collection-yaml/scripts/Generate-SitecoreCollection.mjs "Collection Display Name"
```

Writes locally:

- `authoring/items/{Display Name}/{system-name}.module.json`
- `serialized-content/templates/`, `branches/`, `renderings/`, `placeholder-settings/`, `project-settings/`, `media-library/`, `collection/` (tenant)
- Tenant **`SettingsFolder`** → `project-settings/{system-name}.yml`

Push to create items in Sitecore CM (tenant + structural items):

```powershell
cd authoring/items/{Display Name}
node ../../scripts/Check-SerializationUniqueIds.mjs
dotnet sitecore serialization validate --fix -i {system-name}-scs
dotnet sitecore serialization push -n production -i {system-name}-scs
```

**Duplicate IDs:** SCS rejects push when the same item `ID:` exists in two YAML files anywhere under `authoring/items/`. When forking generators from a sibling project, use a unique `stableGuid` prefix — see [`unique-serialization-ids`](../unique-serialization-ids/SKILL.md).

---

## Embedded templates

```
templates/
├── module.template.json
└── serialized-content/
    ├── templates/, branches/, renderings/, placeholder-settings/
    ├── project-settings/
    ├── media-library/
    └── collection/new-collection.yml    # Tenant root (kept when sites are added)
```

| Token | Replaced with |
|-------|---------------|
| `New Collection` | Collection display name |
| `new-collection` | Collection system name |

All item `ID:` values get fresh UUIDs; internal cross-references are updated.

---

## Path hashing

When paths exceed `defaultMaxRelativeItemPathLength` (see `sitecore.json` and the [SCS configuration reference](https://doc.sitecore.com/sai/en/developers/sitecoreai/sitecore-content-serialization/configuration/sitecore-content-serialization-configuration-reference.html)), the CLI may store some files under **hash folders** on disk while siblings with shorter paths remain in readable folders. YAML `Path:` always stays the full logical Sitecore path.

The generator runs `validate --fix` after writing files. When you add or edit YAML later (template fields, site content), run it again before push:

```powershell
dotnet sitecore serialization validate --fix -i {system-name}-scs
```

**Do not** guess hash folder names or change `Path:` to match disk layout — let the CLI relocate files.

---

## Checklist

- [ ] Display name confirmed
- [ ] `Generate-SitecoreCollection.mjs` succeeded — YAML on disk only
- [ ] Project settings + tenant YAML present
- [ ] `validate --fix` passes
- [ ] `push` run — tenant should exist in CM **before** generating sites
- [ ] Next: use [`sitecore-new-site-yaml`](../sitecore-new-site-yaml/SKILL.md) to add site YAML under this collection
- [ ] Isolated / wizard collection: also run the [`isolated-collection-site`](../isolated-collection-site/SKILL.md) checklist (placeholder-settings include, Allowed Controls, do not pull over wizard IDs)
