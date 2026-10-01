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

## Industry skills

Brand-specific skills (ASOS, Brother, Pinsent, Capco, Openhand, Aspire) are folded into the industry type. Use [industry-verticals](./skills/industry-verticals/SKILL.md) to pick the host, then the matching skill:

| Type | Skill | Hosts |
|------|-------|-------|
| Retail / luxury retail | [industry-retail](./skills/industry-retail/SKILL.md) | `retail`, `luxury-retail` |
| Healthcare / people | [industry-healthcare](./skills/industry-healthcare/SKILL.md) | `healthcare` |
| Travel | [industry-travel](./skills/industry-travel/SKILL.md) | `travel` |
| Energy | [industry-energy](./skills/industry-energy/SKILL.md) | `energy` |

## Same-change updates

1. This file (move or add the row; refresh **Last verified**).
2. [.cursor/rules/project-context.mdc](./rules/project-context.mdc) — Available Sites.
3. [.cursor/AGENTS.md](./AGENTS.md) — industry skill row when the type is new.
4. [docs/README.md](../docs/README.md) — verticals table.
5. `docs/{SITE}.md` and, when components land, a section in [docs/COMPONENTS.md](../docs/COMPONENTS.md).
6. The industry skill for that type (extend [industry-retail](./skills/industry-retail/SKILL.md), [industry-healthcare](./skills/industry-healthcare/SKILL.md), [industry-travel](./skills/industry-travel/SKILL.md), or [industry-energy](./skills/industry-energy/SKILL.md)). Add a new industry skill only when the type is new.
7. `xmcloud.build.json` `renderingHosts` (and `postActions.scsModules` when the site serializes on deploy).
