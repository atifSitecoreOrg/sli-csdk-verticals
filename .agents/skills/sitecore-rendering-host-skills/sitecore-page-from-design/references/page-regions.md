# Page region catalog

Use this catalog when decomposing a full-page screenshot. **Only include regions that are actually visible** in the upload — most pages use a subset, not the full stack below.

Mark each candidate as: **Present** | **Absent** | **Unclear** (ask user).

---

## Layout chrome (often shared across pages)

| Region | Component type | Visual signals | Placeholders | Usually on |
|--------|----------------|----------------|--------------|------------|
| **Top bar** | `TopBar` | Thin strip above header — promo, utilities, search/support shortcuts | Rarely | Campaign / corporate sites |
| **Header** | `Header` | Top bar, logo, primary nav, utility links, mobile menu | `header-nav-{*}` (required) | Every page |
| **Header auth** | `Header` (auth-aware) | Login, Sign in, Join, Register, avatar, profile name in header | — | Member portals, B2B sites |
| **Announcement bar** | `{Name}AnnouncementSection` | Thin full-width strip above header (promo, alert) | Rare | Campaign pages |
| **Breadcrumb** | `Breadcrumb` | Horizontal trail: Home › Section › Page | No | Inner pages, not always home |
| **Footer** | `Footer` | Bottom multi-column links, legal, social, newsletter | `footer-links-{*}`, `footer-social-{*}` | Every page |
| **Cookie banner** | `{Name}CookieBanner` or `{Name}CookieConsent` | Sticky bar at bottom (or top); policy text + Accept / Manage / Reject; overlays content until dismissed | No | Many sites; often **missing from screenshot** if already accepted |
| **Sticky navigation** | `Navigation` or `Header` | Top nav bar with `position: fixed/sticky`; stays visible while scrolling; overlays heroes and content bands | `header-nav-{*}` when part of Header | Most marketing sites |

### Cookie banner notes

- Visually **fixed/sticky** at the bottom edge is most common; sometimes top or centered modal.
- Often **not visible** in screenshots captured after consent — mark **Absent** or **Unclear** and ask: *Should we include a cookie consent component for this site?*
- Typically a **layout-level** component (partial design / site settings), not per-page — implement once and reuse.
- Fields: message (Rich Text or Multi-Line Text), Accept button label, Reject/Manage labels, Privacy Policy link, optional cookie policy link.
- Usually `'use client'` — dismiss state via cookie/localStorage; hide after accept (still authorable in editing mode).
- Does not replace Footer; it floats above it until accepted.

### Sticky navigation notes

- **Fixed/sticky** top nav is common on scroll — it overlays page content in full-page screenshots.
- [`url-screenshots`](../../../mimic-website-skills/url-screenshots/SKILL.md) captures sticky nav **before** hiding it, then hides it before section discovery so content crops are clean.
- Use the pre-hide crop (`sections/navigation/` or `sections/header/`) for nav chrome styling; use post-hide section crops for heroes and content bands.
- If nav is a child of Header partial design, implement as `Navigation` inside the Header placeholder — do not duplicate as a separate page section.
- See [sticky-navigation.md](../../../mimic-website-skills/url-screenshots/references/sticky-navigation.md).

---

## Hero & above-the-fold

| Region | Component type | Visual signals | Placeholders |
|--------|----------------|----------------|--------------|
| **Hero banner** | `{Topic}HeroSection` or `{Topic}HeroBanner` | Full-bleed image/video, large H1, primary CTA | Optional CTA cards |
| **Page title band** | `{Name}PageTitleSection` | Shorter title strip without full hero imagery | No |
| **Intro / lead** | `{Name}IntroSection` | Short paragraph under title, no card grid | No |

---

## Main content bands

| Region | Component type | Visual signals | Placeholders |
|--------|----------------|----------------|--------------|
| **Feature / split** | `{Name}FeatureSection` | Two-column image + copy | Optional |
| **Stats / metrics** | `{Name}StatsSection` | Numbers + labels in a row | `{name}Cards-{*}` → StatCard |
| **Card grid** | `{Name}GridSection` | Equal tiles in 2–4 columns | `{name}Cards-{*}` → Card |
| **Carousel band** | `{Name}Section` (use **Carousel** variant) | Horizontal scroll, dots, peek slides | `{name}Cards-{*}` → Card |
| **Testimonials** | `{Name}TestimonialsSection` | Quotes, avatars, stars | quote cards placeholder |
| **Logo strip** | `{Name}LogoStripSection` | Partner/client logos in a row | logo items placeholder |
| **Rich content** | `{Name}ContentSection` | Long-form text, embedded media | Optional |
| **FAQ / accordion** | `{Name}FaqSection` | Expandable Q&A list | FaqItem cards |
| **Tabs** | `{Name}TabsSection` | Tab labels switching panels | tab panel placeholder |
| **CTA band** | `{Name}CtaSection` | Contrasting full-width call-to-action | Optional |
| **Form / signup** | `{Name}FormSection` | Email capture, contact fields | No (fields on section) |
| **Register / join** | `{Name}RegisterSection` | Create-account form (name, email, password, terms) | No — use [`sitecore-auth0-authentication`](../../../sitecore-auth0-authentication/SKILL.md) |
| **Profile / account** | `{Name}ProfileSection` | Edit account, preferences, logout | No — route `/profile` by default |
| **Map / location** | `{Name}MapSection` | Embedded map + address fields | No |
| **Search results** | `SearchExperience` | Search input, result cards/rows, pagination or load more | No — use [`sitecore-search-experience`](../../sitecore-search-experience/SKILL.md). **Requires App Router host** with next-intl.

