---
name: industry-versatile
description: >-
  Versatile site template for real estate, retail, and campaign sites. Use for
  industry-verticals/versatile, the Versatile Create site template, or a brief
  that should share one page model and a per-site Brand item.
---

# Versatile

Read [sitecore-site-template](../sitecore-site-template/SKILL.md) before changing templates, presentation, or motion.

| | Value |
|--|--------|
| Folder | `industry-verticals/versatile` |
| Preview site | `versatile-preview` |
| Collection | `versatile` |
| Editing host | `versatile` |
| Serialization | `authoring/items/site-templates/versatile` (`Project.Versatile`) |
| Doc | `docs/versatile-site-template.md` |

Logo, colours, and type live on `{site}/Settings/Brand`. PrimaryNavigation and CtaLink on that item drive the header and footer. Components read `--brand-*` variables. Motion is off while `page.mode.isEditing` is true.

Placeholders are `headless-header`, `headless-main`, and `headless-footer`. The post-setup step sets RenderingHost to `versatile`, the host name to the site name, and creates Projects, People, Journal, Contact, and Search under the existing Home.
