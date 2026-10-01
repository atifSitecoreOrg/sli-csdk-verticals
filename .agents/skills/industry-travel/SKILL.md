---
name: industry-travel
description: >-
  Travel vertical — destinations, articles, and deals. Use for
  industry-verticals/travel (Skywings), tourism, or destination marketing.
---

# Travel

Read [industry-verticals](../industry-verticals/SKILL.md) first.

| | Value |
|--|--------|
| Folder | `industry-verticals/travel` |
| Site | `skywings` |
| Editing host | `travel` |
| Content | `authoring/items/industry-verticals/sites/skywings` |

## Components to reuse

`destination-listing`, `destination-details`, `selected-destinations`, `article-listing`, `article-details`, `selected-articles`, `deals`, `icon-link-list`, `item-finder`, `subscribe`.

Destinations and articles are the same listing + detail pattern as products and doctors. Deals are the travel form of `offers` on retail. Search uses `NEXT_PUBLIC_SKYWINGS_SEARCH_SOURCE`, not `NEXT_PUBLIC_SEARCH_SOURCE`.

Advice or news pages on a future nonprofit site should start from `article-listing` / `article-details` here, not a new article component.
