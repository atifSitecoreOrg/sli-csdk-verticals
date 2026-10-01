# Lessons from the Legal (Pinsent) collection

Use these when repeating an isolated collection. The Legal host and `docs/LEGAL.md` are not in this clone.

## Wizard vs generator

The Legal collection was created with the **XM Cloud wizard**. A first YAML generate then collided at the same Sitecore paths with different IDs.

- Keep wizard IDs for tenant, Headless Site/Tenant templates, and media-library roots.
- Remap pages, renderings, and DAM fields onto that tree.
- Do **not** pull `legal-scs` until leftover generator items at the same path are deleted in Content Editor.
- Do **not** add module includes for template folders that are not on disk (`page-template`, `taxonomy-templates`) — push fails.

## GUID prefix

`a1e9` is reserved. New items: pick the next unused `a1e9…` block. Scan `authoring/items/legal` before allocating. Cross-module duplicates fail SCS push even if paths differ.

## Hash folders and YAML parse

SCS stores long paths under hash folders (`57FCA1DFB479E432/…`). YAML `Path:` stays the logical Sitecore path. Run `validate --fix` — do not invent hash names.

Rich-text tables: indent every `<tr>` / `<td>` under the field `Value: |` block. Unindented `<tr>` breaks the YAML document and the whole module push.

## Two placeholder trees

Settings **PlaceholdersPath** = `{D6D96BAA-…}` → `/sitecore/layout/Placeholder Settings/Project/legal`.

Pages “add to `headless-main`” reads **that** folder. Site `Presentation/Placeholder Settings/headless-main` alone is not enough.

| Tree | Template | Legal item |
|------|----------|------------|
| Project | `5c547d4e-7111-4995-95b0-6b561751bf2e` | `serialized-content/placeholder-settings/legal/headless-main.yml` |
| Site Presentation | `d2a6884c-04d5-4089-a64e-d27ca9d68d4c` | `…/Presentation/Placeholder Settings/headless-main.yml` |

**Allowed Controls** empty → authors cannot add Promo / Newsletter / PageHeading. List the Available Renderings folder plus the renderings they need.

## Partial vs page layout

Person chrome on the **Person** partial is shared by every PersonPage and cannot be removed in Pages.

Newsletter started on the Person partial — authors could not delete it. Move author-owned bands to PersonPage `__Standard Values` + each page `__Renderings`.

Empty page `__Renderings` (device with no `<r>` children) **overrides** standard values. Either omit `__Renderings` so std values inherit, or put the default Promo on every page item.

## Content Hub

Brand **PinsentMason**. Pipeline: download locally → `Upload-LegalContentHub.ps1` → `patch-legal-dam-images.mjs`. `set-ch-env.ps1` stays on the developer machine.

Never write `https://www.pinsentmasons.com/…` into Image fields. Edge will serve it until DAM is patched; then hotlinks break or violate the demo rule.

## Edge vs CM

After publish, Experience Edge sometimes resolved site `legal` Home as `/sitecore/content/industry-verticals/legal/Home` (does not exist on CM). `/people`, `/careers`, Dawn then returned null.

- Confirm CM site path `/sitecore/content/legal/legal`.
- Confirm Site Grouping host + `NEXT_PUBLIC_DEFAULT_SITE_NAME=legal`.
- Ship `*-catalog.ts` fallbacks so listings still render if children are unpublished.
- Confirm in Pages (CM) when Edge children 404.

## Front-end pitfalls that looked like CMS bugs

| Symptom | Cause |
|---------|--------|
| Three timeline dots per matter | `.pm-timeline li::before` also matched nested `.pm-timeline__meta li` |
| Double specialism outline | Border on both `li` and `a` |
| Dark insight “card” with clipped text | Carousel + `rounded-sm` + one slide — use a 3-col white grid |
| Cannot add components in Pages | Missing project `headless-main` Allowed Controls |
| Header search ≠ `/search` results | Overlay must call the same `searchCatalog` |

## People and story

Do not invent lawyers. Story personas (Thomas, Vince, Priya, Emma) are `/story` copy only — not PersonPages.

Event speakers and guide authors are only Dawn, Sally, Hammad (plus listed catalog people).

## Editing host

Deploy host name `legal` must match Site Grouping. Until assigned, Pages will not list Pinsent under a usable host even when master has `/sitecore/content/legal`. Rebuild after `NEXT_PUBLIC_*` changes.
