# Site registry

Source of truth for sites in **this** clone. When a site is created, cloned, or renamed, update this file in the same change as the host and authoring. Procedure: [skills/new-site-inventory/SKILL.md](./skills/new-site-inventory/SKILL.md).

Last verified: 2026-10-01 against `industry-verticals/*/package.json` and `xmcloud.build.json`.

New hosts go under `industry-verticals/{folder}/`. Shared tenant content stays under `authoring/items/industry-verticals/` unless the site is an isolated collection.

## Hosts in this clone

| Folder | Brand | `renderingHosts` key | Sitecore site | Serialization |
|--------|-------|----------------------|---------------|---------------|
| `healthcare` | Nova Medical | `healthcare` | `nova-medical` | `Project.Healthcare-Content`, `Project.Healthcare-Media` |
| `luxury-retail` | Essential Living | `luxury-retail` | `essential-living` | `Project.Essentials-Content`, `Project.Essentials-Media` |
| `retail` | FormaLux | `nextjsstarter` | `forma-lux` | `Project.Retail-Content`, `Project.Retail-Media` |
| `starter` | starter | *(not deployed)* | — | — |
| `travel` | Skywings | `travel` | `skywings` | `Project.Travel-Content`, `Project.Travel-Media` |
| `energy` | Gridwell | `energy` | `gridwell` | `Project.Energy-Content`, `Project.Energy-Media` |

`deployItems.modules`: `Project.IndustryVerticals`.

## Playbooks without a host here

These skills describe earlier demos. Their `docs/*.md` guides were removed because the hosts are not in this clone. A site becomes real when a folder exists under `industry-verticals/` and a `renderingHosts` entry is added. Then move it into the table above, write `docs/{SITE}.md`, and follow `new-site-inventory`.

| Skill | Former host |
|-------|-------------|
| `legal-pinsent` | `industry-verticals/legal` |
| `nonprofit-openhand` | `industry-verticals/nonprofit` |
| `capco-consulting` | `industry-verticals/capco` |
| `brother-commerce` | `industry-verticals/brother` |
| `asos-fashion` | `industry-verticals/asos` |
| `recruitment-aspire` | `industry-verticals/recruitment` |

## Same-change updates

1. This file (move or add the row; refresh **Last verified**).
2. [.cursor/rules/project-context.mdc](./rules/project-context.mdc) — Available Sites.
3. [.cursor/AGENTS.md](./AGENTS.md) — site-specific skill row when a skill exists.
4. [docs/README.md](../docs/README.md) — verticals table.
5. `docs/{SITE}.md` and, when components land, a section in [docs/COMPONENTS.md](../docs/COMPONENTS.md).
6. `.cursor/skills/{site-skill}/SKILL.md` for day-to-day rules on that site.
7. `xmcloud.build.json` `renderingHosts` (and `postActions.scsModules` when the site serializes on deploy).
