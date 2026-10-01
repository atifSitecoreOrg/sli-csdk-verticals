---
name: new-site-inventory
description: >-
  Update the site registry, project-context rule, AGENTS.md, and docs/README
  whenever a Sitecore site or rendering host is created, cloned, renamed, or
  removed. Use at the end of scaffold-rendering-host, mimic-url,
  isolated-collection-site, website-to-sitecore, or the site cloning guide.
paths:
  - "industry-verticals/**"
  - "xmcloud.build.json"
  - "authoring/items/**"
  - "docs/**"
  - ".cursor/SITE-REGISTRY.md"
  - ".cursor/AGENTS.md"
---

# New site inventory

Run this before finishing any task that adds, clones, renames, or removes a site. The registry is [.cursor/SITE-REGISTRY.md](../../SITE-REGISTRY.md).

## Record

| Field | Where it comes from |
|-------|---------------------|
| Folder | `industry-verticals/{folder}/` |
| Brand | Display name the user gave |
| `renderingHosts` key | `xmcloud.build.json` (may differ from the folder; retail is `nextjsstarter`) |
| Sitecore site | Site item name under the collection |
| Serialization | `*.module.json` namespace, or `postActions.scsModules` |
| Skill | `.cursor/skills/{name}/SKILL.md` if one exists |
| Guide | `docs/{SITE}.md` |

If the host folder is not on disk, leave the row under **Playbooks without a host**. Do not invent a `renderingHosts` key.

## Write

1. **Registry** — one row in the hosts table, or move it out of the playbooks table. Set **Last verified** to the current date.
2. **project-context** — add the same folder, brand, and one-line purpose under Available Sites in `.cursor/rules/project-context.mdc`.
3. **docs/README.md** — same row in the Industry Verticals table. Link `docs/{SITE}.md` once that guide exists.
4. **AGENTS.md** — add the site skill under Site-specific when the skill file exists. Link the guide.
5. **Site guide** — create or update `docs/{SITE}.md` with folder, host key, content path, module, and the skill name.
6. **Site skill** — create `.cursor/skills/{name}/SKILL.md` when the site has rules a later session must not miss (isolated collection, commerce, search). Description must name the folder and `authoring/items` path.

Skip a file only when it already matches the new row. Do not commit `.env.local` or secrets.

## Prompts that must trigger this

- “Create / clone / scaffold a site”
- End of `mimic-url`, `isolated-collection-site`, `scaffold-rendering-host`, or `website-to-sitecore` when a new host or module was added
- A new `industry-verticals/{folder}` or a new `renderingHosts` key
