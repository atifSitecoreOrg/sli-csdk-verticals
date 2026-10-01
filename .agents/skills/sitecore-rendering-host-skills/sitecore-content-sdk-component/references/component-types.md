# Component type conventions

Use these naming and structural rules in every project. Adjust `{Prefix}` only when the app uses a consistent namespace (discover from existing `src/components/` files).

## Type matrix

| Type | Name pattern | TSX suffix | Placeholders | Typical parent |
|------|--------------|------------|--------------|----------------|
| Chrome (once per page / layout) | `{Prefix}Header`, `{Prefix}Footer`, `{Prefix}Breadcrumb`, `{Prefix}CookieBanner` | Header, Footer, Breadcrumb, CookieBanner | Header: nav; Footer: link columns | Layout / partial design |
| Full-width block | `{Prefix}{Name}Section` | `Section` | Optional child card areas | Page main placeholder |
| Nested item | `{Prefix}{Name}Card` | `Card` | Rarely | Section placeholder |
| Utility | `{Prefix}{Name}` | none | As needed | Any |

## Chrome components

### Header

- Must include at least one `<Placeholder>` for primary navigation (e.g. `header-nav-{DynamicPlaceholderId}`).
- Fields: logo (Image + Link), utility links, CTA labels, menu open/close text.
- Usually `'use client'` (mobile menu state).

### Footer

- Fields: copyright, legal links, social links, newsletter labels.
- Placeholders for link lists or columns (e.g. `footer-links-{DynamicPlaceholderId}`, `footer-social-{DynamicPlaceholderId}`).
- Allowed controls on placeholder settings: LinkList, NavLink, Card as appropriate.

### Breadcrumb

- Often minimal datasource (root label, separator text) or route-driven.
- No placeholders unless design shows nested slots.
- **Absent on many home/landing pages** — only add when visible in screenshot.

### HeroBanner

- Full-bleed `{Topic}HeroSection` / `{Topic}HeroBanner` — distinct from narrow `PageTitleSection`.
- Not every page has a hero; do not conflate with generic content sections.

### CookieBanner

- Sticky/fixed bar until user accepts cookies; overlays page content.
- Fields: consent message, Accept label, Privacy Policy link (General Link).
- `'use client'` — Accept button dismisses (localStorage/cookie); hidden until storage cleared.
- **Wire on Partial Design** (with Header/Footer), not on page `headless-main` — so Accept is clickable in Pages Builder. Add `headless-cookie` placeholder in `Layout.tsx`, `Partial Designs/Cookie`, `Placeholder Settings/Partial Design/Cookie` (`sxa-cookie`), include in Page Design `PartialDesigns`.
- No placeholders unless design shows embedded preference centre.

### Carousels

