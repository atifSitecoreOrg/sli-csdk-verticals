---
name: url-page-html
description: Fetches rendered HTML from URLs using Playwright (post-JavaScript DOM). Saves page.html for Sitecore component detection. Use when only HTML is needed, to refresh HTML without screenshots, or alongside url-screenshots captures.
paths:
  - "**/design-screenshots/**"
  - "**/page.html"
---

# URL page HTML

Fetch **rendered HTML** from one or more URLs after JavaScript runs (Playwright). Output feeds [`sitecore-page-from-design`](../../sitecore-rendering-host-skills/sitecore-page-from-design/SKILL.md) for landmark detection, copy extraction, links, and component boundaries.

**Script:** [`../url-screenshots/scripts/fetch-html.mjs`](../url-screenshots/scripts/fetch-html.mjs) (shares Playwright setup with url-screenshots)

**Also automatic:** [`url-screenshots`](../url-screenshots/SKILL.md) `capture.mjs` saves the same HTML files alongside PNGs (default).

---

## When to apply

| Trigger | Use |
|---------|-----|
| User asks to **grab/fetch HTML** from URL(s) | `fetch-html.mjs` |
| User only needs HTML (no screenshots) | `fetch-html.mjs` |
| User wants screenshots **and** HTML | `capture.mjs` (HTML on by default) |
| Page-from-design missing HTML for a captured page | Re-run `fetch-html.mjs` for that URL |

---

## Setup

Same self-contained setup as url-screenshots:

```bash
cd .cursor/skills/mimic-website-skills/url-screenshots
npm install
npm run setup
```

---

## Run

```bash
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/fetch-html.mjs \
  --urls "https://www.example.com,https://www.example.com/about" \
  --out "./design-screenshots/example-site" \
  --manifest
```

From skill folder:

```bash
npm run fetch-html -- --urls "https://www.example.com" --manifest
```

---

## Output per URL

```
design-screenshots/{slug}/
  page.html         ← full document (DOCTYPE + html)
  source-url.txt    ← original URL
```

| File | Use in page-from-design |
|------|-------------------------|
| `page.html` | Full page structure, chrome, and content |
| `sections/{folder}/section.html` | Per-section HTML from section-capture (preferred for component boundaries) |

---

## Options

| Flag | Default | Purpose |
|------|---------|---------|
| `--wait-ms` | 1500 | Wait after `networkidle` for lazy content |
| `--timeout-ms` | 60000 | Navigation timeout |
| `--manifest` | off | Write `manifest.json` with html paths |

---

## Why Playwright (not curl/fetch)

| Method | Gets JS-rendered DOM | Gets cookie/consent state |
|--------|----------------------|---------------------------|
| `curl` / `fetch` | No — initial HTML only | No |
| **Playwright** | Yes | Yes (same as screenshot session) |

Use Playwright so HTML matches what appears in screenshots.

---

## Hand off to sitecore-page-from-design

When building pages x, y, z:

1. Ensure each page folder has `page.html` + screenshots (from `capture.mjs` or prior run).
2. In Phase 1 analysis, read HTML **before** coding — see [html-analysis.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/html-analysis.md).
3. Cross-check screenshot regions with HTML landmarks and class/id patterns.

---

## Do not

- Use raw HTTP fetch for SPA/marketing sites when accuracy matters
- Commit huge HTML trees to git unless user requests
- Replace screenshots with HTML — use **both** for decomposition
