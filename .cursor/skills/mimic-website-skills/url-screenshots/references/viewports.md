# Screenshot viewports

Default sizes used by `scripts/capture.mjs`:

| Device | Width | Height | Notes |
|--------|-------|--------|-------|
| **desktop** | 1440 | 900 | Primary layout reference for page decomposition |
| **tablet** | 768 | 1024 | Portrait tablet; stack / nav changes |
| **mobile** | 390 | 844 | iPhone-class; 2× device scale factor |

Override with `--devices desktop` (single device) when iterating quickly.

## Capture modes

| Flag | Behavior |
|------|----------|
| `--full-page` (default) | Full scrollable page — best for Sitecore page-from-design |
| `--viewport-only` | Above-the-fold only — faster, good for headers/heroes |

## Timing

| Flag | Default | Use |
|------|---------|-----|
| `--wait-ms` | 1500 | Allow lazy images, fonts, animations to settle |
| `--timeout-ms` | 60000 | Slow staging sites or heavy pages |

## Local dev URLs

For `http://localhost:3000/...`:

1. Start the rendering host (`npm run dev`) **before** capture.
2. Pass the full local URL to `--urls`.
3. Auth-gated routes may show login — capture public pages or configure storage state (advanced).

## Cookie banners

Cookie consent bars appear in screenshots unless:

- The site hides them for automated user agents (uncommon), or
- You pass pre-set consent cookies (not in default script — extend if needed)

Mark cookie banner as **Unclear** in page-from-design when absent from capture.

## Auth / login pages

Login walls, Auth0 redirects, and paywalls are not handled automatically. Options:

- Capture a public marketing URL instead
- Log in manually once and export Playwright `storageState` (extend script if recurring need)

## Output layout

```
design-screenshots/
  example-com--home/
    desktop.png
    tablet.png
    mobile.png
    source-url.txt
  example-com--about/
    desktop.png
    ...
  manifest.json          # when --manifest
```

Slug format: `{hostname}--{pathname}` with `/` → `home`.

## HTML output (default)

Each capture also writes:

| File | Contents |
|------|----------|
| `page.html` | Full document after JavaScript |

Skip with `--no-html`. HTML-only: `fetch-html.mjs` ([url-page-html](../url-page-html/SKILL.md)).
