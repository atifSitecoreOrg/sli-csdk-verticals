---
name: headless-site-shell
description: Correct Sitecore headless site shell templates (Dictionary, Media, Presentation, Settings, Page Designs). Use when generating site YAML, fixing template inheritance, Page Designs mapping dropdowns, or migrate/generate scripts for isolated collections (Bristan pattern).
paths:
  - "authoring/items/**"
  - "authoring/**/scripts/generate-*.mjs"
  - "authoring/**/scripts/migrate-*.mjs"
  - "**/*.module.json"
---

# Headless site shell templates

Prevent **JSS Data on every folder** — the root cause of broken `$templates` / `$pageDesigns` tokens, empty Page Designs UI, and wrong template-to-design mapping dropdowns.

**Canonical doc:** [docs/SITECORE-SITE-SHELL.md](../../../../docs/SITECORE-SITE-SHELL.md)

**Golden references on disk:**

- Forma Lux: `authoring/items/industry-verticals/common/items/sites-forma-lux/forma-lux/`
- Bristan: `authoring/items/bristan/serialized-content/bristan/bristan/`
- Legal (isolated + project placeholder-settings): `authoring/items/legal/`
- Generator templates: `.cursor/skills/sitecore-serialization-skills/sitecore-new-site-yaml/templates/new-site/new-site/`

---

## When to use

| Symptom | Action |
|---------|--------|
| Dictionary/Media/Presentation show **JSS Data** in Content Editor | Fix shell templates; push with `CreateUpdateAndDelete` |
| Page Designs mapping lists PowerShell, Folder, Alias | Fix **Settings** (Templates path empty) |
| Value not in selection list on Page Design field | Fix Presentation + Page Designs folder templates |
| Generator uses one `T_DATA_FOLDER` for all shell items | Split into per-folder template constants (see doc) |
| Push fails: item ID in more than one place | [`unique-serialization-ids`](../unique-serialization-ids/SKILL.md) + `validate -f` |

---

## Shell template constants (copy into generators)

Use **named constants per folder** — never one shared JSS Data ID for shell scaffolding.

```javascript
const T_DATA_FOLDER = 'a29d272e-9d48-453c-9e9d-b47585fa7f20'; // Data root ONLY
const T_DICTIONARY = '0a2847e6-9885-450b-b61e-f9e6528480ef';
const T_MEDIA_FOLDER = 'e8e8c94f-4248-43c3-a79f-99fbb49d78e6';
const T_PRESENTATION = '0a70fa73-8923-4a6e-abf3-4134f25f3221';
const T_SETTINGS = '0de7a4ac-f98c-4e55-912a-7fa90da860aa';
const T_HEADLESS_VARIANTS_FOLDER = 'da26c636-96e1-45e4-88d6-3fcec70d5699';
const T_PLACEHOLDER_SETTINGS_FOLDER = '52288e39-7830-4694-b62d-32a54c6ef7ba';
const T_AVAILABLE_RENDERINGS_FOLDER = '26ec1d18-11b2-4dd9-8326-f6115f4fd7eb';
```

Data subfolders: Promos, Texts, Link Lists, Images — use industry-verticals folder template IDs (see doc table).

---

## Settings shared fields (required)

When writing `{site}/Settings.yml`, include at minimum:

- **Templates** → `/sitecore/templates/Project/{project}`
- **RenderingsPath** → `/sitecore/layout/Renderings/Project/{project}`
- **PlaceholdersPath** → `/sitecore/layout/Placeholder Settings/Project/{project}`
- **DictionaryPath** / **DictionaryDomain** → Dictionary item ID
- **AppDatasourcesPath** → Data item ID

Copy field set from Bristan `Settings.yml` and remap GUIDs.

---

## Page Designs / TemplatesMapping

Field source (on Page Designs template):

```
query:$templates||query:$pageDesigns//*[@@templatename='Page Design']
```

Serialized **TemplatesMapping** on Page Designs folder item:

- Encode: `%7b{TEMPLATE-GUID}%7d%3d%257B{DESIGN-GUID}%257D`
- Join pairs with `%26` (not `&`)

---

## Pre-push workflow

```powershell
# 1. Scan for JSS Data misuse (should only hit Data.yml at site root)
rg 'Template: "a29d272e-9d48-453c-9e9d-b47585fa7f20"' authoring/items/{module}/serialized-content/

# 2. Validate + fix hash paths / duplicates
dotnet sitecore serialization validate -i {module} -f

# 3. Push (shell paths need CreateUpdateAndDelete when changing templates)
dotnet sitecore serialization push -n {nickname} -i {module}
```

---

## Checklist

- [ ] Dictionary, Media, Presentation, Settings — correct templates (not JSS Data)
- [ ] Settings shared fields populated (especially Templates)
- [ ] Presentation subfolders use SXA folder templates
- [ ] Page Designs + Partial Designs use project branch templates
- [ ] TemplatesMapping uses `%26` separators
- [ ] `*.module.json` allows template changes on shell paths
- [ ] `validate -f` passes
- [ ] Content Editor: Page Designs → Designing shows Page / ProductPage / …

---

## Related skills

- [sitecore-new-site-yaml](../sitecore-new-site-yaml/SKILL.md) — preferred generator (templates already correct)
- [isolated-collection-site](../isolated-collection-site/SKILL.md) — wizard IDs, dual `headless-main` Allowed Controls
- [unique-serialization-ids](../unique-serialization-ids/SKILL.md) — duplicate ID + hash path issues
