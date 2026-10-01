# Section plan (`section-plan.json`)



Each section folder gets a **reviewable implementation plan** before TSX and Sitecore YAML are authored.



| File | When written | Purpose |

|------|--------------|---------|

| `section-plan.json` | After every `section-capture.mjs` run | Human-reviewable plan: narrative summary, responsive layout, Sitecore component names, fields, TSX/YAML artifacts |



---



## Location



```

design-screenshots/{domain}/sections/{folder-name}/

  {folder-name}-desktop.png

  {folder-name}-tablet.png

  {folder-name}-mobile.png

  section.html

  section-plan.json          ← this file

```



---



## Schema overview (read top → bottom)



```json

{

  "version": 1,

  "reviewStatus": "pending",

  "sectionFolder": "hero-carousel",

  "review": {

    "narrativeSummary": "We will create 2 components: ImageTeaserCardGridSection (section wrapper) and ImageTeaserCard (repeatable child). ImageTeaserCardGridSection has no datasource fields (structure/layout only). Sitecore placeholder \"teaser-cards\" on ImageTeaserCardGridSection accepts ~8 ImageTeaserCard item(s). Each ImageTeaserCard is authored with: Image, Title, Link, PromoRibbon. Layout: responsive-grid-carousel. Responsive behaviour: desktop shows a grid (up to 4 cards per row); tablet and mobile show the same ImageTeaserCard items in a horizontal carousel.",

    "notes": [

      "Detection: Carousel / hero slider",

      "Placeholder \"teaser-cards\" → ImageTeaserCard (responsive-grid-carousel).",

      "Responsive layout: desktop = grid, tablet = carousel, mobile = carousel."

    ],

    "contentGuidance": null,

    "nextSteps": [

      "Review the narrative summary and responsive layout notes against the section PNGs.",

      "Edit component names or fields…"

    ]

  },

  "responsiveLayout": {

    "pattern": "responsive-grid-carousel",

    "differsByViewport": true,

    "cardCount": 8,

    "desktop": { "layout": "grid", "columnsMax": 4, "description": "…" },

    "tablet": { "layout": "carousel", "controls": "prev-next", "description": "…" },

    "mobile": { "layout": "carousel", "controls": "prev-next", "description": "…" }

  },

  "detection": { "cmsName": "HeroCarousel", "type": "carousel", "…": "…" },

  "assets": { "screenshots": { "desktop": "…", "tablet": "…", "mobile": "…" } },

  "implementationPlan": {

    "confidence": "high",

    "summary": "Build 2 components: ImageTeaserCardGridSection + ImageTeaserCard (responsive grid → carousel).",

    "components": [ "…" ]

  }

}

```



**Start with `review.narrativeSummary`** — plain-language description of what will be built, including:

- Which components are created (parent vs child vs standalone)
- **Whether Sitecore placeholders are used** and their key (e.g. `teaser-cards`, `header-nav`)
- **What renderings go inside each placeholder** and how many (~8 cards, etc.)
- **Which fields live on the parent datasource vs each child item**
- Responsive layout differences when desktop/tablet/mobile differ

Example excerpt:

> We will create 2 components: ImageTeaserCardGridSection (section wrapper) and ImageTeaserCard (repeatable child). ImageTeaserCardGridSection has no datasource fields (structure/layout only). Sitecore placeholder "teaser-cards" on ImageTeaserCardGridSection accepts ~8 ImageTeaserCard item(s). Each ImageTeaserCard is authored with: Image, Title, Link, PromoRibbon. Layout: responsive-grid-carousel. Responsive behaviour: desktop shows a grid…



---



## Image-embedded text (`review.contentGuidance`)



When a section uses an **image + text column** layout, the screenshot may show marketing copy or branding **inside the image area** that is **not** separate HTML text — it is baked into the image asset.



`analyzeImageFieldGuidance()` detects this from `section.html` (image column contains only `<img>`, text column has title/body/CTA). The plan then includes:



| Location | Purpose |

|----------|---------|

| `review.contentGuidance` | Tells downstream skills **not** to create extra fields for screenshot text inside the image |

| `review.notes` | Human-readable reminder with asset name and text-column fields |

| `review.narrativeSummary` | Appends guidance sentence after the field list |

| `implementationPlan.components[].fields[].contentGuidance` | Field-level flag on the `Image` field |



Example (image + rich-text block):



```json

"contentGuidance": {

  "pattern": "image-text-split",

  "imageFields": [

    {

      "fieldName": "Image",

      "visibleTextInScreenshot": true,

      "authorAsSeparateFields": false,

      "imageColumnHasHtmlText": false,

      "authorableTextInSeparateColumn": true,

      "authorableTextColumnFields": ["Title", "Body", "Cta"],

      "imageAsset": "Inhera-example.jpeg",

      "note": "Text or branding visible in the image column… do not create separate Sitecore fields…"

    }

  ]

}

```



**Downstream skills** (`sitecore-component-from-design`, YAML authoring): when `authorAsSeparateFields` is `false`, map visible image-column copy to the **Image** field only — do not add Title/Body fields for text that appears only inside the image in the screenshot.



---



## Responsive layout patterns



Analyzed from `section.html` + screenshot filenames:



| `pattern` | Meaning |

|-----------|---------|

| `responsive-grid-carousel` | Desktop = card grid; tablet/mobile = same cards in a carousel |

| `carousel-all-viewports` | Carousel on all breakpoints |

| `static-grid` | Grid on all breakpoints |

| `catalog-accordion-grid` | Desktop = multi-column catalog; tablet/mobile = accordion |

| `content-carousel` | Section title + content cards in a carousel |



When `differsByViewport` is `true`, read `responsiveLayout.desktop`, `.tablet`, and `.mobile` alongside the three PNGs.



---



## Parent + child sections



| `role` | Meaning |

|--------|---------|

| `parent` | Section wrapper with `<Placeholder>` — often **no** title/body fields when cards hold all content |

| `child` | Card slotted in parent placeholder (image, title, link, …) |

| `standalone` | Single component (header, footer, editorial block) |



**Important:** For responsive teaser grids, **do not** put title/body on the parent datasource — fields belong on `ImageTeaserCard` children.



---



## Review workflow



1. Run `section-capture.mjs` (or `write-section-plans.mjs` to refresh plans only).

2. Open `section-plan.json` + desktop/tablet/mobile PNGs side by side.

3. Read `review.narrativeSummary` first — confirm it matches what you see.

4. Check `responsiveLayout` when `differsByViewport` is true.

5. Set `reviewStatus` to `"approved"` or edit `implementationPlan.components`.

6. Build TSX + YAML only after approval.



---



## Relationship to other files



| File | Scope |

|------|-------|

| `section-plan.json` | **Per section** — review-first build plan |

| `section.html` | DOM source for responsive layout analysis |

| `sections/manifest.json` | Global registry |

| `sections/component-blueprint.json` | Global deduplicated registry (optional) |



Plans use [`analyze-section-html.mjs`](../scripts/lib/analyze-section-html.mjs) + [`decompose-sections.mjs`](../../../sitecore-rendering-host-skills/sitecore-section-decomposition/scripts/decompose-sections.mjs).


