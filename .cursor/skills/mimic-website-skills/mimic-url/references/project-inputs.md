# New website — project inputs

Collect before starting. Ask only for missing values.

## Required

| Input | Used by | Example |
|-------|---------|---------|
| **Reference URL(s)** | url-screenshots, page-from-design | `https://www.matthey.com/` |
| **Sitecore site item path** | Phase 0 parsing → collection + site YAML generators | `/sitecore/content/johnson-matthey-demo-creation-test/jm-demo-creation-site` |
| **Editing host name** | scaffold-rendering-host | `johnson-matthey` |

## Optional (defaults shown)

| Input | Default | Used by |
|-------|---------|---------|
| **Rendering host folder** | Same as editing host name | scaffold → `editing-hosts/{folder}/` |
| **Project folder** | `{collection}` segment from site path | collection-yaml `--folder`; site-yaml `--collection` |
| **Collection display name** | Slugifies to `{collection}` from site path | `Generate-SitecoreCollection.mjs` |
| **Site display name** | Slugifies to `{sitename}` from site path | `Generate-SitecoreSite.mjs` |
| **Screenshot output** | `design-screenshots/{slug}/` | url-screenshots — slug from hostname + path |
| **Target page name** | `Home` or derived from URL path | page-from-design |
| **Prerender mode** | `SSG` | scaffold |
| **SitecoreAI environment** | `production` | Phase 2 push |
| **Developer settings** | **Ask user** — Deploy portal paste (Edge Context ID, site name, editing secret) | Phase 5 `.env.local` |

## Derived (do not ask separately when site path is valid)

From `/sitecore/content/{collection}/{sitename}`:

| Derived | Example |
|---------|---------|
| collection (system name) | `johnson-matthey-demo-creation-test` |
| sitename (system name) | `jm-demo-creation-site` |
| namespace | `{collection}-scs` → `johnson-matthey-demo-creation-test-scs` |
| project-folder | `{collection}` from site path (default) |

See [sitecore-new-collection-yaml](../../../sitecore-serialization-skills/sitecore-new-collection-yaml/SKILL.md) and [sitecore-new-site-yaml](../../../sitecore-serialization-skills/sitecore-new-site-yaml/SKILL.md).

## Wiring between phases

| Artifact | Path |
|----------|------|
| Editing host app | `editing-hosts/{rendering-host-folder}/` |
| Components TSX | `editing-hosts/{rendering-host-folder}/src/components/` |
| Module JSON | `authoring/items/{project-folder}/{collection}.module.json` |
| Serialized YAML | `authoring/items/{project-folder}/serialized-content/` |
| Design captures | `design-screenshots/{slug}/desktop.png` (+ tablet, mobile, HTML) |
| xmcloud.build.json key | `{editing-host-name}` |
| Component manifest review | [component-manifest-review.md](component-manifest-review.md) — Phase 4b gate |
| Local env setup | [sitecore-env-local](../../../sitecore-rendering-host-skills/sitecore-env-local/SKILL.md) — Phase 5; Deploy portal Developer settings |
| Media import | [sitecore-media-from-url-yaml](../../../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md) — Phase 4g; paths from `{collection}/{sitename}`; supports static, relative, and Sitecore `/-/media/` URLs — see [media-download.md](../../../sitecore-serialization-skills/sitecore-media-from-url-yaml/references/media-download.md) |

## Question template (batch)

When the user says "create a new website" without details:

> 1. **Reference URL(s)** — page(s) to capture and build from  
> 2. **Sitecore site item path** — e.g. `/sitecore/content/{collection}/{sitename}`  
> 3. **Editing host name** — key for `xmcloud.build.json` and Deploy app  
> 4. *(optional)* **Target page** name if not home page
