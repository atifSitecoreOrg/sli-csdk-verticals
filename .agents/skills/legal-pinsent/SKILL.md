---
name: legal-pinsent
description: >-
  Pinsent Masons isolated collection (legal) — people, Out-Law, events, careers,
  header search overlay, Content Hub DAM images, Pages authoring on headless-main.
  Use when editing industry-verticals/legal, authoring/items/legal,
  Person*, NewsArticle, SiteSearch, HeaderSearch, Event*, or legal-scs YAML.
---

# Legal — Pinsent Masons

The legal host is not in this clone. Repeatable playbook: [`isolated-collection-site`](../sitecore-serialization-skills/isolated-collection-site/SKILL.md).

| | Value |
|--|--|
| Host | `industry-verticals/legal` (Pages Router) |
| Module | `authoring/items/legal/legal.module.json` (`legal-scs`) |
| Paths | `/sitecore/content/legal` → `/sitecore/content/legal/legal` |
| GUID prefix | `a1e9` — never copy Bristan `b803` / Brother `b40e` |
| Editing host | `legal` on SitecoreSilver / SitecoreSilverProd |
| Push env | `sitecoreSilverProd` |
| CH brand | **PinsentMason** on starter-verticals-2 |

## Hard rules

- Do **not** invent extra lawyer names. People are the catalog + serialized PersonPages only.
- Never hotlink `pinsentmasons.com` in Image fields. DAM `src` + `dam-id` only.
- Never commit Content Hub env (`set-ch-env.ps1`), `.env`, `.env.local`, or a copy such as `.env copy`. Real keys stay in `.env.local` only.
- Keep helpers (`src/lib/HeaderSearch.tsx`, catalogs) in `src/lib/`. Every `.tsx` under `src/components/` is registered by `sitecore-tools:generate-map`.
- Do not pull `legal-scs` until wizard vs generator duplicate-path items are gone (see LEGAL.md).

## Page designs vs page layout

| Surface | Where renderings live |
|---------|------------------------|
| Person chrome (profile, quote, experience, insights, related) | **Person** partial |
| Newsletter / extra Promo / author-added bands | **PersonPage `__Renderings`** on `headless-main` |
| Article body | `NewsArticle` on the ArticlePage |
| Article rail | nested `article-sidebar-{*}` (LatestNews + Promo SidebarSignup) |

Authors cannot add components unless **both** placeholder trees have `headless-main` Allowed Controls:

1. Site: `Presentation/Placeholder Settings/headless-main` (SXA template `d2a6884c-…`)
2. Project: `/sitecore/layout/Placeholder Settings/Project/legal/headless-main` (Settings **PlaceholdersPath**)

Module **must** include the project placeholder-settings path. Empty Allowed Controls blocks Pages “add component”.

Page `__Renderings` device node needs JSS Layout: `l="{96E5F4BA-A2CF-4A4C-A4E7-64DA88226362}"`.

## Front-end contracts

| Area | Do this |
|------|---------|
| Person photo | Left column (`lg:grid-cols-[photo_copy]`) |
| Experience timeline | One dot per **top-level** `li` (`.pm-timeline > li::before`). Year on its own row. Nested meta `li` must not draw dots. |
| Specialisms | Border on the pill `a` only, not the `li` |
| Insights | White 3-col cards (`pm-insights__grid`), not a dark carousel |
| Article authors | Compact cards in `article-sidebar` (above Latest News / signup) |
| Person page layout | Empty device + JSS `l=` only (Dawn XML). Do not put `xmlns:p="p"` Newsletter on people — Pages hides the page. |
| Search empty | `/search` with no `q` shows `SEARCH_INDEX` cards, same as the header overlay |
| Footer map | `OfficeMap` Image on Main Footer — Content Hub, never a pinsentmasons.com URL |
| Article Summary | `ArticlePage` Multi-Line Text `a1e90010-…00004b` |
| Header search | Overlay reuses `searchCatalog` / `SEARCH_INDEX` cards; submit → `/search?q=` |
| Workflow | Pinsent Masons Content Approval: Draft → Editorial Review → Partner Approval → Approved. On ArticlePage + PersonPage SV. |

Catalog fallbacks (`src/lib/people-catalog.ts`, `search-catalog.ts`) cover Edge lag. Edge path must be `/sitecore/content/legal/legal` — if GraphQL `item.path` is `/sitecore/content/industry-verticals/legal/Home`, children 404.

## Scripts

```powershell
cd industry-verticals/legal
npm run sitecore-tools:generate-map
npx prettier --write "src/path/to/file.tsx"
npx eslint "src/path/to/file.tsx"

cd authoring/items/legal
dotnet sitecore serialization validate --fix -i legal-scs
dotnet sitecore serialization push -n sitecoreSilverProd -i legal-scs
```

Content generators live in `authoring/items/legal/scripts/` (`generate-person-page.mjs`, `generate-guide-article.mjs`, `generate-cms-listings.mjs`, `generate-events-careers.mjs`, `patch-legal-dam-images.mjs`). After YAML edits that include rich-text tables, indent `<tr>` or SCS parse fails.

## After adding a React component

1. Folder under `src/components/{kebab}/`.
2. `npm run sitecore-tools:generate-map`.
3. Rendering YAML + Pinsent Available Renderings + `headless-main` Allowed Controls if authors should drop it.
4. Update `docs/COMPONENTS.md` and `docs/README.md` when the host exists in this clone.
