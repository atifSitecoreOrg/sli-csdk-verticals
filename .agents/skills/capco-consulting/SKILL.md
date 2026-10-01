---
name: capco-consulting
description: >-
  Capco isolated collection — FS + Energy consultancy, people as product,
  Perspectives AEO, T+1 story, storyboard, Content Hub DAM images, Pages
  authoring on headless-main. Use when editing industry-verticals/capco,
  authoring/items/capco, Person*, StoryBoard, or capco-scs YAML.
---

# Capco

The Capco host is not in this clone. Playbook: [`isolated-collection-site`](../sitecore-serialization-skills/isolated-collection-site/SKILL.md).

| | Value |
|--|--|
| Host | `industry-verticals/capco` (Pages Router) |
| Module | `authoring/items/capco/capco.module.json` (`capco-scs`) |
| Paths | `/sitecore/content/capco` → `/sitecore/content/capco/capco` |
| GUID prefix | `c4c0` — never copy `a1e9` / `b40e` / `b803` / `0e0a` |
| Editing host | `capco` on SitecoreSilver / SitecoreSilverProd |
| Push env | `sitecoreSilverProd` |
| CH brand | entity **108095** on starter-verticals-2 |

## Hard rules

- Do **not** invent extra consultant names. People are the catalog + serialized PersonPages only (Elisabeth, Charlotte, Anne-Marie, Marina).
- Never hotlink `capco.com` in Image fields. DAM `src` + `dam-id` only.
- Never commit Content Hub env (`set-ch-env.ps1`), `.env`, `.env.local`, or a copy such as `.env copy`. Real keys stay in `.env.local` only.
- Keep helpers (`src/lib/HeaderSearch.tsx`, catalogs) in `src/lib/`. Every `.tsx` under `src/components/` is registered by `sitecore-tools:generate-map`.
- Do **not** re-run `generate-capco-site.mjs` after DAM stamps / Home.yml edits.
- CSS class names stay `pm-*` from the Legal clone; change tokens, not class names.
- Do **not** rebuild presenter surfaces as host pages: AEO analyser (marketplace app), Mini CMS, email studio, campaign flows, integrations hub, capabilities matrix. Those are slides / product demos, not Capco JSON renderings.
- Workflows: **Capco Content Approval Workflow** on ArticlePage / PersonPage / PressReleasePage / Page SV. **Capco Content Datasource Workflow** on HeroBanner / Header / Footer SV. Conversion pages stay **Approved**. Demo queue: canada-payment-fraud **Draft**, future-of-analytics + heatmap de-DE **Editorial Review**, regulatory-horizon **Principal Approval**, Campaign Landings/Payments **Awaiting Approval**. Do not re-run `generate-capco-site.mjs` after DAM stamps.

## Page designs vs page layout

Header/Footer on **partials**. Page `__Renderings` on `headless-main`. Device XML needs `l="{96E5F4BA-A2CF-4A4C-A4E7-64DA88226362}"`.

Authors cannot add components unless **both** placeholder trees have `headless-main` Allowed Controls:

1. Site: `Presentation/Placeholder Settings/headless-main`
2. Project: `/sitecore/layout/Placeholder Settings/Project/capco/headless-main`

List **OOTB groups first** (Page Content, Page Structure, Media, Navigation, Forms, FEaaS) plus Capco layout JSON (`HeroBanner`, `Promo`, `PageHeading`, listings, infographic, media, `StatBlock`, `CaseStudyGrid`, `ComparisonBlock`, `PublicationCard`, `EnquiryForm`, `PreferenceCentre`, `CampaignLanding`, `TaxonomyBubbles`). Do **not** put `Header`, `Footer`, `PersonProfile`, or `ArticleDetails` on that palette — they sit on partials / page layout and broke Add component last time.

## Story

Consultants are the product. Perspectives are AEO. Conversion: Priya → T+1 Perspective → Elisabeth Plakinger. Personas (Thomas, Emma, Vince, David) are story-only — not `/people` profiles.

## Scripts

```powershell
cd industry-verticals/capco
npm run sitecore-tools:generate-map

cd authoring/items/capco
node scripts/generate-capco-content-ops.mjs
node scripts/generate-capco-workflow.mjs
node scripts/generate-capco-story-surfaces.mjs
node scripts/generate-capco-taxonomy-bubbles.mjs
dotnet sitecore serialization validate --fix -i capco-scs
dotnet sitecore serialization push -n sitecoreSilverProd -i capco-scs
```

ArticlePage / PressReleasePage carry multi-taxonomy, summaries, AEO notes, video/podcast, whitepaper URL, infographics and HubSpot form ids. Header uses official Capco-horizontal DAM; footer uses the dark AWC mark. Home Hero **Video** is `home-hero.mp4` on brand 108095. After adding a page, rendering, or DAM stamp, update the four CSVs in `authoring/items/capco/scripts/media-maps/`. Do not re-run `generate-capco-site.mjs` after DAM stamps.
