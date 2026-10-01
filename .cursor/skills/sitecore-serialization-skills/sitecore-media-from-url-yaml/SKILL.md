---

name: sitecore-media-from-url-yaml

description: Download image assets from URLs and create Sitecore Content Serialization media library YAML (folder tree + Unversioned Media items with base64 Blob). Handles absolute static CDN paths, relative/root-relative paths (with BaseUrl), and Sitecore /-/media/ CDN URLs. Reuses existing items by Sitecore Path. Use whenever mimicking a page or site — invoked by website-to-sitecore, sitecore-from-capture, mimic-url, sitecore-component-from-design, or standalone batch imports.

paths:

  - "authoring/items/**/media-library/**"

  - "**/*.module.json"

---



# Sitecore media from URL → YAML



Download image bytes from design URLs and write **serialized media library YAML** on disk under the module's `media-library` include. Reuse existing items when `Path:` already matches — do not re-download duplicates.



**This skill does not create items in Sitecore CM.** It only writes YAML files. Items appear after `dotnet sitecore serialization push`.



**Script:** [scripts/create-media-from-urls.ps1](scripts/create-media-from-urls.ps1)



**References:**



- [references/media-download.md](references/media-download.md) — URL shapes (static, relative, Sitecore CDN), reuse rules, verification

- [references/media-orphan-prevention.md](references/media-orphan-prevention.md) — duplicate folders, hash folders, broken parent chains, recovery

- [references/media-item-template.md](references/media-item-template.md) — folder + media file YAML shape



**Orchestrated by:** [`website-to-sitecore`](../../website-to-sitecore/SKILL.md) · [`sitecore-from-capture`](../../sitecore-from-capture/SKILL.md) · [`mimic-url`](../../mimic-website-skills/mimic-url/SKILL.md) Phase 4g · [`sitecore-component-from-design`](../../sitecore-rendering-host-skills/sitecore-component-from-design/SKILL.md)



**Related:** [`sitecore-content-hub-images`](../sitecore-content-hub-images/SKILL.md) (preferred when Content Hub credentials exist — DAM `src` + `dam-id`) · [`sitecore-new-collection-yaml`](../sitecore-new-collection-yaml/SKILL.md) (module + media include) · validate/push via collection module namespace



---



## When to apply



| Trigger | Action |

|---------|--------|

| Caller passes `{ Url, Alt }[]` (absolute or relative with `-BaseUrl`) | Run `create-media-from-urls.ps1` |

| Batch media import for a site | Same script with full asset list + `-BaseUrl` from capture |

| Media item already exists at Sitecore `Path:` | Script returns existing `MediaId` — skip download |



---



## Supported URL shapes



See [references/media-download.md](references/media-download.md) for full detail.



| Shape | Example | Script behavior |

|-------|---------|-----------------|

| **Absolute static / CDN** | `https://cdn.example.com/assets/images/hero.jpg` | Path segments from URI path |

| **Root-relative** | `/static/logos/brand.svg` | Resolve with `-BaseUrl`, then path segments |

| **Relative** | `images/teaser.png` | Resolve with `-BaseUrl`, then path segments |

| **Protocol-relative** | `//cdn.example.com/logo.png` | Prepend `https:` |

| **Sitecore CDN** | `https://cdn.example.com/-/media/shared/logos/icon.svg?...` | Strip `/-/media/` prefix, then path segments |

| **XM Cloud edge CDN** | `https://edge.sitecorecloud.io/{tenant}/media/project/{package}/rai/rai/…` | Strip `{tenant}/media/project/{package}/` prefix, then path segments |



**Canonical URL rule:** the string in `{MEDIA:{Url}}` placeholders must **exactly match** `Url` in the `-Assets` list. Resolve relative paths once when scraping HTML — do not mix relative placeholders with absolute asset URLs.



---



## Inputs (from caller)



| Input | Required | Source |

|-------|----------|--------|

| `MediaRoot` | Yes | Disk path: `{serializationRoot}/media-library/{project}/{site}` |

| `SiteMediaPath` | Yes | Sitecore path: `/sitecore/media library/Project/{project}/{site}` |

| `SiteRootItemId` | Yes | GUID of site media root item (from site YAML) |

| `Assets` | Yes | `@(@{ Url = "…"; Alt = "…" }, …)` |

