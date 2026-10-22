---
name: industry-verticals
description: >-
  Shared rules for every industry vertical in this repo, and which host to
  clone for retail, healthcare, travel, or energy. Use when editing any site
  under industry-verticals, choosing a vertical, or when a request names a
  brand demo such as ASOS, Brother, Pinsent, Capco, Openhand, or Aspire.
---

# Industry verticals

Start here. Then open the industry skill for the type you are building. Hosts that exist today are listed in [SITE-REGISTRY.md](../../SITE-REGISTRY.md) and [docs/COMPONENTS.md](../../../docs/COMPONENTS.md).

## Which industry

| Type | Clone this host | Skill | Content shape |
|------|-----------------|-------|----------------|
| Retail, luxury retail, fashion catalogue | `industry-verticals/retail` (FormaLux) or `luxury-retail` (Essential Living) | [industry-retail](../industry-retail/SKILL.md) | Product listing + detail, offers, articles |
| Healthcare, clinics, people directories | `industry-verticals/healthcare` (Nova Medical) | [industry-healthcare](../industry-healthcare/SKILL.md) | Person listing + detail, reviews |
| Travel, destinations, tourism | `industry-verticals/travel` (Skywings) | [industry-travel](../industry-travel/SKILL.md) | Destination and article listing + detail, deals |
| Energy, utilities, operational status | `industry-verticals/energy` (Gridwell) | [industry-energy](../industry-energy/SKILL.md) | Articles plus a status widget |
| Real estate, retail, or campaign from one template | `industry-verticals/versatile` | [industry-versatile](../industry-versatile/SKILL.md) | Home, landing, listing, detail, article, contact, search. Brand item holds logo and colour |
| Professional services (legal, consulting) | healthcare (people) + retail articles | [industry-healthcare](../industry-healthcare/SKILL.md) | People are the catalog; articles are the insight |
| Nonprofit (appeals, advice) | travel articles + retail promos | [industry-retail](../industry-retail/SKILL.md) | Advice articles, appeals as promos |
| Recruitment (jobs, consultants) | healthcare people + retail listings | [industry-healthcare](../industry-healthcare/SKILL.md) | Jobs and consultants are listing + detail |

Brand demos (ASOS, Brother, Pinsent, Capco, Openhand, Aspire) are not hosts in this clone. Use the row above. Do not recreate their paths, product ids, or GUID prefixes.

## Common patterns

These shapes repeat. Reuse the rendering pair instead of a new component.

| Pattern | Where it already exists |
|---------|-------------------------|
| Listing + detail | Products (`product-listing` / `product-details`), doctors (`doctors-listing` / `doctor-details`), articles (`article-listing` / `article-details`), destinations (`destination-listing` / `destination-details`) |
| Selected items | `selected-products`, `selected-articles`, `selected-destinations` |
| Promo band | `promo`, `offers` |
| Reviews | `reviews` on healthcare and retail |
| Search | `search-experience` on every host |
| Chrome | `header`, `footer`, `navigation`, `hero-banner` on the full verticals |

## Rules for every vertical

- Header and footer live on partial designs. Page bands live on the page `__Renderings` in `headless-main`.
- Authors can add components only when `headless-main` Allowed Controls exist on **both** the site Presentation tree and the project placeholder-settings tree.
- Page device XML includes the JSS layout: `l="{96E5F4BA-A2CF-4A4C-A4E7-64DA88226362}"`.
- Helpers stay in `src/lib/`. A `.tsx` under `src/components/` is registered by `npm run sitecore-tools:generate-map`.
- Do not invent people, products, or offices. Content is the serialized items plus a catalog fallback in `src/lib/` until Edge publish catches up.
- Image fields use Content Hub DAM `src` and `dam-id`, or this tenant’s media library. Do not hotlink the reference site.
- Do not commit `.env`, `.env.local`, or Content Hub credentials. Local deploy values stay in `.local/`, which is gitignored.
- Do not copy GUIDs from another vertical. Reserved prefixes from older demos: `a1e9`, `b40e`, `b803`, `0e0a`, `c4c0`, `a50c`, `4ec1`.
- Do not re-run a full site generator after datasources or images have been edited.
- A promo or return-visit banner sits on the **page** layout, not inside the product or person partial.
- On a card, the product link and the action button are separate. Do not wrap the whole card in one anchor.

## After a new component

1. Add `src/components/{kebab}/`.
2. Run `npm run sitecore-tools:generate-map` in that host.
3. Add rendering YAML and Allowed Controls when authors should insert it.
4. Update [docs/COMPONENTS.md](../../../docs/COMPONENTS.md) and run [new-site-inventory](../new-site-inventory/SKILL.md) if the host is new.
