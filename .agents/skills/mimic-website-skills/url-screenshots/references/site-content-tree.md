# site-content-tree.json

Aggregated **internal route map** for a mimic project — derived from header, footer, navigation, link lists, and captured page HTML.

**Generator:** `node scripts/write-site-content-tree.mjs --project ./design-screenshots/{domain}`

**Consumer:** [site-structure-from-links.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/site-structure-from-links.md) — Phase 4f page YAML assembly.

---

## Schema

```json
{
  "version": 1,
  "generatedAt": "2026-06-16T…",
  "project": "rai-nl",
  "baseUrl": "https://www.rai.nl",
  "siteContentPath": "/sitecore/content/rai/rai-amsterdam",
  "languagePrefixes": ["/en", "/nl"],
  "pages": [
    {
      "routePath": "/calendar",
      "pathnameVariants": ["/en/calendar"],
      "sitecoreSegments": ["Calendar"],
      "itemName": "Calendar",
      "parentSegments": [],
      "yamlRelativePath": "Home/Calendar.yml",
      "sitecorePath": "/sitecore/content/rai/rai-amsterdam/Home/Calendar",
      "title": "Calendar",
      "navigationTitle": "Calendar",
      "status": "mimicked",
      "captureSlug": "rai-nl--en-calendar",
      "sources": [
        {
          "href": "/en/calendar",
          "text": "Check out all events",
          "component": "Footer",
          "sourceFile": "sections/footer/section.html"
        }
      ]
    },
    {
      "routePath": "/organising",
      "status": "stub",
      "yamlRelativePath": "Home/Organising.yml",
      "sources": [{ "component": "Footer", "text": "Organise your event" }]
    }
  ],
  "stats": { "total": 42, "mimicked": 3, "stub": 39 }
}
```

---

## Field reference

| Field | Description |
|-------|-------------|
| `routePath` | Normalized path after language prefix strip |
| `pathnameVariants` | Raw href pathnames seen in HTML |
| `sitecoreSegments` | Item name segments under `Home/` |
| `yamlRelativePath` | Path under `{siteContentPath}/` serialization folder |
| `status` | `mimicked` (full capture) or `stub` (link-only) |
| `sources` | Where this route was discovered (component + link text) |

---

## When to regenerate

- After initial url-screenshots capture
- After footer/header/navigation components are built (link fields may add routes)
- Before authoring script writes page YAML
