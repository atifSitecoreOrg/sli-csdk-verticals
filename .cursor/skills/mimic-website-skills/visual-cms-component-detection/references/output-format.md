# Component inventory output format

Produce this JSON **per page per viewport** during visual analysis. Merge viewports when structure is identical; note responsive differences in `notes`.

---

## Component inventory schema

```json
{
  "page": "about-us",
  "viewport": "desktop",
  "sourceUrl": "https://example.com/about-us",
  "detectedComponents": [
    {
      "order": 1,
      "componentName": "Header",
      "componentType": "Navigation",
      "cmsName": "Header",
      "description": "Global site header with logo, search, utility links, and primary navigation.",
      "visualRole": "Site-wide navigation",
      "scope": "site",
      "children": [],
      "estimatedBounds": {
        "x": 0,
        "y": 0,
        "width": "full",
        "height": "approximate"
      },
      "confidence": "high",
      "fields": ["logo", "primaryNav", "utilityLinks", "search"]
    },
    {
      "order": 2,
      "componentName": "HeroBanner",
      "componentType": "Hero",
      "cmsName": "HeroBanner",
      "description": "Large introductory hero with background image, page title, and CTA.",
      "visualRole": "Page introduction",
      "scope": "page",
      "children": [],
      "confidence": "high",
      "fields": ["title", "subtitle", "backgroundImage", "cta"]
    },
    {
      "order": 3,
      "componentName": "StatsBar",
      "componentType": "StatsBar",
      "cmsName": "StatsBar",
      "description": "Horizontal statistics bar with three metrics.",
      "visualRole": "Key facts summary",
      "scope": "page",
      "placeholderFor": "StatsItem",
      "children": [
        {
          "childName": "StatsItem",
          "cmsName": "StatsItem",
          "repeatCount": 3,
          "fields": ["label", "value", "link"]
        }
      ],
      "confidence": "high"
    },
    {
      "order": 4,
      "componentName": "VerticalTeaserGrid",
      "componentType": "Grid",
      "cmsName": "VerticalTeaserGrid",
      "description": "Three-column grid of vertical image cards with title panels, images, and read-more buttons.",
      "visualRole": "Solution teaser navigation",
      "scope": "page",
      "placeholderFor": "VerticalTeaserCard",
      "children": [
        {
          "childName": "VerticalTeaserCard",
          "cmsName": "VerticalTeaserCard",
          "repeatCount": 3,
          "fields": ["title", "description", "image", "cta"]
        }
      ],
      "confidence": "high"
    }
  ]
}
```

---

## Field definitions

| Field | Required | Description |
|-------|----------|-------------|
| `order` | Yes | Top → bottom visual order (1-based) |
| `componentName` | Yes | Taxonomy name (`VerticalTeaserGrid`) |
| `componentType` | Yes | Base type: `Navigation`, `Hero`, `Grid`, `StatsBar`, `RichText`, … |
| `cmsName` | Yes | Final Sitecore component name (usually same as `componentName`) |
| `description` | Yes | One sentence — what a content editor manages |
| `visualRole` | Yes | Purpose on the page |
| `scope` | When global | `site` or `page` |
| `placeholderFor` | When parent | Child `cmsName` for Sitecore placeholder |
| `children` | When repeating | Array of child descriptors |
| `children[].childName` | Yes | Child taxonomy name |
| `children[].cmsName` | Yes | Child Sitecore name |
| `children[].repeatCount` | Yes | Visible repeat count in screenshot |
| `children[].fields` | Recommended | Authorable fields inferred from visual |
| `estimatedBounds` | Recommended | Visual crop hints (`x`, `y`, `width`, `height`) |
| `confidence` | Yes | `high` \| `medium` \| `low` |
| `selector` | After HTML pass | DOM selector from `page.html` validation |
| `notes` | Optional | Responsive differences, unclear boundaries |

---

## Confidence levels

| Level | When to use |
|-------|-------------|
| **high** | Clear visual boundary, obvious pattern, unambiguous taxonomy name |
| **medium** | Boundary or card type slightly ambiguous; two names possible |
| **low** | Partial crop, overlapping regions, or unclear repeat count — ask user |

---

## Mapping to `sections/manifest.json`

Visual inventory rows map to global manifest entries:

```json
{
  "components": {
    "VerticalTeaserGrid": {
      "cmsName": "VerticalTeaserGrid",
      "folderName": "vertical-teaser-grid",
      "type": "grid",
      "scope": "page",
      "placeholderFor": "VerticalTeaserCard",
      "source": "visual",
      "confidence": "high",
      "outputs": { "desktop": "vertical-teaser-grid/vertical-teaser-grid-desktop.png" }
    },
    "VerticalTeaserCard": {
      "cmsName": "VerticalTeaserCard",
      "folderName": "vertical-teaser-card",
      "type": "card",
      "parentSection": "VerticalTeaserGrid",
      "source": "visual"
    }
  }
}
```

Per-page order → `{page-slug}/page-manifest.json` → `sectionOrder` array.

---

## Multi-viewport merge rules

1. Analyze **desktop** first — canonical component list.
2. Compare **tablet** and **mobile** — same components, different layout?
3. If mobile adds/removes a band (e.g. collapsed nav), note in `notes`; do not duplicate `cmsName`.
4. One `cmsName` per logical component; responsive behavior → Headless variants in Sitecore build phase.

---

## HTML validation pass (step 9 only)

After visual inventory is complete:

1. Open `page.html` / `main.html` from capture folder.
2. Match each component's `estimatedBounds` to DOM landmarks (`header`, `main > div`, repeated class patterns).
3. Add `selector` to each inventory row.
4. Adjust `confidence` if DOM contradicts visual (e.g. visual grid is one Liferay band).
5. Write merged result to `sections/manifest.json` — visual names win over DOM generic names.
