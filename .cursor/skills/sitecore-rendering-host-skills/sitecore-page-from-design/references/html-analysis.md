# Using captured HTML in page decomposition

When `design-screenshots/{slug}/` contains `page.html` and `main.html` (from [`url-screenshots`](../../../mimic-website-skills/url-screenshots/SKILL.md) or [`url-page-html`](../../../mimic-website-skills/url-page-html/SKILL.md)), use them **together with screenshots** in Phase 1.

---

## File choice

| File | Read for |
|------|----------|
| `page.html` | `<header>`, `<nav>`, `<footer>`, cookie/consent markup, global scripts |
| `main.html` | Hero, content sections, cards, grids, CTAs inside main |
| `source-url.txt` | Base URL for relative assets and routes |

If only one exists, use it. If neither exists, fetch with `fetch-html.mjs` or ask user to paste HTML.

---

## Phase 1 — HTML-assisted region detection

For each page (x, y, z), before the component manifest:

1. **Landmarks** — grep or scan for:
   - `header`, `nav`, `main`, `aside`, `footer`
   - `[role="banner"]`, `[role="navigation"]`, `[role="main"]`, `[role="contentinfo"]`
   - `[aria-label="breadcrumb"]`, `[class*="breadcrumb"]`

2. **Layout bands** — in `main.html`, top → bottom:
   - Direct children of `main` or `.container` wrappers
   - Repeated class patterns (`section`, `hero`, `carousel`, `grid`, `card`)
   - Heading hierarchy (`h1` once in hero/title; `h2` per section)

3. **Component signals**

| HTML signal | Likely Sitecore component |
|-------------|---------------------------|
| Top `header` + logo + nav list | `Header` + nav placeholder |
| `nav` with ordered links + separators | `Breadcrumb` |
| Full-bleed image + `h1` + CTA button | `HeroSection` |
| Row of equal `.card` / article tiles | `GridSection` + `{Name}Card` |
| `[class*="cookie"]`, `#onetrust`, consent buttons | `CookieBanner` |
| `footer` multi-column link lists | `Footer` |
| `form` with email/password | Register / FormSection |
| Search `input[type=search]` + results list | `SearchExperience` |

4. **Content inventory table** — extract from HTML (exact strings):

| UI element | HTML source | Proposed field |
|------------|-------------|----------------|
| Hero H1 | `<h1>…</h1>` | Title |
| CTA label | `<a class="btn">…</a>` | CTALink (General Link) |
| CTA with icon | `<a>Label<span class="icon"></span></a>` | Same General Link — mirror inner markup in TSX; see [General Link patterns](../../sitecore-component-from-design/references/visual-fidelity.md#general-link-cta-fields--inner-markup-patterns) |
| Panel arrow CTA | `text-panel-link` + `arrow__forward` (ignore empty `text-panel-full-link` in TSX) | One General Link, **one** arrow `<SitecoreLink>` — [dual-link-cta-patterns.md](../../sitecore-component-from-design/references/dual-link-cta-patterns.md) |
| Body with `<br>` pseudo-link line | `<p>Line one<br>View highlights &gt;&gt;</p>` | `Body` field — preserve `<br>` as `\n` in authoring; not a second link field |
| Image + text band | `s2c__ctn` **or** `jmrich--text-inner` + `float:right` on `image_sc` | Same cmsName may differ — detect archetype before TSX — [layout-archetype-detection.md](../../sitecore-component-from-design/references/layout-archetype-detection.md) |
| Subtitle + quote (two different strings) | `<p class="…subt">` + `<blockquote>` | **Two fields** (e.g. `Subtitle`, `Body`) — never one field on both nodes |
| Multiple body paragraphs | several `<p>` under same wrapper | One **Rich Text** field with `<p>…</p>` HTML in datasource YAML; render with `<RichText field={fields.Body} />` (do not split into multiple `<Text>` nodes — not editable in Pages) |
| Card title | `.card h3` | Title |

5. **Cross-check screenshot vs HTML**

| Situation | Action |
|-----------|--------|
| Visible in screenshot, not in HTML | May be background image / pseudo — note in manifest |
| In HTML, not visible in screenshot | Hidden mobile menu, accordion — mark **Unclear** or mobile-only |
| Cookie banner in HTML but not screenshot | Consent already accepted in browser — mark CookieBanner **Unclear** |

---

## Multi-page builds (pages x, y, z)

When user lists multiple pages:

1. Map each page to a capture folder slug (from `manifest.json` or naming convention).
2. Run Phase 1 **per page** — shared chrome (Header/Footer) may match across pages; reuse audit in Phase 2.
3. Share HTML-derived nav links to confirm route list matches user request.
4. **Harvest internal links** from header, footer, navigation, and link-list `section.html` files — run `write-site-content-tree.mjs` to produce `site-content-tree.json`. Every linked route becomes a Sitecore page item (mimicked or stub). See [site-structure-from-links.md](site-structure-from-links.md).

Example manifest mapping:

| User page | Capture folder | HTML |
|-----------|----------------|------|
| Home | `example-com--home` | `main.html` |
| About | `example-com--about` | `main.html` |
| Contact | `example-com--contact` | `main.html` |

If HTML missing for a page, run:

```bash
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/fetch-html.mjs \
  --urls "https://example.com/about" \
  --out "./design-screenshots/example-com"
```

---

## Asset download

From HTML `src`, `href`, `srcset`:

- Resolve relative URLs with origin from `source-url.txt`
- Follow [media-orchestration.md](../sitecore-component-from-design/references/media-orchestration.md) → [`sitecore-media-from-url-yaml`](../../../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md)

---

## Internal link harvest (site content tree)

After chrome section HTML exists, extract same-origin page links for the Sitecore content tree:

| Source | Typical links |
|--------|----------------|
| `sections/header/section.html` | Logo home, utility nav |
| `sections/navigation/section.html` | Primary nav items |
| `sections/footer/section.html` | Event links, legal, contact |
| Link-list sections | Column links |
| `{page-slug}/page.html` | In-content cross-links |

Run:

```bash
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/write-site-content-tree.mjs \
  --project "./design-screenshots/{domain}" \
  --site-content-path "/sitecore/content/{collection}/{sitename}"
```

Output: `site-content-tree.json` — consumed in Phase 4f to create **stub** page YAML for routes not fully mimicked. See [site-structure-from-links.md](site-structure-from-links.md).

---

## Do not

- Implement components from HTML alone without checking screenshot layout
- Assume every `div` is a separate component — group by visual band
- Ignore duplicate chrome — Header/Footer typically once per site, not per page
