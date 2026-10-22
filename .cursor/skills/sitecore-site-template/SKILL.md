---
name: sitecore-site-template
description: >-
  Build one SitecoreAI site template that appears in the Create site dialog
  and covers real estate, retail, and campaign sites. Use when the user asks
  for a site template, a Solution template, scaffolding for Create site, or a
  reusable real-estate, retail, or campaign site. Brand (logo, colours, type)
  stays on a per-site Brand item. Motion stays off while Page builder is editing.
---

# Sitecore site template

Generate **one** Project-layer site template named Versatile. Real estate, retail, and campaign sites are the same template with different content and a different Brand item. Do not add a template per brand or vertical.

Research and field ids: [docs/research/site-templates.md](../../../docs/research/site-templates.md) and [reference.md](reference.md).

## Stop rules

- Do not overwrite an existing module, host, or Solution template.
- Do not serialize anything under SXA Foundation or Feature. Project paths only.
- Do not put a brand hex value, font family, or logo path in a shared component. Read the Brand item.
- Do not put content renderings on a page design, and do not set the Page Design field on a page item.
- Do not set `__Workflow` or `__Workflow state` on a template, branch, or `__Standard Values`. Set `__Default workflow` on `__Standard Values` only.
- Do not change `SITECORE_SPE_ELEVATION`.
- Do not deploy the rendering host unless the user asks.
- Do not push, publish, or create a site on the CM unless the user asks. If `.sitecore/user.json` is missing, stop and ask for a sign-in. Do not switch environments.

## Inputs

Locked for the Versatile template. Do not ask again unless the user is starting a different template.

| Input | Value |
| --- | --- |
| Display name | Versatile |
| Description | One template for real estate, retail, and campaign sites |
| Language | English only |
| Brand | Not an input. Neutral defaults on the copied Brand item |
| Module | `authoring/items/site-templates/versatile/` |
| Host | `industry-verticals/versatile`, `renderingHosts` key `versatile` |

## Outputs

- Project module: templates, branches, renderings, placeholder settings, site setup, Solution template, PowerShell module, neutral thumbnail and placeholder logo. `CreateUpdateAndDelete` only on paths this module owns.
- Content SDK host with CSS variables fed by Brand, component map, dictionary keys, and the motion rules below.
- `xmcloud.build.json` host entry. Do not enable a deployment.
- Inventory updates from [new-site-inventory](../new-site-inventory/SKILL.md).
- `docs/versatile-site-template.md`.

## Workflow

1. Re-read the bound CM. Abort if any Solution template exists besides Basic (`5aae1eea-ea24-40bf-96f1-1f43da82c77b`) and Empty (`2867d289-8951-458a-af19-ce93a67bb494`). Resolve Basic Workflow and Basic Datasource Workflow. If Basic Workflow is missing, use Sample Workflow for pages and no datasource workflow, and record that in the research doc. If neither exists, stop.
2. Generate the module from the Alaris shape. Site Modules is the Basic Site module list plus this template's setup id. See [reference.md](reference.md).
3. Page types, each inheriting Page and `_PerSiteStandardValues`: Home, Landing, Listing, Detail, Article, Contact, Search. One page design and one type partial per type. Shared Header and Footer. Signatures: `header`, `footer`, `home`, `landing`, `listing`, `detail`, `article`, `contact`, `search`. Placeholder key `sxa-{signature}`. `TemplatesMapping` has seven `%26`-joined pairs. Header and footer leave `headless-main` open through a Container.
4. Three page branches: Property showcase, Retail catalogue, Campaign launch. Editable body and local datasources live on the branch, not on the page design.
5. Register the baseline library in Available Renderings with a datasource template and location. Library list is in [reference.md](reference.md).
6. Seed neutral Brand defaults and SXA Style items that reference the CSS variables, limited to the renderings that should offer them.
7. Validate before any push:
   - No path under SXA Feature or Foundation.
   - No fixed brand colour in `industry-verticals/versatile/src`.
   - Motion classes are not applied when `page.mode.isEditing` is set.
   - Seven `TemplatesMapping` pairs and nine partial signatures with matching `sxa-*` keys.
   - `__Default workflow` only on `__Standard Values`. Workflow and State blank everywhere else.
   - `dotnet sitecore serialization validate --fix` on the new module.

## Presentation

Follow [docs/SITECORE-SITE-SHELL.md](../../../docs/SITECORE-SITE-SHELL.md). Settings → Templates is `/sitecore/templates/Project/versatile`. Page Designs and Partial Designs use the project folder templates. Device id on layout XML is `l="{96E5F4BA-A2CF-4A4C-A4E7-64DA88226362}"`.

Pages use Basic Workflow (`b4f49b23-4bba-4c79-ba22-f89f5f0d4e4f`). Datasource templates use Basic Datasource Workflow (`a053ed9f-4099-4682-9411-2b4c98e481e4`). New items stay in the initial state.

## Look and motion

Neutral palette comes only from Brand CSS variables: `--brand-primary`, `--brand-secondary`, `--brand-accent`, `--brand-background`, `--brand-foreground`, `--brand-font-heading`, `--brand-font-body`.

Published site: short CSS motion (fade and rise, card lift, link underline, accordion, mobile drawer). Honor `prefers-reduced-motion` with the same still layout used in the editor.

When `page.mode.isEditing` is set:

- Do not apply entrance animation classes.
- Header is not `fixed` or `sticky`.
- Accordions are open. Every carousel slide is visible.
- A client island may toggle the drawer, accordion, carousel, and filters. It must not unmount field components or replace them with plain text.
- Do not put `transform` or `overflow: hidden` on a component root in a way that clips editing chrome.

Every `Text`, `RichText`, `Image`, and `Link` is a Content SDK field component in the first HTML. No edit frames.

## After an approved push

Push only this module. Read back that the Solution template resolves and Site Modules includes the new setup. There is no Create site API. Build collection `versatile` and site `versatile-preview` by applying the same setup actions (or by pushing the branch output those actions insert), in English, with neutral Brand defaults. Publish that site. Confirm seven template-to-design mappings and that a new page is in the workflow's initial state. Leave the site in place. Do not modify existing industry sites.

A second site with a different logo, and a Page builder render, wait until the host is deployed.
