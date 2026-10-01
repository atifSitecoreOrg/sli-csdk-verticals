---
name: sitecore-content-hub-images
description: >-
  Upload reference-site images to Sitecore Content Hub, create public DAM links,
  stamp brand/type/usage metadata, and patch Sitecore serialization Image fields
  with dam-id XML (not mediaid, not hotlinked CDNs). Use when mimicking a site or
  page, when the user asks for Content Hub / DAM / public content links, or when
  Image fields should use Content Hub instead of the media library. Prefer this
  over sitecore-media-from-url-yaml when Content Hub credentials are available.
  Invoked by website-to-sitecore, mimic-url Phase 4g, sitecore-from-capture, and
  sitecore-yaml media-from-mimic.
paths:
  - "authoring/items/**/scripts/**/*ContentHub*"
  - "authoring/items/**/scripts/media-maps/**"
  - "authoring/items/**/serialized-content/**/*.yml"
---

# Sitecore Content Hub images → YAML

Put captured page images into **Content Hub**, then wire Sitecore Image fields with **DAM public XML** so Edge/Content SDK resolve DAM assets.

**This skill does not push to CM by itself.** It writes/patches YAML (and CH assets). Finish with `validate` + `serialization push`.

**Reference implementations:** Brother — `authoring/items/brother/scripts/` + [media-maps/README.md](../../../authoring/items/brother/scripts/media-maps/README.md). Legal / PinsentMason brand — `authoring/items/legal/scripts/` + [legal media-maps](../../../authoring/items/legal/scripts/media-maps/README.md). Adapt scripts per collection; do not copy GUIDs or secrets.

**Related:** [`sitecore-media-from-url-yaml`](../sitecore-media-from-url-yaml/SKILL.md) (media-library fallback) · [`unique-serialization-ids`](../unique-serialization-ids/SKILL.md) · [DAM field format](references/dam-image-field.md) · [pipeline checklist](references/pipeline.md) · Brother PCM products: `New-BrotherContentHubProducts.ps1` + `media-maps/content-hub-product-registry.csv` (SKU-deduped `M.PCM.Product`; shares DAM assets with CMS Image fields)

**Orchestrated by:** [`website-to-sitecore`](../../website-to-sitecore/SKILL.md) · [`mimic-url`](../../mimic-website-skills/mimic-url/SKILL.md) Phase 4g · [`sitecore-from-capture`](../../sitecore-from-capture/SKILL.md)

---

## Choose path (mandatory)

| Condition | Use |
|-----------|-----|
| `CONTENTHUB_URI` + OAuth client available (user loaded local env) | **This skill** — DAM `src` + `dam-id` on Image fields |
| No Content Hub access | [`sitecore-media-from-url-yaml`](../sitecore-media-from-url-yaml/SKILL.md) — `<image mediaid="{…}" />` |
| User wants both | Upload to CH **and** keep optional media-library copies; Image fields must use **one** shape consistently (prefer DAM) |

**Never** leave reference-site CDN / `.ashx` / hotlinked marketing URLs in serialized Image fields.

Ask the user once: *Content Hub credentials loaded?* If yes, follow this skill. If no, fall back to media library.

---

## Target Image field XML

```xml
<Image src="https://{ch-host}/api/public/content/{publicId}" dam-id="{identifier}" alt="{alt}" dam-content-type="Image" />
```

Details: [references/dam-image-field.md](references/dam-image-field.md)

---

## Pipeline

Copy this checklist and track progress:

```
CH media progress:
- [ ] 1. Harvest image URLs from capture HTML / curated page list
- [ ] 2. Download to local staging (stable LocalFile names; skip existing)
- [ ] 3. Load Content Hub env (outside git) — never commit secrets
- [ ] 4. Upload new files only + create public links (dedupe by LocalFile)
- [ ] 5. Stamp metadata (Brand / AssetType / Used-in-CMS tag)
- [ ] 6. Build field map: DataItemPath + FieldName → ImageFieldXml
- [ ] 7. Ensure target items + Image fields exist (templates/datasources)
- [ ] 8. Patch YAML; assign unique item IDs (no collisions)
- [ ] 9. Sync map → SerializationStatus InSync for planned fields
- [ ] 10. validate --fix + push module namespace
```

Full step detail: [references/pipeline.md](references/pipeline.md)

### Brother commands (adapt names/paths per site)

```powershell
# Local only — never commit
. '{OneDrive}/…/_content-ready/set-ch-env.ps1'

cd authoring/items/{module}/scripts
.\Import-{Site}WebProductImages.ps1 -SkipExisting   # or harvest from design-screenshots
.\Upload-{Site}ContentHub.ps1                       # skips LocalFiles already in upload-manifest
.\Set-{Site}ContentHubMetadata.ps1
.\Sync-{Site}ContentHubMedia.ps1
.\Sync-{Site}ContentHubMedia.ps1 -ApplyPatch        # when map supports YAML patch
```

Env contract (example only): `authoring/items/brother/scripts/set-ch-env.example.ps1`

| Variable | Purpose |
|----------|---------|
| `CONTENTHUB_URI` | Tenant host |
| `CONTENTHUB_CLIENT_ID` / `CONTENTHUB_CLIENT_SECRET` | OAuth client (`client_credentials` preferred) |
| `CONTENTHUB_USERNAME` / `CONTENTHUB_PASSWORD` | Only if password grant required and enabled |
| `{SITE}_MEDIA_ROOT` | Staging folder outside git |

---

## Mimic integration (Phase 4g)

When orchestrators run media:

1. Harvest URLs from `design-screenshots/{project}/**/section.html` + `page.html` (same rules as media-from-mimic).
2. If CH env present → upload + patch DAM XML on datasources / page Image fields.
3. Else → `sitecore-media-from-url-yaml`.
4. Before push: grep serialized YAML for reference-host domains; fail if found on Image fields.
5. Run [`unique-serialization-ids`](../unique-serialization-ids/SKILL.md) checks — new datasource items must not reuse sibling IDs (e.g. Promo Strip vs Promo Grid).

---

## Do not

- Commit `set-ch-env.ps1`, client secrets, passwords, or tokens
- Re-upload files already in `upload-manifest.json` / asset registry (creates duplicate CH assets)
- Put external marketing CDN URLs in Image fields “temporarily”
- Reuse item `ID:` values from another datasource when creating Header / PromoStrip / page items
- Patch Image fields on folder items (create a real datasource under the folder)
- Skip template Image fields — add field definitions when the template lacks Image/Image2/…

---

## Done when

- Planned CMS fields show `InSync` (or equivalent) in the site media map
- Image fields use DAM XML **or** mediaid — not hotlinks
- `dotnet sitecore serialization validate --fix -i {namespace}` clean
- `dotnet sitecore serialization push -n {env} -i {namespace}` succeeds