| `BaseUrl` | When assets are relative | Capture origin — `source-url.txt` or reference page URL |



Discover `{project}`, `{site}`, and paths from `*.module.json` media include.



---



## Execute



```powershell

$baseUrl = (Get-Content "design-screenshots/{slug}/source-url.txt" -Raw).Trim()

$mediaRoot = "authoring/items/{Module}/serialized-content/media-library/{project}/{site}"

$assets = @(

  @{ Url = "https://cdn.example.com/-/media/shared/logos/icon.svg"; Alt = "Logo" },

  @{ Url = "/assets/images/hero.jpg"; Alt = "Hero" }

)

& ".cursor/skills/sitecore-serialization-skills/sitecore-media-from-url-yaml/scripts/create-media-from-urls.ps1" `

  -MediaRoot $mediaRoot `

  -SiteMediaPath "/sitecore/media library/Project/{project}/{site}" `

  -SiteRootItemId "{site-media-root-item-guid}" `

  -BaseUrl $baseUrl `

  -Assets $assets | Out-File media-mapping.json -Encoding utf8

```



**Output JSON** (per asset): `{ Url, ResolvedUrl, MediaId, Path, Skipped }`



Return `MediaId` to the caller for datasource Image fields:



```yaml

Value: |

  <image mediaid="{MediaId}" />

```



---



## Workflow (this skill)



1. Resolve relative URLs (caller or `-BaseUrl` on script) — see [media-download.md](references/media-download.md).

2. For each URL, derive Sitecore item `Path:` from URL path segments.

3. **Normalize Sitecore CDN paths** — strip `/-/media/` before splitting (static CDN paths unchanged).

4. Search existing YAML under the media include for matching `Path:` + media file template.

5. If found → return existing `MediaId` (`Skipped: true`).

6. If missing → download bytes, create folder YAML chain, write media file YAML with base64 Blob.

7. Patch `{MEDIA:{Url}}` placeholders in datasource YAML with returned `MediaId` values.

8. **Verify** no placeholders remain and every `mediaid` exists in serialized `media-library/` — fail if not.

9. `validate --fix` — fix non-unique paths **before** push (see [media-orphan-prevention.md](references/media-orphan-prevention.md)).

10. `push`.



Full detail: [references/media-download.md](references/media-download.md)



---



## After creation



1. Caller sets Image field `mediaid` in component datasource YAML (or patches placeholders).

2. Verify all `mediaid` references resolve to serialized media file items.

3. `dotnet sitecore serialization validate --fix -i {namespace}`

4. `dotnet sitecore serialization push -i {namespace}` (or with collection module)



**Note:** `validate --fix` may relocate blob file YAML into hash folders on disk. `Path:` and `mediaid` references remain valid. Hash folders are **not** orphans — see [media-orphan-prevention.md](references/media-orphan-prevention.md).



---



## Do not



- Download from domains the user did not supply

- Put external `src` URLs in datasource Image fields — always `mediaid`

- Overwrite existing media YAML when `Path:` matches

- Push datasource YAML when download failed or `mediaid` GUIDs have no matching media YAML

- Continue silently when the script throws — fix URL shape or `-BaseUrl` first

- **Manually edit** media item `ID:` or `Parent:` to “fix” duplicates — delete duplicate folder YAML and re-run the script, or assign a new file ID and update datasource `mediaid`

- Re-run `create-media-from-urls.ps1` on a dirty tree without running `validate` first — duplicates folder items when the path-segment tree and hash-folder tree diverge



---



## Checklist



```

- [ ] MediaRoot, SiteMediaPath, SiteRootItemId discovered from module.json + site YAML

- [ ] BaseUrl set when scraped HTML contains relative/root-relative image paths

- [ ] All placeholder URLs canonicalized (same string in YAML placeholders and -Assets)

- [ ] create-media-from-urls.ps1 executed without errors

- [ ] media-mapping.json reviewed (Skipped vs new items; ResolvedUrl for relatives)

- [ ] No {MEDIA:…} placeholders remain in datasource YAML

- [ ] Every mediaid in datasource YAML exists in media-library/ serialization

- [ ] Every media file Parent: resolves to a folder item ID: in serialization (no broken parent chain)

- [ ] validate --fix passes (fix non-unique media paths manually if needed — see [media-orphan-prevention.md](references/media-orphan-prevention.md))

- [ ] push completed

```


