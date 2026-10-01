# Sticky overlay capture (overlay + clean)

Every viewport produces **two** full-page screenshot sets. **Content section crops** are taken with site chrome hidden (no `-clean` suffix on section files).

| Suffix | When | Use for |
|--------|------|---------|
| *(none)* / `desktop.png` | Sticky overlays **visible** | Full-page overlay view; detect sticky components |
| `-clean` / `desktop-clean.png` | All sticky overlays **hidden** | Full-page content view |

Implemented in `scripts/lib/sticky-overlays.mjs`.

---

## Workflow

```
Load page
  → Detect cookie banner / consent popup
  → Capture CookieBanner (all viewports) while visible
  → Hide cookie banner + dimming backdrop (TrustCommander, OneTrust, …)
  → Capture other sticky overlays (TopBar, Header, Navigation, …) without grey backdrop
  → Re-capture Header/TopBar/Navigation if cookie was present but chrome was captured earlier
  → Per viewport:
      reload → full-page overlay PNG
      hide all sticky overlays → full-page clean PNG
  → Hide site chrome again
  → Discover content sections
  → For each content section:
      hide site chrome → re-resolve selector per viewport → section.html + PNG crops
```

**Cookie-first rule:** Never capture Header, TopBar, or Navigation while a cookie consent backdrop is still active — it greys out the page. Always capture CookieBanner first, hide it (including backdrop), then capture other site chrome.

**Per-viewport selectors:** Section selectors prefer stable `data-webid` anchors and are re-resolved at each viewport so responsive layout changes (e.g. desktop grid vs mobile accordion) crop the correct element.

**Hide targets:** cookie banners (OneTrust, Osano, **TrustCommander** `#tc-privacy-wrapper`, Didomi, Cookiebot, …), top bars, **header**, **navigation**, chat widgets, floating side buttons, and any **fixed/sticky top chrome** (generic fallback for modern sites).

**Cookie detection:** explicit CMP selectors first, then a **generic heuristic** for fixed/sticky privacy/consent overlays (id/class contains `cookie`, `consent`, `privacy`, `tc-privacy`, etc.) — excludes footer links and in-page dialogs inside `main`.

**Header detection:** explicit selectors (`header`, `[role="banner"]`, `[class*="GlobalHeader"]`, …) plus skip-link parent walk and fixed/sticky top-bar heuristic.

**In-page nav excluded:** tab lists, slide carousels, and nav inside `section` / footer are never treated as site chrome.

---

## File naming

### Full page (`{page-slug}/`)

| File | Mode |
|------|------|
| `desktop.png` | overlay |
| `desktop-clean.png` | clean |
| `tablet.png` / `tablet-clean.png` | same pattern |
| `mobile.png` / `mobile-clean.png` | same pattern |
| `page.html` | full document (no `main.html`) |

### Section crops (`sections/{folder}/`)

| File | Mode |
|------|------|
| `header-desktop.png` | overlay (sticky chrome component) |
| `hero-banner-desktop.png` | content (chrome hidden before capture) |
| `section.html` | outerHTML of matched section element |

---

## Manifest fields

```json
{
  "Header": {
    "isStickyOverlay": true,
    "captureMode": "overlay",
    "outputs": { "desktop": "header/header-desktop.png" },
    "sectionHtml": "header/section.html"
  },
  "HeroCarousel": {
    "isStickyOverlay": false,
    "captureMode": "clean",
    "outputs": { "desktop": "hero-carousel/hero-carousel-desktop.png" },
    "sectionHtml": "hero-carousel/section.html"
  }
}
```

---

## Visual detection rules

| Analyze | Screenshot set |
|---------|----------------|
| CookieBanner, TopBar, Header, Navigation, ChatWidget, FloatingActionButton | **Overlay** (captured while visible) |
| Hero, grids, carousels, CTAs, footer content bands | **Content** (chrome hidden before crop) |

See [`visual-cms-component-detection`](../visual-cms-component-detection/SKILL.md) and [`sitecore-section-decomposition`](../../../sitecore-rendering-host-skills/sitecore-section-decomposition/SKILL.md).
