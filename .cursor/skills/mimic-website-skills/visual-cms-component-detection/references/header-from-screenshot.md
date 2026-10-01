# Header detection — screenshot-first (never generic)

Apply when the header band appears in desktop/tablet/mobile section PNGs or in `sections/header/`.

**Primary input:** header section PNGs — **not** a generic “Header + flat Navigation fields” template from JM2/JM3.

---

## Rule: never default to generic header patterns

| Forbidden without screenshot evidence | Why |
|---------------------------------------|-----|
| Header with logo + `<ul>` text links only | Misses utility icon column (FAQ, Contact, Search, …) |
| Navigation as flat `NavLink1`–`NavLink4` + `UtilityLink1`–`UtilityLink4` text fields | Utility row is **icon + label** columns, not plain text links |
| Burger menu `☰` character instead of Font Awesome `fa-bars` | PNG shows icon font |
| Custom BEM (`.rai-header__bar`) without captured classes | Must port `section.html` utilities and `--brand-*` / `--main-nav-*` tokens |
| Main nav + utility baked into Header TSX with no placeholders | Navigation belongs in `header-nav` placeholder; utility icons in nested placeholder |

**If the screenshot shows a different layout, the detection plan must describe that layout — not a reusable template from another site.**

---

## Visual analysis checklist (desktop PNG first)

Open `header-desktop.png` and label regions left → right:

1. **Logo** — linked image, max width/height
2. **Primary nav** — uppercase labels, dropdown chevrons (Visiting, Exhibiting, Organising, About us)
3. **Utility icon links** — vertical stack: icon above uppercase label (FAQ, Contact, Careers, Search, English/globe)
4. **Language control** — globe icon + “English” with dropdown (may be last utility item)

Tablet/mobile PNGs:

- Collapsed bar: logo + burger icon
- Full-screen drawer: stacked nav items + utility links with icons (horizontal icon+text on mobile)

---

## Component model from screenshot (RAI Amsterdam example)

When the PNG matches this pattern:

```
[ Logo | Primary nav (dropdown buttons) | spacer | FAQ | Contact | Careers | Search | English ]
```

| Correct detection | Wrong detection |
|-------------------|-----------------|
| **Header** with `header-nav` placeholder → **Navigation** child | All nav markup hardcoded in Header |
| **Navigation** with main nav fields + **`header-utility` placeholder** | `UtilityLink1`–`UtilityLink4` text-only fields |
| **HeaderIconLink** child (one per utility item) | Single Navigation datasource with utility link fields |
| Main nav: `NavLink1`–`NavLink4` (dropdown buttons with chevron) | Generic `<a>` list without chevron |
| HeaderIconLink fields: `Link`, `IconClass`, optional `DropdownLink1`/`DropdownLink2` for language | Plain General Link without icon class |

**Partial design wiring:**

```
Header (DynamicPlaceholderId=1)
  ├── Navigation @ header-nav-1
  └── HeaderIconLink × N @ header-utility-1   ← on Header, not nested under Navigation
```

See [header-navigation/SKILL.md](../../../sitecore-rendering-host-skills/header-navigation/SKILL.md) for industry-verticals baseline (Navigation SAI, IconLinkList GraphQL, Breadcrumb query).

---

## HeaderIconLink (repeating utility pattern)

When **2+ utility items** share the same structure (icon above uppercase label):

- Create **`HeaderIconLink`** (or `{Site}IconLink`) rendering
- Place via **`header-utility-{DynamicPlaceholderId}`** on Navigation
- Each child datasource: `Link` + `IconClass` (Font Awesome classes from `section.html`)
- Language item: add `DropdownLink1`, `DropdownLink2` when PNG shows globe + menu
- **`hasLink` guard must accept internal links** — Sitecore internal links use `url`/`id`, not `href`; never return empty from `HeaderIconLink` when only `url` is set

See [repeated-pattern-placeholders.md](../../../sitecore-rendering-host-skills/sitecore-component-from-design/references/repeated-pattern-placeholders.md).

---

## Validate against `section.html` (after visual plan)

- Copy wrapper/class structure verbatim (`sticky top-0`, `bg-[var(--main-nav-secondary)]`, `font-brand-font-family-nav-main-link`, etc.)
- Extract icon classes: `fa-duotone fa-light fa-messages-question`, `fa-regular fa-globe`, …
- Desktop vs mobile: note `min-[1276px]:block`, `xl:hidden`, drawer `-translate-x-full`
- If HTML and PNG disagree on structure, **PNG wins**; HTML supplies classes, copy, hrefs

---

## `section-plan.json` output

When writing or correcting `sections/header/section-plan.json`:

- `Header` → placeholder `header-nav` → `Navigation`
- `Navigation` → placeholder `header-utility` → `HeaderIconLink`
- Remove flat `UtilityLink*` fields when icon-link placeholder is used
- `narrativeSummary` describes logo + primary nav + icon utility row from PNG
- Set `detection.source: "visual"` when overriding a generic DOM template

---

## Verification before approval

- [ ] Header PNG shows utility icon column (not just text links)
- [ ] Plan includes Navigation in Header placeholder (**one** placeholder call in Header TSX)
- [ ] Plan includes HeaderIconLink for repeating utility items
- [ ] Breakpoint documented from `section.html` (single value for desktop/mobile split)
- [ ] Partial design wiring: Navigation `DynamicPlaceholderId=1` + HeaderIconLink @ `header-utility-1`
- [ ] Main nav shows dropdown chevrons if PNG shows chevrons
- [ ] Mobile PNG reviewed for burger + drawer layout
- [ ] Icon fonts noted in plan when PNG shows icons

See [header-responsive-chrome.md](header-responsive-chrome.md).
