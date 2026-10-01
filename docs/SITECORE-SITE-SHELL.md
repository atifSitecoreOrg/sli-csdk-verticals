# Sitecore headless site shell — templates and presentation

Canonical reference for **site root folder templates** under `{collection}/{site}` (Dictionary, Media, Data, Presentation, Settings). Wrong templates here break SXA query tokens (`$templates`, `$pageDesigns`), Page Designs UI, dictionary resolution, and media library wiring.

**Reference implementation:** FormaLux (`/sitecore/content/industry-verticals/forma-lux`).

---

## Site shell template map

Each top-level folder under the site root must use the **SXA/JSS branch template** for its role — **not** generic **JSS Data** (`a29d272e-9d48-453c-9e9d-b47585fa7f20`) except for the **Data** root folder.

| Content path | Correct template | Template ID | Wrong template (anti-pattern) |
|--------------|------------------|-------------|-------------------------------|
| `{site}/Dictionary` | Dictionary Domain | `0a2847e6-9885-450b-b61e-f9e6528480ef` | JSS Data |
| `{site}/Media` | MediaVirtualFolder | `e8e8c94f-4248-43c3-a79f-99fbb49d78e6` | JSS Data |
| `{site}/Data` | JSS Data | `a29d272e-9d48-453c-9e9d-b47585fa7f20` | ✅ correct here only |
| `{site}/Presentation` | Presentation Folder | `0a70fa73-8923-4a6e-abf3-4134f25f3221` | JSS Data |
| `{site}/Settings` | JSS App Settings | `0de7a4ac-f98c-4e55-912a-7fa90da860aa` (isolated sites) | JSS Data |

Industry-verticals shared sites (Forma Lux) use the same folder roles; Settings may use a variant template (`4628b2c8-d026-4251-b85e-5987e09d56ef`) but still exposes **Templates**, **RenderingsPath**, **DictionaryPath**, etc.

### Presentation subfolders

| Path | Template role | Typical template ID |
|------|---------------|---------------------|
| `Presentation/Headless Variants` | Headless Variants Folder | `da26c636-96e1-45e4-88d6-3fcec70d5699` |
| `Presentation/Placeholder Settings` | Placeholder Settings Folder | `52288e39-7830-4694-b62d-32a54c6ef7ba` |
| `Presentation/Placeholder Settings/Partial Design` | Placeholder Settings Folder | `52288e39-7830-4694-b62d-32a54c6ef7ba` |
| `Presentation/Available Renderings` | Available Renderings Folder | `26ec1d18-11b2-4dd9-8326-f6115f4fd7eb` |
| `Presentation/Partial Designs` | Partial Design Folder (project) | e.g. `{project}/Partial Design Folder` |
| `Presentation/Page Designs` | Page Designs (project) | e.g. `{project}/Page Designs` |

### Data subfolders (under `{site}/Data`)

Use **datasource folder** templates — not JSS Data:

| Folder | Template ID (industry-verticals) |
|--------|----------------------------------|
| Promos | `31135a36-23c2-469c-ba62-d742af0540f3` |
| Texts | `b762d567-87f5-493c-bb48-0c455d834457` |
| Link Lists | `c237d144-647a-4afe-aa7b-1570f3e3f139` |
| Images | `f7a45276-87f1-4ea5-bf25-e3c7cb7aa993` |
| Hero Banners | `38001de0-6d0b-4bc5-bf95-f616cfe0e281` |
| Features | `f055ed82-a30e-4ec9-9ca7-2e4ea50f4e82` |
| Footers | `78264062-4078-48ba-beb8-3bf32a08f91a` |

Compare with FormaLux serialized YAML before inventing new folder templates.

---

## Settings path fields (required)

**Settings** must be on JSS App Settings (not JSS Data) and wire project infrastructure:

| Field | Purpose | Example (FormaLux) |
|-------|---------|-------------------|
| Templates | `$templates` token | `/sitecore/templates/Project/industry-verticals` |
| RenderingsPath | Available renderings root | `/sitecore/layout/Renderings/Project/industry-verticals` |
| PlaceholdersPath | Layout placeholder settings | `/sitecore/layout/Placeholder Settings/Project/industry-verticals` |
| DictionaryPath / DictionaryDomain | Dictionary folder | `{site}/Dictionary` item ID |
| AppDatasourcesPath | Data folder | `{site}/Data` item ID |
| AppTemplate | Headless Site template | Project Headless Site template ID |

If **Templates** is empty, `$templates` falls back to a huge templates tree — Page Designs mapping shows PowerShell, Folder, Alias, etc. instead of Page, ProductPage, …

---

## Template to design mapping

Field on **Presentation → Page Designs** (`TemplatesMapping`). Field source query:

```
query:$templates||query:$pageDesigns//*[@@templatename='Page Design']
```

| Token | Resolves from |
|-------|----------------|
| `$templates` | Settings → Templates |
| `$pageDesigns` | Presentation → Page Designs folder |

**Serialized encoding:** URL-encoded `{templateGuid}={designGuid}` pairs joined with `%26` (encoded `&`), not raw `&`.

Example mapping rows: Page → Default, ProductPage → ProductPage, ProductCategoryPage → ProductCategoryPage. If the dropdown lists system templates, Settings or the Templates path is wrong — see the template map above.

---

## Generators and scripts

| Do | Don't |
|----|-------|
| Copy shell templates from a FormaLux site item or the **sitecore-new-site-yaml** skill templates | Use one `T_DATA_FOLDER` constant for Dictionary, Media, Settings, Presentation |
| Give each folder type its own template constant | Stub site shell in migrate scripts with JSS Data for all folders |
| Populate Settings shared fields (Templates, RenderingsPath, …) | Leave Settings as empty JSS Data item |
| Run `dotnet sitecore serialization validate -i {module} -f` before push | Hand-create hash folders or duplicate long placeholder paths |
| Set `CreateUpdateAndDelete` on `/Presentation`, `/Settings`, `/Dictionary`, `/Media` in `*.module.json` when fixing templates | Use `CreateAndUpdate` only — template changes may not push |

**Official generator:** `.cursor/skills/sitecore-serialization-skills/sitecore-new-site-yaml/` — templates already use correct shell inheritance.

---

## Verification checklist (Content Editor)

After serialization push, confirm under `{collection}/{site}`:

1. **Dictionary** → Dictionary Domain (book icon)
2. **Media** → MediaVirtualFolder
3. **Data** → JSS Data
4. **Presentation** → Presentation Folder
5. **Settings** → JSS App Settings; **Templates** populated
6. **Presentation → Page Designs** → Page Designs template; **Designing** shows Page / ProductPage / … not system templates
7. **Presentation → Partial Designs** → Partial Design Folder template

Quick grep on serialized YAML before push:

```powershell
# Should ONLY match Data.yml (and Data subfolders if not yet fixed)
rg 'Template: "a29d272e-9d48-453c-9e9d-b47585fa7f20"' authoring/items/{module}/serialized-content/{site}/
```

---

## Serialization pitfalls

| Issue | Fix |
|-------|-----|
| Duplicate ID on disk (long placeholder path) | `dotnet sitecore serialization validate -i {module} -f` — keep hash folder the CLI expects |
| Template change not applied in CM | `allowedPushOperations: CreateUpdateAndDelete` on affected paths |
| Value not in selection list (Page Design) | Stored GUID not returned by `$pageDesigns` query — fix Presentation/Page Designs templates |
| Empty Partial/Page Designs in Pages app | Wrong folder templates under Presentation |

Related: [unique-serialization-ids skill](../.cursor/skills/sitecore-serialization-skills/unique-serialization-ids/SKILL.md).

---

## Related docs

- [SITE-CLONING-GUIDE.md](./SITE-CLONING-GUIDE.md) — clone workflow
- [SITECORE-TECHNOLOGIES.md](./SITECORE-TECHNOLOGIES.md) — SXA Page Designs overview
- [README.md](./README.md) — documentation index
