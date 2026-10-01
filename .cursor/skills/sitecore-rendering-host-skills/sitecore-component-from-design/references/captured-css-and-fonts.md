# Captured CSS and fonts — port the design system, do not simplify

**Primary success criterion:** components render **exactly** like section PNGs. A simplified “brand token” stylesheet that approximates colors but drops layout classes, clip-paths, and icon fonts will fail visual QA.

---

## CSS authority order

| Priority | Source | Use |
|----------|--------|-----|
| 1 | Section PNGs | Layout, spacing, colors, typography, icons visible |
| 2 | `section.html` class names | Wrapper structure and **exact** class strings for TSX |
| 3 | Page HTML / extracted CSS (`page.html`, `design-screenshots/{site}/css/`) | Rules for classes used in `section.html` |
| 4 | `site-summary.json` → `colors` | CSS custom properties (`--brand-*`) |
| 5 | Project shorthand tokens (`--rai-*`) | **Supplement only** — never replace captured classes |

**Do not** invent a new BEM block (e.g. `.rai-footer__grid`) when `section.html` already defines `grid grid-cols-12`, `bg-brand-footer-about-bg`, `btn-footer-solid`, etc.

---

## Porting workflow

1. Open `section.html` → list every class on the root wrapper and key inner nodes.
2. Copy those class strings **verbatim** onto TSX nodes (with SDK field components inside).
3. Grep page HTML or site CSS for rules matching those classes:
   - `btn-footer-solid`, `footer-two-column-clip-path`, `rounded-section-top-right`
   - `text-brand-*`, `bg-brand-*`
   - Tailwind-like utilities (`grid-cols-12`, `col-span-12`, `lg:col-span-4`) — implement in shared stylesheet if not using Tailwind
4. Port `:root` / `--brand-*` variables from captured CSS into `{host}/src/assets/styles/{site}.css`.
5. Compare live render to **all three** section PNGs — fix missing rules before marking done.

### Anti-patterns

| Wrong | Right |
|-------|-------|
| Single `--rai-footer-bg` + generic flex grid | Port `--brand-footer-about-bg`, `--brand-footer-copyright-bg`, `--brand-primary-1` |
| Purple contact panel when PNG shows magenta (`#e50040`) | Use captured `--brand-primary-1` |
| Skip `clip-path` on contact panel | Port `.footer-two-column-clip-path` |
| Omit utility classes; restructure with custom BEM | Keep captured class names on same DOM shape |

---

## Fonts and icon fonts (required)

Read `design-screenshots/{project}/site-summary.json` → `fonts[]` **before** implementing any component.

For each detected font entry:

| Detection | Action in editing host |
|-----------|------------------------|
| `Roboto`, `RobotoBold`, brand sans | Add `@import` or `<link>` for Roboto (400/700); set `font-family` on `body` matching capture |
| `Font Awesome Kit` | Add kit script from page HTML (e.g. `https://kit.fontawesome.com/…js`) in `Scripts.tsx` or `_document` |
| Custom host (e.g. `fonts.raicore.com`) | Grep `page.html` for script/link URLs; wire the same URLs |

### CSS `@import` placement (Next.js / PostCSS — mandatory)

When loading web fonts via `@import url('…')` inside a project stylesheet (e.g. `{host}/src/assets/styles/{site}.css` imported from `_app.tsx`):

**`@import` must be the first rules in the file** — only `@charset` and `@layer` may precede it. Any `:root`, `*`, or other selector before an `@import` causes PostCSS to fail at build/render time.

| Wrong | Right |
|-------|-------|
| `:root { … }` then `@import url('https://fonts.googleapis.com/…')` | `@import url('https://fonts.googleapis.com/…')` then `:root { … }` |
| `@import` mid-file after ported utility classes | All `@import` lines at top of file, before any other rules |

**Symptom when wrong:** Next.js returns **500** on `/` and `/api/editing/render` with:

```text
Parsing CSS source code failed
@import rules must precede all rules aside from @charset and @layer statements
```

This looks like a routing or Sitecore error but is a **CSS compile failure** — check the dev server log for the `.css` file and line number.

**Preferred patterns (pick one per font):**

1. **`@import` at top of site stylesheet** (common for Google Fonts):

```css
/* {site}.css — line 1 after optional file comment */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

:root {
  /* brand variables */
}
```

2. **`<link>` in `Scripts.tsx` or `_document.tsx`** — avoids `@import` ordering; use when fonts are shared across multiple CSS entry points or when kit URLs come from capture.

3. **`next/font/google`** in `_app.tsx` — optional for Google Fonts; assign `className` on `<body>` or a wrapper.

**Do not** append `@import` at the end of a porting session after `:root` and component rules are already written — always insert new font imports at the **top** of the stylesheet.

**Icons in `section.html` are not optional decoration.** If the PNG shows arrow icons on footer links, phone/messages/location icons in contact, or social brand icons:

- TSX must render matching `<i class="fa-…">` nodes (or equivalent) from `section.html`
- Font Awesome kit (or captured icon font) must be loaded — otherwise icons are invisible and fidelity fails

### Verification

- [ ] `site-summary.json` fonts wired in editing host
- [ ] Web font `@import` lines are **first** in the site stylesheet (before `:root` and all other rules) — or fonts loaded via `<link>` / `next/font`
- [ ] Icon classes from `section.html` present in TSX
- [ ] Computed `font-family` on body matches capture
- [ ] No missing icons when comparing to PNG

---

## When captured site uses Tailwind-style utilities

Many headless sites ship utility classes without Tailwind in the rendering host. For each utility class used in TSX:

- Add a matching rule in the project stylesheet, **or**
- Confirm an existing global utility block covers it

Minimum set for grid footers: `.grid`, `.grid-cols-12`, `.col-span-12`, `.lg:col-span-4`, flex/gap/padding utilities used in `section.html`.

---

## Checklist (every component)

- [ ] TSX class names match `section.html` (not a simplified alias)
- [ ] CSS rules ported for every non-standard class
- [ ] Brand CSS variables from capture in `:root`
- [ ] Fonts from `site-summary.json` loaded (`@import` at **top** of CSS file if using `@import` — see [captured-css-and-fonts.md](captured-css-and-fonts.md#css-import-placement-nextjs--postcss--mandatory))
- [ ] Icon font kit loaded when `section.html` uses `fa-*` classes
- [ ] Section PNGs match at desktop, tablet, mobile
