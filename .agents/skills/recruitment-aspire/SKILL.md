---
name: recruitment-aspire
description: >-
  Aspire recruitment isolated collection. Jobs, consultants, articles, branches,
  header search, CDP profile, and chatbot. Use when editing industry-verticals/recruitment
  or authoring/items/Recruitment. The host is not in this clone.
---

# Recruitment / Aspire

The recruitment host is not in this clone. Playbook: [`isolated-collection-site`](../sitecore-serialization-skills/isolated-collection-site/SKILL.md).

| | Value |
|--|--|
| Host | `industry-verticals/recruitment` |
| Module | `recruitment-scs` |
| Paths | `/sitecore/content/recruitment` → `/sitecore/content/recruitment/recruitment` |
| GUID prefix | `4ec1` for jobs, articles, consultants, branches, and renderings |
| Editing host | `recruitment` |

## Hard rules

- Collection name and site name are both `recruitment`. Do not rename the site to a misspelling.
- Do not re-run `Generate-SitecoreCollection.mjs` or `Generate-SitecoreSite.mjs` for this collection. Add pages with `authoring/items/Recruitment/scripts/write-recruitment-content.mjs` only if you mean to rewrite those items. The counter-offer article file lives in hash folder `3E52AF06B5EE5740` because the readable path is too long. `Path:` stays `/sitecore/content/recruitment/recruitment/Home/blog/2026/07/the-counter-offer-crisis-how-to-secure-your-ideal-candidate`. Do not invent a different hash.
- Job, Article, Consultant, and Branch copy lives on the page item. The React catalogue in `src/lib/aspire-catalog.ts` is the fallback until Edge returns the item. Page designs Job, Consultant, and Article already include the matching component. Insert those templates under `Home/job`, `Home/consultants`, and `Home/blog`. Do not stamp a second copy of the component on each new page.
- Never reuse GUID prefix `4ec1` on another collection.
- Do not hotlink weareaspire.com images. Photos are Content Hub brand **112600** ([brand detail](https://starter-verticals-2.sitecoresandbox.cloud/en-us/brands/branddetail/112600)): DAM `src` + `dam-id` only.
- Page, component, and media maps: `authoring/items/Recruitment/scripts/media-maps/`.
- Never commit `.env`, `.env.local`, `.env copy`, or Content Hub env. Real keys stay in `.env.local` only.

## Routes

`/`, `/candidates`, `/jobs`, `/job/{slug}`, `/consultants`, `/consultants/{slug}`, `/employers`, `/insights`, `/blog`, `/blog/2026/07/{slug}`, `/branches/{city}`.

Story URLs: `/job/account-executive-edtech-6039269`, `/consultants/ian-payne`, `/blog/2026/07/the-counter-offer-crisis-how-to-secure-your-ideal-candidate`, `/branches/London`.
