---
name: sitecore-yaml
description: Generate and validate Sitecore Content Serialization YAML for collections, sites, renderings, placeholders, datasource items, media, roles, and users. When mimicking a page or site, must download captured images into media-library YAML and push to Sitecore. Use after Sitecore TSX/component planning or standalone YAML generation.
paths:
  - "authoring/items/**/*.yml"
  - "**/*.module.json"
  - "**/sitecore.json"
---

# Sitecore YAML

Use this skill for serialization only. Do not design components here.

## Generators

```txt
generators/sitecore-new-collection-yaml/scripts/Generate-SitecoreCollection.mjs
generators/sitecore-new-site-yaml/scripts/Generate-SitecoreSite.mjs
generators/sitecore-new-rendering-yaml/scripts/Generate-SitecoreRendering.mjs
generators/sitecore-media-from-url-yaml/scripts/create-media-from-urls.ps1
```

## Collection

```bash
node .cursor/skills/sitecore-yaml/generators/sitecore-new-collection-yaml/scripts/Generate-SitecoreCollection.mjs "Collection Display Name"
```

## Site

```bash
node .cursor/skills/sitecore-yaml/generators/sitecore-new-site-yaml/scripts/Generate-SitecoreSite.mjs "Site Display Name" --collection "Collection Display Name"
```

## Rendering/component YAML

```bash
node .cursor/skills/sitecore-yaml/generators/sitecore-new-rendering-yaml/scripts/Generate-SitecoreRendering.mjs "ComponentName" --module "Module Name"
```

When the generator requires a fields JSON file, produce one from the approved component fields first.

## Media from URLs (mandatory on mimic)

When the task is **mimic this page/site**, harvest images from capture HTML and **always** run the media script before considering YAML done. Full rules: [references/media-from-mimic.md](references/media-from-mimic.md).

```powershell
& ".cursor/skills/sitecore-serialization-skills/sitecore-media-from-url-yaml/scripts/create-media-from-urls.ps1" `
  -MediaRoot "authoring/items/{module}/serialized-content/media-library/{project}/{site}" `
  -SiteMediaPath "/sitecore/media library/Project/{project}/{site}" `
  -SiteRootItemId "{GUID}" `
  -Assets $assets `
  -BaseUrl "https://example.com"
```

Then `validate --fix` and **push** the module so media items exist in Sitecore CM.

Do not leave Image fields pointing at the reference website.

## Validation

From the module folder:

```bash
dotnet sitecore serialization validate --fix
```

Push only when the user requested it **or** when the workflow is mimic/page-from-design (media must land in CM):

```bash
dotnet sitecore serialization push -n production
```

## Rules

- Generate fresh GUIDs for new items.
- Never duplicate one item path in multiple files.
- Respect `*.module.json` include roots.
- Let `validate --fix` handle long SCS paths; do not guess hash folders.
- **Site shell:** Dictionary, Media, Presentation, Settings each need their own SXA template — not JSS Data on every folder. See [headless-site-shell](../sitecore-serialization-skills/headless-site-shell/SKILL.md) and [docs/SITECORE-SITE-SHELL.md](../../../docs/SITECORE-SITE-SHELL.md).
- **Isolated collection:** keep wizard IDs, unique GUID prefix, project + site `headless-main` Allowed Controls. See [isolated-collection-site](../sitecore-serialization-skills/isolated-collection-site/SKILL.md).
- **Datasource field values:** General Link fields need full internal link XML with target item `id`; hero/promo **images** from downloaded media `mediaid` (or CH DAM after upload) — never the reference-site CDN. See [datasource-field-values.md](../sitecore-serialization-skills/sitecore-new-rendering-yaml/references/datasource-field-values.md), [media-from-mimic.md](references/media-from-mimic.md), and [docs/SITECORE-DATASOURCE-FIELDS.md](../../../docs/SITECORE-DATASOURCE-FIELDS.md).
- For internal links, prefer Sitecore item IDs from `site-content-tree.json`.
- YAML must stay in the current module namespace.
