---
name: industry-healthcare
description: >-
  Healthcare vertical and other people-led sites — person listing, person
  detail, and reviews. Use for industry-verticals/healthcare (Nova Medical),
  doctors, lawyers, consultants, or a recruitment consultant directory.
---

# Healthcare and people

Read [industry-verticals](../industry-verticals/SKILL.md) first.

| | Value |
|--|--------|
| Folder | `industry-verticals/healthcare` |
| Site | `nova-medical` |
| Editing host | `healthcare` |
| Content | `authoring/items/industry-verticals/sites/nova-medical` |

## Components to reuse

`doctors-listing`, `doctor-details`, `reviews`, `header-extended`.

The same listing + detail pair covers a doctor, a consultant, or a lawyer. Rename fields in the datasource (name, role, photo, specialisms). Do not add a second profile component until the doctor components cannot carry the content.

## People rules

- People are serialized page items plus a fallback catalog in `src/lib/` until Edge returns them. Do not invent extra names.
- Profile chrome (photo, quote, experience) stays on the person partial. Extra bands the author can remove stay on the page `headless-main`.
- Photo sits in a column beside the copy. Specialism links are pills on the anchor, not the list item.
- Search with an empty query shows the same cards as the header overlay. The overlay component lives in `src/lib/`, not under `src/components/`.
- Jobs, if added later, are another listing + detail pair under Home, using the retail listing pattern for the grid and this skill for the person pages.
