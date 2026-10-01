# Header navigation — industry-verticals baseline

Use when building or fixing **Header**, **Navigation**, **utility icon links**, or **Breadcrumb** in a rendering host. Reference implementations are vendored under `references/industry-verticals/` so the skill works even when `industry-verticals/` is not in the project.

---

## Critical rules

### 1. Never mount the same placeholder twice

**Forbidden:** calling `<Placeholder name="header-utility-1" />` (or any placeholder key) in both a desktop region and a mobile drawer inside the same component tree.

**Why:** Sitecore renders the full placeholder child tree per mount → duplicate components, React key warnings in edit mode, broken chromes.

**Required pattern:** one DOM home for each placeholder key. Responsive layout is CSS on that single mount:

```
Header
  site-header__panel          ← one panel; CSS switches bar vs full-screen drawer
    Placeholder header-nav-1  ← once
    Placeholder header-utility-1  ← once
```

Do **not** follow the travel `Header.tsx` anti-pattern of repeating `header-nav` / `header-right` inside the mobile drawer when a single responsive panel can hold both.

**Header search overlay (Legal):** keep the magnifying glass in Header; implement results in `src/lib/HeaderSearch.tsx` (not under `src/components/` — generate-map would register it). Reuse the site search catalog so the overlay mocks `/search` cards, then submit to `?q=`. See [`legal-pinsent`](../../legal-pinsent/SKILL.md).

### 2. Navigation — start from industry-verticals travel

| Artifact | Reference copy |
|----------|----------------|
| TSX | [references/industry-verticals/Navigation.tsx](references/industry-verticals/Navigation.tsx) |
| Nav helpers | [references/industry-verticals/navHelpers.tsx](references/industry-verticals/navHelpers.tsx) |
| Rendering YAML | [references/industry-verticals/Navigation.yml](references/industry-verticals/Navigation.yml) |

**SAI / nav tree:** Navigation items come from the **Rendering Contents Resolver** (`B28B1B20-953B-4BFF-925A-9AE48CA00CDC`), not flat `NavLink1`–`NavLink4` fields. Fields shape:

```typescript
fields: Record<string, NavItemFields>; // Id, DisplayName, Title, NavigationTitle, Href, Children, Styles
```

Use `prepareFields`, `isNavRootItem`, `isNavLevel`, `getLinkField`, `getLinkContent` from `navHelpers`.

Adapt styling to screenshot/`section.html`; keep the **data contract** and resolver wiring.

### 3. Utility icons — IconLinkList (GraphQL), not repeated placeholder children

| Artifact | Reference copy |
|----------|----------------|
| TSX | [references/industry-verticals/IconLinkList.tsx](references/industry-verticals/IconLinkList.tsx) |
| Rendering YAML | [references/industry-verticals/IconLinkList.yml](references/industry-verticals/IconLinkList.yml) |
| Templates | [references/industry-verticals/IconLinkList-templates/](references/industry-verticals/IconLinkList-templates/) |

**Datasource:** `IconLink Folder` with `IconLink` children; **ComponentQuery** loads `link`, `iconName`, `iconImage` via GraphQL.

Wire as **one** rendering on `header-utility-{id}` (Header placeholder), not N separate placeholder children under Navigation.

For Font Awesome sites (RAI), adapt `ListItem` to render `iconName` / custom icon class instead of Lucide.

### 4. Breadcrumb — GraphQL ancestors query

| Artifact | Reference copy |
|----------|----------------|
| TSX | [references/industry-verticals/Breadcrumb.tsx](references/industry-verticals/Breadcrumb.tsx) |
| Rendering YAML | [references/industry-verticals/Breadcrumb.yml](references/industry-verticals/Breadcrumb.yml) |

Uses **ComponentQuery** on `$contextItem` with `ancestors(hasLayout: true)` and `NavigationFilter` param — not client-side pathname guessing.

---

## Header architecture (required)

```
Header (logo once, burger on mobile)
  └── site-header__panel (single mount region)
        ├── Placeholder header-nav-{id}  → Navigation (SAI nav tree)
        └── Placeholder header-utility-{id}  → IconLinkList or HeaderIconLink × N
```

| Component | Owns |
|-----------|------|
| **Header** | Logo, burger, panel open state, body scroll lock, **both** placeholders (once each) |
| **Navigation** | Main nav markup only (desktop row + mobile list from same fields) — **no** utility placeholder, **no** drawer portal |
| **IconLinkList / HeaderIconLink** | Utility column / drawer utility row |

### Placeholder keys

```typescript
dynamicPlaceholderKey('header-nav', params);     // → header-nav-1
dynamicPlaceholderKey('header-utility', params); // → header-utility-1
```

Default id **`1`** when `DynamicPlaceholderId` is missing (chrome partial designs).

### Partial design wiring (example)

```xml
Header @ headless-header (DynamicPlaceholderId=1)
Navigation @ /headless-header/header-nav-1
HeaderIconLink × N @ /headless-header/header-utility-1
```

---

## Authoring YAML checklist

- [ ] `Navigation.yml`: `Rendering Contents Resolver` = `{B28B1B20-953B-4BFF-925A-9AE48CA00CDC}`; **no** nested `header-utility` on Navigation when utility is on Header
- [ ] `IconLinkList.yml`: `ComponentQuery`, `Datasource Template`, `Datasource Location`, `IsRenderingsWithDynamicPlaceholders=true` when used
- [ ] `Breadcrumb.yml`: `ComponentQuery` with ancestors + `NavigationFilter`
- [ ] Header rendering `Placeholders` includes **both** `header-nav` and `header-utility` settings
- [ ] Partial design: utility children under `/headless-header/header-utility-1`, not under `header-nav-1`

---

## Search in header

When the design includes a **search icon** or expandable search panel that submits to a results page:

1. Target host must be **App Router** with next-intl — see [app-router-next-intl.md](../search-experience/references/app-router-next-intl.md)
2. Run [`search-experience`](../search-experience/SKILL.md) for `{{hostRoot}}`, `{{componentNamespace}}`
3. Wire header search to `/search?q=` (or Sitecore search page link field)

---

## Cross-references

- Screenshot detection: [header-from-screenshot.md](../../mimic-website-skills/visual-cms-component-detection/references/header-from-screenshot.md)
- Responsive chrome: [header-responsive-chrome.md](../../mimic-website-skills/visual-cms-component-detection/references/header-responsive-chrome.md)
- Repeated patterns: [repeated-pattern-placeholders.md](../sitecore-component-from-design/references/repeated-pattern-placeholders.md)
- Search results page: [search-experience](../search-experience/SKILL.md)
