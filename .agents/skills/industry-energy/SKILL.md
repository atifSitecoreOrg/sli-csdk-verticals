---
name: industry-energy
description: >-
  Energy vertical — articles plus operational grid status. Use for
  industry-verticals/energy (Gridwell) or a utilities site with a live status
  band and an article listing.
---

# Energy

Read [industry-verticals](../industry-verticals/SKILL.md) first.

| | Value |
|--|--------|
| Folder | `industry-verticals/energy` |
| Site | `gridwell` |
| Editing host | `energy` |
| Content | `authoring/items/industry-verticals/sites/gridwell` |

## Components to reuse

`article-listing`, `article-details`, `selected-articles` are the same article pattern as travel and retail.

Status is the part that is specific to this vertical: `grid-conditions`, `grid-demand`, `gridstatusgauge`. A new utilities site should reuse those three before adding another gauge.

Search uses `NEXT_PUBLIC_GRIDWELL_SEARCH_SOURCE`, not `NEXT_PUBLIC_SEARCH_SOURCE`.
