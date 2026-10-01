# Content Hub image pipeline

## 1. Harvest

From mimic captures (`design-screenshots/{project}/**/section.html`, `page.html`) and/or curated live URLs:

- `<img src>` / `srcset`, `<picture>`, CSS `background-image`, SVG `<image href>`
- Resolve relative URLs with capture `source-url.txt` as base
- Deduplicate by canonical URL; assign stable `LocalFile` names (`web-*`, `product-*`, or `{page}-{slot}.jpg`)

## 2. Stage locally

Download into a folder **outside git** (e.g. OneDrive `_content-ready/`). Skip files that already exist when re-running.

**SSL note:** some brand CDNs fail with `curl.exe`; prefer `Invoke-WebRequest` on Windows.

## 3. Credentials

Load env from a local script **outside the repo**. Commit only `set-ch-env.example.ps1` (placeholder values).

Prefer **client_credentials** on an OAuth client that has a user assigned. Password grant often returns `unauthorized_client`.

## 4. Upload + public links

- Upload **new** `LocalFile` names only
- Persist `upload-manifest.json` / registry keyed by `LocalFile`
- Create public delivery links; record `ContentHubAssetId`, `DamId`, `PublicUrl`
- Many Sitecore fields may share one `DamId` — do not re-upload per field

## 5. Metadata

Stamp assets so CMS usage is queryable in CH, e.g.:

| Concept | Example (Brother) |
|---------|-------------------|
| Brand | Brother (`PCMBrandToAsset`) |
| Type | Social Media Asset (`AssetTypeToAsset`) |
| Tag | Used in CMS (`TagToAsset`) |

Resolve relation IDs against the target tenant — do not hardcode Brother IDs on other tenants without lookup.

## 6. Field plan

Build `DataItemPath` + `FieldName` → `ImageFieldXml` for every Image the mimic needs (hero, promo cards, logo, product Image/Image2/Image3, etc.).

## 7. Serialization targets

Before patching:

- Create missing datasources (Header, PromoStrip, …)
- Add missing template Image fields when pages need them
- Change page template only when the page should own Image fields (e.g. category hub)

## 8. Patch + verify

- Write DAM XML into YAML version fields
- Ensure every new item `ID:` is unique across the **entire** repo on disk
- Rebuild CMS map; aim for `InSync` on all planned rows
- `MissingSerialization` means the item/field still lacks YAML Image value or the map path points at a folder

## 9. Push

```powershell
dotnet sitecore serialization validate --fix -i {collection}-scs
dotnet sitecore serialization push -n {environment} -i {collection}-scs
```

## Reference scripts (Brother)

| Script | Role |
|--------|------|
| `Import-BrotherWebProductImages.ps1` | Curated download from live pages |
| `Upload-BrotherContentHub.ps1` | OAuth upload, public links, field CSV |
| `Set-BrotherContentHubMetadata.ps1` | Brand / type / tag |
| `Sync-BrotherContentHubMedia.ps1` | Registry, CMS map, `-ApplyPatch`, `-DownloadLocal` |
| `Add-BrotherProductPageImages.ps1` | ProductPage Image/Image2/Image3 patch helper |

Copy and rename for a new collection; keep secrets out of git.