---

## Layout with sidebar

| Region | Component type | Visual signals | Placeholders |
|--------|----------------|----------------|--------------|
| **Two-column shell** | `{Name}SectionWrapper` or column splitter | Main + narrow sidebar | `main-{*}`, `sidebar-{*}` |
| **Sidebar nav** | `{Name}SidebarNav` | Vertical in-page links, TOC | nav links placeholder |
| **Sidebar promo** | `{Name}SidebarCard` | Single promo box in sidebar | No |
| **Sticky sidebar** | Same as sidebar | Sidebar stays visible on scroll | Same |

When sidebar is present, the page manifest should list **wrapper + sidebar content components**, not only stacked full-width sections.

---

## Nested items (inside section placeholders)

| Region | Component type | Parent |
|--------|----------------|--------|
| **Card / tile** | `{Item}Card` | Grid or Carousel section |
| **Stat item** | `{Item}StatCard` | Stats section |
| **Testimonial** | `{Item}TestimonialCard` | Testimonials section |
| **Nav link** | `NavLink` | Header / sidebar |
| **Link list** | `LinkList` | Footer columns |

---

## Example manifests (not every page has all rows)

### Marketing home (subset)

| # | Region | Present? |
|---|--------|----------|
| 1 | Header | ✓ |
| 2 | HeroBanner | ✓ |
| 3 | FeatureSection | ✓ |
| 4 | StatsSection + StatCard | ✓ |
| 5 | CtaSection | ✓ |
| 6 | Footer | ✓ |
| — | Breadcrumb | ✗ |
| — | Sidebar | ✗ |
| ? | CookieBanner | ? (often not in screenshot — ask user) |

### Article / detail page (subset)

| # | Region | Present? |
|---|--------|----------|
| 1 | Header | ✓ |
| 2 | Breadcrumb | ✓ |
| 3 | PageTitleSection | ✓ |
| 4 | ContentSection (body) | ✓ |
| 5 | RelatedArticlesSection + ArticleCard | ✓ |
| 6 | Footer | ✓ |
| — | HeroBanner | ✗ |

### Docs-style with sidebar

| # | Region | Present? |
|---|--------|----------|
| 1 | Header | ✓ |
| 2 | Breadcrumb | ✓ |
| 3 | SectionWrapper | ✓ |
| 4 | SidebarNav (in sidebar placeholder) | ✓ |
| 5 | ContentSection (in main placeholder) | ✓ |
| 6 | Footer | ✓ |

---

## Detection tips

- **HTML landmarks:** `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `[aria-label="breadcrumb"]`, elements with `cookie`, `consent`, `gdpr` in id/class/role
- **Auth UI:** buttons/links labeled Login, Sign in, Join, Register, Create account, Profile, My account, avatar menu — mark Header auth **Present** and run Auth0 + identity event skills
- **Search UI:** search input with results list/grid, “Search results”, `/search` route, magnifying glass in header with query param — mark Search **Present** and run [`sitecore-search-experience`](../../sitecore-search-experience/SKILL.md). Host must be **App Router** with next-intl.
- **Cookie banner:** fixed/sticky bottom bar with Accept + policy link; **often missing from screenshots** taken after consent — check HTML for `#cookie`, `[data-cookie]`, OneTrust/Cookiebot patterns, or ask user
- **Hero vs page title:** hero = large imagery + dominant CTA; page title = text band only
- **Carousel vs grid:** dots/arrows/peek slides → plan **Carousel** section variant; uniform grid → **Default** variant
- **Composite hero band:** `.owl-carousel` + `.panels-hero-panels` in one crop → decompose to carousel + link grid + stats bar; do not treat as a single link grid — [composite-hero-band.md](../../sitecore-section-decomposition/references/composite-hero-band.md)
- **Full-bleed hero slides** with `background-image` → `FullBleedHeroCarouselSection` + `HeroSlideCard` (**Image** field), not `FeatureCarouselCard`
- **Sidebar:** main content width < ~70% with persistent right/left column

---

## Implementation order (when present)

1. Header, Footer, Announcement, CookieBanner (layout-level)
2. Breadcrumb, SectionWrapper (page shell)
3. Hero / PageTitle (top of main)
4. Main sections top → bottom
5. Card components (before page YAML if used in placeholders)
6. Sidebar components
7. Page assembly YAML

See also [page-decomposition.md](page-decomposition.md).
