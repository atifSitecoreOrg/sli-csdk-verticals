---
name: isolated-collection-site
description: >-
  Repeatable playbook for a new isolated SitecoreAI collection + site (wizard or
  YAML), dedicated rendering host, Content Hub DAM images, Pages placeholder
  Allowed Controls, and unique GUID prefix. Use when creating or documenting a
  new collection like legal, brother, or bristan — not when editing a shared
  industry-verticals tenant site.
paths:
  - "authoring/items/**"
  - "**/*.module.json"
  - "xmcloud.build.json"
  - "industry-verticals/**"
---

# Isolated collection + site

Use this after (or instead of) the XM Cloud **New Collection / New Site** wizard when the site must **not** live under `/sitecore/content/industry-verticals/…`.

**Worked GUID prefixes** (hosts are not in this clone; do not reuse the prefixes):

| Former site | Collection path | GUID prefix |
|-------------|-----------------|-------------|
| Legal / Pinsent | `/sitecore/content/legal/legal` | `a1e9` |
| Brother | `/sitecore/content/brother/brother` | `b40e` |
| Bristan | `/sitecore/content/bristan/bristan` | `b803` |
| NonProfit / Openhand | `/sitecore/content/nonprofit/nonprofit` | `0e0a` |
| Capco | `/sitecore/content/capco/capco` | `c4c0` |
| ASOS | `/sitecore/content/asos/asos` | `a50c` |
| Recruitment / Aspire | `/sitecore/content/recruitment/recruitment` | `4ec1` |

Generators: [`sitecore-new-collection-yaml`](../sitecore-new-collection-yaml/SKILL.md) then [`sitecore-new-site-yaml`](../sitecore-new-site-yaml/SKILL.md). Shell templates: [`headless-site-shell`](../headless-site-shell/SKILL.md). Lessons: [references/lessons-from-legal.md](references/lessons-from-legal.md).

## Checklist (copy and track)

```
Isolated site progress:
- [ ] Unique GUID prefix reserved (never reuse a1e9 / b40e / b803 / 0e0a / c4c0 / a50c / 4ec1)
- [ ] Collection + site exist (wizard IDs kept, or YAML generated then pushed)
- [ ] module.json includes: renderings, project placeholder-settings, page templates, collection SingleItem, site with rules
- [ ] Settings PlaceholdersPath → /sitecore/layout/Placeholder Settings/Project/{site}
- [ ] headless-main Allowed Controls on BOTH project + site Presentation trees
- [ ] Partial Design Header/Footer placeholder children (sxa-header / sxa-footer)
- [ ] Dedicated rendering host in xmcloud.build.json + Deploy editing host name matches Site Grouping
- [ ] Content Hub brand + DAM Image XML (no hotlinked reference CDN)
- [ ] Catalog fallbacks for listings until Edge publish catches up
- [ ] docs/{SITE}.md + COMPONENTS.md + site skill updated
- [ ] new-site-inventory: SITE-REGISTRY, project-context, docs/README, AGENTS.md
- [ ] validate --fix then push; do not pull over wizard IDs
```

## 1. Identity

Pick **one** system name for collection, site, host, and module (`{name}-scs`). Editing host name is **case-sensitive** and must match Site Grouping **Predefined application editing host** + **RenderingHost**.

If the collection was created in the **wizard**, keep those item IDs. Remap content onto that tree. Do not push a second tenant/template at the same path.

## 2. Module includes

Minimum working `*.module.json` (legal pattern):

- `/sitecore/Layout/Renderings/Project/{site}`
- `/sitecore/Layout/Placeholder Settings/Project/{site}` — **required** for Pages add-component
- `/sitecore/templates/Project/{site}/{PageTemplates}` (one include per template folder)
- Collection path `SingleItem`
- Site path with rules: `/Home`, `/Data`, `/Presentation`, `/Settings`, `/Dictionary`, `/Media` — `*` Ignored

Do **not** add includes for paths that do not exist (push fails). Do not pull until duplicate-path leftovers from a first generated site are deleted in CM.

## 3. Pages can add components

Settings **PlaceholdersPath** points at the **project** placeholder folder, not only the site Presentation folder. Create `headless-main` in **both** trees and set **Allowed Controls** to the site Available Renderings folder plus Promo / PageHeading / listing renderings authors need.

Nested keys (`article-sidebar-{*}`, `headless-person`) each need their own Placeholder Settings item.

Author-removable bands (Newsletter, extra Promo) go on the **page** `__Renderings`, not baked on a Partial Design. Device XML must include `l="{96E5F4BA-A2CF-4A4C-A4E7-64DA88226362}"`.

Partial chrome (Header, Person, Footer) stays on Partial Designs.

## 4. Host + Edge

- Clone nearest host under `industry-verticals/{site}`.
- `NEXT_PUBLIC_DEFAULT_SITE_NAME={site}`.
- After changing `NEXT_PUBLIC_*`, rebuild the editing host.
- GraphQL `item.path` for `/` must be `/sitecore/content/{collection}/{site}/Home`. If Edge returns `/sitecore/content/industry-verticals/{site}/Home`, children 404 — fix site definition / publish, do not invent a second Home.

## 5. Media

Prefer [`sitecore-content-hub-images`](../sitecore-content-hub-images/SKILL.md). Legal scripts: `download-*-images.mjs` → `Upload-*ContentHub.ps1` → `patch-*-dam-images.mjs`. Never commit CH secrets.

## 6. Document so the next agent can continue

| Artifact | Why |
|----------|-----|
| `docs/{SITE}.md` | Paths, host, GUID prefix, pages, push env, pitfalls |
| `docs/COMPONENTS.md` section | Renderings actually registered (not leftover starter widgets) |
| `.cursor/skills/{site}-*/SKILL.md` | Hard rules + page-design vs page-layout |
| `industry-verticals/{site}/.sitecore/component-map.ts` | `npm run sitecore-tools:generate-map` after new folders |
| [SITE-REGISTRY.md](../../../../.cursor/SITE-REGISTRY.md) | Host row; move the site out of “playbooks without a host” |

Run [`new-site-inventory`](../../new-site-inventory/SKILL.md) before finishing.
