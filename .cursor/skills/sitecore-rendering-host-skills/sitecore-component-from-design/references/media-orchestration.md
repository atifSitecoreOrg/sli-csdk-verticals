# Media orchestration (component scope)

When building one component from design, **this skill decides which media items are needed**; [`sitecore-media-from-url-yaml`](../../../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md) **downloads and writes the YAML**.

---

## Step 1 — Discover URLs from design

From **section crop + HTML** (manifest `selector` in `page.html` / `main.html`), collect every image used by this component:

| Source | Look for |
|--------|----------|
| HTML | `<img src>`, `<picture>`, CSS `background-image`, SVG `<image href>` |
| Screenshot | Visible logos, hero images, icons (confirm URL from HTML when possible) |

Map each to a **Sitecore Image field** from the content inventory (Step 2 in parent skill).

---

## Step 2 — Resolve absolute URLs

Scraped HTML may contain **relative**, **root-relative**, **protocol-relative**, **absolute static CDN**, or **Sitecore `/-/media/` CDN** URLs. All must become a **single canonical absolute string** used in both `{MEDIA:{Url}}` placeholders and the media script `-Assets` list.

**Base URL:** `design-screenshots/{slug}/source-url.txt`, capture manifest origin, or ask the user:

> What is the public site base URL for assets?  
> Example: `https://www.example.com`

| Scraped shape | Resolution |
|---------------|------------|
| `https://…` (static or Sitecore CDN) | Use as-is (keep original query string for placeholder match) |
| `//cdn.example.com/…` | Prepend `https:` |
| `/assets/hero.jpg` | `new URL(path, baseUrl)` |
| `images/teaser.png` | `new URL(path, baseUrl + '/')` |

Full URL shape reference: [media-download.md](../../../sitecore-serialization-skills/sitecore-media-from-url-yaml/references/media-download.md)

**Only download from user-provided domains.**

Pass `-BaseUrl` to `create-media-from-urls.ps1` as a safety net when the asset list may still contain relative URLs.

---

## Step 3 — Build asset manifest

Before calling the media skill, produce a table:

| Image field | Absolute URL | Alt text | Action |
|-------------|--------------|----------|--------|
| Logo | `https://www.example.com/media/logo.svg` | Company logo | create or reuse |
| HeroImage | `https://www.example.com/documents/hero.jpg` | Hero | create or reuse |

Deduplicate URLs used by multiple fields (e.g. same logo in two places → one media item, two `mediaid` references).

---

## Step 4 — Discover media include paths

From `*.module.json` and site YAML:

| Value | Example |
|-------|---------|
| `MediaRoot` (disk) | `authoring/items/{Module}/serialized-content/media-library/{project}/{site}` |
| `SiteMediaPath` | `/sitecore/media library/Project/{project}/{site}` |
| `SiteRootItemId` | GUID from site media root item YAML |

---

## Step 5 — Delegate download + YAML creation

Follow [`sitecore-media-from-url-yaml`](../../../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md) **in full**.

```powershell
$baseUrl = "https://www.example.com/"
$assets = @(
  @{ Url = "https://cdn.example.com/-/media/shared/logos/icon.svg"; Alt = "Logo" },
  @{ Url = "/o/theme/images/icon.svg"; Alt = "Support icon" }
)
& ".cursor/skills/sitecore-serialization-skills/sitecore-media-from-url-yaml/scripts/create-media-from-urls.ps1" `
  -MediaRoot $mediaRoot `
  -SiteMediaPath $siteMediaPath `
  -SiteRootItemId $siteRootItemId `
  -BaseUrl $baseUrl `
  -Assets $assets | Out-File media-mapping.json -Encoding utf8
```

Review `media-mapping.json` — apply each `MediaId` to the matching Image field in default datasource YAML.

**Before validate/push:** confirm no duplicate Sitecore `Path:` values under `media-library/` and every media file `Parent:` resolves — [media-orphan-prevention.md](../../../sitecore-serialization-skills/sitecore-media-from-url-yaml/references/media-orphan-prevention.md).

---

## Step 6 — Wire datasource YAML

Replace any provisional `<image src="…" />` with:

```yaml
Value: |
  <image mediaid="{MediaId}" />
```

**TSX:** do not embed external URLs in `defaultFields` — use empty image fields (`{ value: {} }`). Images come from datasource YAML via `mediaid`.

---

## Field mapping (HTML → Sitecore)

| HTML | Sitecore field type |
|------|---------------------|
| `<img>` | Image → delegate to media skill, then `mediaid` in datasource |
| `<h1>`–`<h6>`, labels, buttons | Single-Line Text |
| Paragraphs, lists | Rich Text or Multi-Line Text |
| `<a href>` | General Link |

Extract **all** visible text into datasource YAML — match screenshot copy exactly.

---

## Outer HTML scope

When user provides outer HTML for **one component only**:

- Do not create TSX/YAML for parent page chrome unless asked.
- Strip scripts/analytics; keep semantic structure for layout + field discovery.

---

## Do not

- Download or create media YAML inline — always delegate to `sitecore-media-from-url-yaml`
- Put external URLs in serialized Image field `src`
- Skip reuse check — the media skill handles existing `Path:` lookup (folders **and** files)

- Re-run media download repeatedly without `validate` on a tree that already has hash-folder items — causes duplicate folder YAML with the same `Path:`
