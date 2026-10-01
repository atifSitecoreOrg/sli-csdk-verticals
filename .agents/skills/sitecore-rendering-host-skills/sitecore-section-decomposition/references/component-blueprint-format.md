# Component blueprint format

Global registry: `{project}/sections/component-blueprint.json`

One entry per **Sitecore rendering** to create (deduplicated across pages).

---

## Schema

```json
{
  "projectRoot": "design-screenshots/matthey-com",
  "updatedAt": "2026-06-11T12:00:00.000Z",
  "components": {
    "EyebrowTitleCarouselSection": {
      "cmsName": "EyebrowTitleCarouselSection",
      "componentType": "Section",
      "description": "Section with eyebrow, title, description, optional section CTA, and carousel placeholder for slides.",
      "sourceSectionFolders": ["be-the-answer-your-feature-carousel"],
      "fields": [
        { "name": "Eyebrow", "type": "Single-Line Text" },
        { "name": "Title", "type": "Single-Line Text" },
        { "name": "Description", "type": "Multi-Line Text" },
        { "name": "SectionCta", "type": "General Link" }
      ],
      "placeholders": [
        {
          "key": "carousel-slides-{DynamicPlaceholderId}",
          "allowedRenderings": ["FeatureCarouselCard"],
          "layout": "horizontal-carousel"
        }
      ],
      "variants": ["Default", "Inversed", "ImageTop", "Animated", "Carousel"],
      "confidence": "high"
    },
    "FeatureCarouselCard": {
      "cmsName": "FeatureCarouselCard",
      "componentType": "Card",
      "description": "Text-focused carousel slide with eyebrow, title, and body.",
      "parentComponents": ["EyebrowTitleCarouselSection"],
      "fields": [
        { "name": "Eyebrow", "type": "Single-Line Text" },
        { "name": "Title", "type": "Single-Line Text" },
        { "name": "Body", "type": "Multi-Line Text" }
      ],
      "placeholders": [],
      "variants": ["Default", "Inversed", "ImageTop", "Animated"],
      "confidence": "high"
    }
  }
}
```

---

## Field definitions

| Property | Required | Description |
|----------|----------|-------------|
| `cmsName` | Yes | Sitecore rendering / TSX folder name (PascalCase) |
| `componentType` | Yes | `Section`, `Card`, `Navigation`, `Footer`, `Hero`, `Layout` |
| `description` | Yes | One sentence for content editors |
| `sourceSectionFolders` | Yes | Section screenshot folders that informed this component |
| `fields` | Yes | Authorable fields inferred from screenshot |
| `placeholders` | When parent | Placeholder keys + allowed child renderings |
| `parentComponents` | When child | Parent section `cmsName` values |
| `variants` | Yes | Headless variant exports to implement |
| `confidence` | Yes | `high` \| `medium` \| `low` |

---

## Relationship to `manifest.json`

| manifest.json | component-blueprint.json |
|---------------|--------------------------|
| Section screenshot `cmsName` / `folderName` | `sourceSectionFolders` |
| `placeholderFor` | Child component in `placeholders[].allowedRenderings` |
| `type: carousel` | Parent gets `Carousel` variant + carousel placeholder |
| `type: signpost-section` | Parent `*SignpostSection` + `HorizontalLinkCard` child |

Visual screenshot names stay in manifest; **blueprint names are what you build in Sitecore**.
