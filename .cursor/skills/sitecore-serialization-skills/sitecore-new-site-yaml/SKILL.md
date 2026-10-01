---
name: sitecore-new-site-yaml
description: Generate Sitecore Content Serialization YAML for a new headless site under an existing collection module. Requires collection YAML first (use sitecore-new-collection-yaml if missing). Updates the collection module.json with a site include. Does not create items in Sitecore CM — push with dotnet sitecore serialization push.
paths:
  - "authoring/items/**"
  - "**/*.module.json"
---

# Sitecore site YAML generator

Generate **serialization YAML on disk** for a **Headless Site** under an existing collection — the same structure as a `dotnet sitecore serialization pull` of **New Site**, with unique GUIDs wired to the collection tenant and media library.

**This skill does not create anything in Sitecore CM.** It only writes files under the collection's `authoring/items/{Collection}/serialized-content/`. Items appear in Sitecore after `dotnet sitecore serialization push`.

**Official references:**

- [YAML serialization format](https://doc.sitecore.com/xp/en/developers/104/sitecore-experience-manager/the-yaml-serialization-format.html)
- [Sitecore Content Serialization configuration reference](https://doc.sitecore.com/sai/en/developers/sitecoreai/sitecore-content-serialization/configuration/sitecore-content-serialization-configuration-reference.html) (includes, scope, `maxRelativePathLength`)
- [SCS module rules](https://doc.sitecore.com/sai/en/developers/sitecoreai/sitecore-content-serialization/configuration/sitecore-content-serialization-configuration-reference.html#rules) (scope, `allowedPushOperations`, `alias` — site includes use rules)

**Reference:** [references/site-structure.md](references/site-structure.md)

---

## Prerequisite — collection YAML must exist

Before generating site YAML, ensure the **collection module** already exists on disk:

1. **Collection YAML already present** — e.g. `authoring/items/Company Name/serialized-content/collection/company-name.yml` and `{system-name}.module.json`
2. **Collection not yet created** — run [`sitecore-new-collection-yaml`](../sitecore-new-collection-yaml/SKILL.md) first, then return here

The site generator reads the tenant ID from `serialized-content/collection/{collection-system}.yml` and appends a site include to the collection's `module.json`.

Recommended: push the collection to CM before adding sites (tenant must exist for a clean workflow), but YAML-on-disk is sufficient for generation.

---

## When to use

| Task | Script | Output |
|------|--------|--------|
| Generate **site** YAML | `Generate-SitecoreSite.mjs` | Site tree + media-library YAML; updates collection `module.json` |

Script: `.cursor/skills/sitecore-serialization-skills/sitecore-new-site-yaml/scripts/Generate-SitecoreSite.mjs`

Templates: `.cursor/skills/sitecore-serialization-skills/sitecore-new-site-yaml/templates/`

---

## Inputs

| Input | Required | Example |
|-------|----------|---------|
| Site display name | Yes | `Corporate Website` |
| Collection display name | Yes — **ask if not provided** | `Company Name` |

System names: lowercase, spaces → hyphens (`Corporate Website` → `corporate-website`).

---

## Run

```powershell
node .cursor/skills/sitecore-serialization-skills/sitecore-new-site-yaml/scripts/Generate-SitecoreSite.mjs "Site Display Name" --collection "Collection Display Name"
```

Writes locally:

- `serialized-content/{site-system}/{site-system}.yml` + site tree (~92 YAML files)
- `serialized-content/media-library/{collection-system}/{site-system}.yml` + children (Sitemaps, System, …)
- Updates `{collection-system}.module.json` — appends site include; keeps `collection` include (`SingleItem`)

Wires cross-references in the generated YAML:

| Field | File | Target |
|-------|------|--------|
| `Parent` | `{site-system}.yml` | Tenant ID from `collection/{collection-system}.yml` |
| `SiteMediaLibrary` | `{site-system}.yml` | `media-library/{collection-system}/{site-system}.yml` |
| `AdditionalChildren` (first entry) | `{site-system}/Media.yml` | Same site media library root |
| `ThumbnailsRootPath` | `Settings/Site Grouping/{site-system}.yml` | Same site media library root |

Push to create items in Sitecore CM (uses **collection** namespace):

```powershell
cd authoring/items/{Collection Display Name}
dotnet sitecore serialization validate --fix -i {collection-system}-scs
dotnet sitecore serialization push -n production -i {collection-system}-scs
```

**Gap — Partial Design placeholder children:** the generated site tree includes `Presentation/Placeholder Settings/Partial Design.yml` (folder) but **not** `Header.yml` / `Footer.yml` children. When Phase 4 adds Partial Designs + Page Designs, you must create those children before push or Pages edit mode fails with `Placeholder 'sxa-footer' was not found`. See [partial-design-placeholder-settings/README.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/partial-design-placeholder-settings/README.md).

**Gap — authors cannot add to `headless-main`:** Settings **PlaceholdersPath** is the **project** folder `/sitecore/layout/Placeholder Settings/Project/{site}`. Create `headless-main` there **and** under site Presentation, set **Allowed Controls**, and include the project path in `*.module.json`. Legal example: [`isolated-collection-site`](../isolated-collection-site/SKILL.md).

---

## Embedded templates

```
templates/
├── new-site/                              # Site content tree
└── media-library/new-collection/new-site/ # Site media library tree
```

| Token | Replaced with |
|-------|---------------|
| `New Site` | Site display name |
| `new-site` | Site system name |
| `New Collection` | Collection display name (folder label) |
| `new-collection` | Collection system name |

All site item `ID:` values get fresh UUIDs; collection-bridge references map to the target collection by Sitecore `Path`.

---

## Path hashing

When paths exceed `defaultMaxRelativeItemPathLength` (see `sitecore.json` and the [SCS configuration reference](https://doc.sitecore.com/sai/en/developers/sitecoreai/sitecore-content-serialization/configuration/sitecore-content-serialization-configuration-reference.html)), the CLI may store some files under **hash folders** on disk while siblings with shorter paths remain in readable folders. YAML `Path:` always stays the full logical Sitecore path.

The generator runs `validate --fix` after writing files. Re-run before push whenever you edit site YAML:

```powershell
dotnet sitecore serialization validate --fix -i {collection-system}-scs
```

**Do not** guess hash folder names or change `Path:` to match disk layout — let the CLI relocate files.

---

## Checklist

- [ ] Collection YAML exists (`authoring/items/{Collection}/` + tenant YAML) — use [`sitecore-new-collection-yaml`](../sitecore-new-collection-yaml/SKILL.md) if missing
- [ ] Collection pushed to CM (recommended)
- [ ] Site display name and collection name confirmed
- [ ] `Generate-SitecoreSite.mjs` succeeded — YAML on disk only
- [ ] Collection module has `collection` include + new site include
- [ ] `SiteMediaLibrary` points to generated media-library YAML
- [ ] Site shell templates verified — see [headless-site-shell](../headless-site-shell/SKILL.md) / [docs/SITECORE-SITE-SHELL.md](../../../../docs/SITECORE-SITE-SHELL.md)
- [ ] `validate --fix` passes on collection namespace
- [ ] `push` run when ready to create items in Sitecore CM
- [ ] When using Partial/Page Designs later: add `Placeholder Settings/Partial Design/Header.yml` + `Footer.yml` children (`sxa-header`, `sxa-footer`) — **not created by this generator** — see [partial-design-placeholder-settings/README.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/partial-design-placeholder-settings/README.md)
- [ ] `headless-main` Allowed Controls on project + site placeholder trees so Pages can add Promo / Newsletter — see [`isolated-collection-site`](../isolated-collection-site/SKILL.md)
