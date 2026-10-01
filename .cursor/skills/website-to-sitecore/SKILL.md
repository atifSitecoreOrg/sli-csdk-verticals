---
name: website-to-sitecore
description: Compact end-to-end workflow for reference URL or screenshots → captured design evidence → CMS component manifest → Sitecore Content SDK TSX → Sitecore YAML including Content Hub DAM images (preferred) or media-library items pushed to CM. Use only as the orchestrator; delegate capture, visual analysis, TSX, YAML, and media import to the focused skills.
paths:
  - "**/design-screenshots/**/page-manifest.json"
  - "**/design-screenshots/**/sections/manifest.json"
---

# Website to Sitecore

Use this skill when the user wants to mimic a website/page and produce Sitecore Content SDK components plus serialization YAML.

## Outcome

Produce:

```txt
design-screenshots/{project}/...
src/components/{namespace}/{Component}.tsx
.sitecore/component-map*.ts
authoring/items/{module}/...   (including media-library YAML, then push to CM)
```

## Workflow

1. **Capture** — run `capture-website` for URL inputs. Skip capture when screenshots already exist.
2. **Analyze visually** — run `visual-cms-map` on full-page screenshots + section crops.
3. **Create review manifest** — list components with action: `create`, `reuse`, `skip`, or `unclear`.
4. **Stop for user approval** before writing TSX/YAML, unless the user explicitly asked for a no-review batch.
5. **Build approved items** — run `sitecore-from-capture`.
6. **Generate serialization** — run `sitecore-yaml` (templates, renderings, datasources, page wiring).
7. **Media (mandatory)** — harvest image URLs from `section.html` / `page.html`. Prefer [`sitecore-content-hub-images`](../sitecore-serialization-skills/sitecore-content-hub-images/SKILL.md) (DAM `src` + `dam-id`) when Content Hub credentials are available; otherwise [`sitecore-media-from-url-yaml`](../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md) (`mediaid`). See [media-from-mimic.md](../sitecore-yaml/references/media-from-mimic.md). **Do not skip; never hotlink the reference site.**
8. **Validate and push** — `npm run build`, then `dotnet sitecore serialization validate --fix` and **push** so Image fields and (if used) `media-library` items exist in Sitecore CM.

## Non-negotiable rules

- Do not build components from URL memory. Use screenshots/HTML/manifests as evidence.
- Do not create one component per `div`; create CMS-authorable renderings.
- Do not duplicate components already marked `reuse` in `new-sections-manifest.json`.
- Do not copy GUIDs from another project.
- Do not hardcode marketing content in TSX; make content editable fields.
- **Put component/content images in Content Hub (preferred) or media-library YAML**, patch Image fields, and **push**. Do not hotlink the reference site. See [media-from-mimic.md](../sitecore-yaml/references/media-from-mimic.md) and [`sitecore-content-hub-images`](../sitecore-serialization-skills/sitecore-content-hub-images/SKILL.md).
- Keep all generated files inside the current rendering host and current serialization module.

## Review manifest shape

```json
{
  "project": "example-com",
  "pages": ["home"],
  "components": [
    {
      "id": "S1",
      "cmsName": "HeroBanner",
      "scope": "page",
      "action": "create",
      "evidence": ["design-screenshots/example-com/sections/hero-banner/hero-banner-desktop.png"],
      "fields": ["title", "body", "primaryLink", "image"],
      "placeholders": []
    }
  ]
}
```

Write this manifest to:

```txt
design-screenshots/{project}/component-review.json
```

## Reference in this repo: FormaLux

Use retail as the in-repo example. Pick the industry type in [industry-verticals](../industry-verticals/SKILL.md) and clone that host. Do not look for brand playbooks (ASOS, Brother, Pinsent, Capco, Openhand, Aspire) or their old `docs/*.md` guides.

| Artifact | Path |
|----------|------|
| Rendering host | `industry-verticals/retail/` |
| Deploy key | `nextjsstarter` |
| Serialization | `authoring/items/industry-verticals/` |
| Site item | `/sitecore/content/industry-verticals/forma-lux` |
| Component list | [docs/COMPONENTS.md](../../../docs/COMPONENTS.md) |

**Datasource pitfalls:** see [datasource-field-values.md](../sitecore-serialization-skills/sitecore-new-rendering-yaml/references/datasource-field-values.md) and [docs/SITECORE-DATASOURCE-FIELDS.md](../../../docs/SITECORE-DATASOURCE-FIELDS.md):

- **General Link** — full internal link XML with target item `id`; minimal XML → Edge `jsonValue: null` → `[object Object]` in `<Link>`
- **Images** — prefer Content Hub DAM XML ([`sitecore-content-hub-images`](../sitecore-serialization-skills/sitecore-content-hub-images/SKILL.md)); else tenant media library YAML (`sitecore-media-from-url-yaml`). Never hotlink the reference-site CDN (`.ashx`) in serialized YAML.
- **Publish** — push + publish datasource and page to Edge before debugging React

When adding a new site:

1. Change collection/site/module names consistently (`{project}.module.json`, `xmcloud.build.json` key).
2. Scaffold the host under `industry-verticals/{folder}/`. Clone the nearest vertical, add missing components, apply captured design tokens.
3. Run `sitecore-yaml` generators and a page-wiring script.
4. Register in `xmcloud.build.json` (`renderingHosts` and, when needed, `deployItems` / `postActions`).
5. Write `docs/{SITE}.md` and update [docs/README.md](../../../docs/README.md) and [docs/COMPONENTS.md](../../../docs/COMPONENTS.md). Isolated collections: [`isolated-collection-site`](../sitecore-serialization-skills/isolated-collection-site/SKILL.md).
6. Run [`new-site-inventory`](../new-site-inventory/SKILL.md) so [SITE-REGISTRY.md](../../SITE-REGISTRY.md), project context, and `AGENTS.md` match.