- Prefer **Embla Carousel** (`embla-carousel-react`) when screenshots require slider behavior.
- Slide/card items come from Sitecore `<Placeholder>` children; never hardcode slide markup.
- Disable autoplay in editing mode; respect `prefers-reduced-motion`.
- **SSR / hydration:** On server and first client paint, render a static slide track first. Initialize carousel controls after client mount and outside editing mode to avoid hydration mismatches.
- **`renderEach` keys:** prefix keys when multiple sibling `<Placeholder>` share a parent (`cards-${index}`, `stats-${index}`) — [placeholder-layout.md](placeholder-layout.md#react-keys--rendereach-and-sibling-placeholders).

## Section components

- Desktop = full viewport width band (hero, feature grid, stats, CTA band).
- Map every visible string, link, and image to Sitecore fields — no hardcoded marketing copy in TSX.
- Use `<Placeholder>` when design shows repeating child tiles/cards.
- Placeholder key pattern: `{semanticName}-{DynamicPlaceholderId}` (e.g. `statsCards-{DynamicPlaceholderId}`).
- **With placeholder:** implement carousel/grid behavior in **`Default`** (see below).

### SectionWrapper / sidebar

- Use when design has main column + sidebar (docs, articles, filters).
- Two placeholders: `main-{DynamicPlaceholderId}`, `sidebar-{DynamicPlaceholderId}`.
- Treat as a Section-type component for variant rules if it hosts card placeholders in either column.

## Card components

- Placed inside a Section placeholder, not directly on page root.
- Smaller field set (title, body, image, link, badge, etc.).
- Keep TSX presentational; parent Section owns layout grid.

## Required variants

See **[component-variants.md](component-variants.md)** for the full rules. Summary:

| Export | When |
|--------|------|
| `Default` | Always |
| `Inversed` | Only when layout can mirror left ↔ right — **omit** TSX + YAML otherwise |
| `ImageTop` / `ImageBottom` | Component has an **Image** field in layout (stacked media) |
| `Animated` | Always — viewport-once entrance per inner element (`AnimateIn`) |
| `Carousel` | Section with `<Placeholder>`, **not** already a carousel component |

**Do not** create `InversedAnimated`.

### Section components **with** `<Placeholder>`

- **Default** = grid/stack of placeholder children.
- **Carousel** = same children in Embla slider (`PlaceholderCarousel` helper).
- Dedicated carousel sections (`EyebrowTitleCarouselSection`, `CompositeHeroBandSection`) use carousel in **Default** only — no separate `Carousel` export.

Set rendering **Placeholders** (Layout Service Placeholders) to project placeholder-setting GUID(s).

### Carousel in `Default` — implementation notes

- Slides come from `<Placeholder>` children — one Sitecore rendering per slide; do not hardcode slide count.
- Child Card components render once in Sitecore; Embla controls visibility/scroll after client mount.
- Add optional Sitecore fields: `PreviousLabel`, `NextLabel`, `GoToSlideLabel` (accessibility).
- Detect editing: `useSitecore()?.page?.mode?.isEditing` — pause autoplay when true.
- Prefer CSS scroll-snap or transform-based track; match project's existing carousel if one exists.
- Card root elements should use a consistent class (e.g. `component card`) for slide counting if needed.

Sections **without** placeholders: do **not** add carousel behavior.

### Section + card placeholders

Parent/child placeholder pattern varies by screenshot. Inspect the provided `section.html` before implementing TSX:

- If cards form a simple list/grid, keep section `Default` as grid and add `Carousel` variant when required.
- If cards are asymmetric/editorial, model exact DOM and spacing as shown, and use `Inversed` only when true mirroring exists.
- If screenshot shows a distinct alternate band composition, add explicit additional variants with generic names tied to layout behavior.

Placeholder wrapper guidance: [placeholder-layout.md](placeholder-layout.md).

## Field mapping rules

1. One Sitecore field per author-editable value (headings, labels, URLs, alt text, rich text blocks).
2. Use SDK field components: `<Text>`, `<RichText>`, `<Image>`, `<Link>` (or `Link as SitecoreLink`).
3. **Field type → SDK component:** match the Sitecore template field type — **Rich Text** fields **must** use `<RichText>` (not `<Text>`, not manual paragraph splitting). Single-Line / Multi-Line Text use `<Text>` (with `tag` when needed). Image → `<Image>` / `FieldImage`. General Link → `<SitecoreLink>`. Using the wrong component breaks inline editing in Pages.
3. **General Link inner markup:** mirror `section.html` link structure (text-only, icon-only, or text+icon). When children are passed to `<SitecoreLink>`, set `showLinkTextWithChildrenPresent` if the captured HTML includes both label and decorator — see [visual-fidelity.md](../../sitecore-component-from-design/references/visual-fidelity.md#general-link-cta-fields--inner-markup-patterns).
4. **One field → one node:** each field binds to at most one visible `<Text>` / `<RichText>` / `<Image>` unless a `u-hide-*` pair — see [Field-to-DOM mapping](../../sitecore-component-from-design/references/visual-fidelity.md#field-to-dom-mapping-one-field-one-node).
5. Provide `defaultFields` in TSX for local dev / Storybook only — production values come from datasource YAML.
6. Image fields: store media in `{mediaInclude}`; reference via Image field value in datasource YAML.
7. Never embed screenshot text in TSX; mirror it in default datasource YAML for authoring seed content.
