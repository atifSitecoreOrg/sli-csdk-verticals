# Header responsive chrome — one placeholder, one breakpoint

Critical rules for Header + Navigation + utility icons. Violations cause **duplicate components**, **React key warnings**, and **missing utility links**.

**Baseline skill:** [header-navigation/SKILL.md](../../../sitecore-rendering-host-skills/header-navigation/SKILL.md) (industry-verticals reference TSX/YAML vendored).

---

## Root causes (RAI lesson)

| Bug | Cause |
|-----|--------|
| Logo + nav appear **twice** | `<Placeholder name={header-nav-…} />` called **twice** (desktop bar + mobile drawer) |
| React key warnings in edit mode | Same placeholder mounted twice (e.g. `header-utility-1` in desktop + mobile drawer) |
| **HeaderIconLink** missing | `header-utility-${DynamicPlaceholderId}` with empty id → `header-utility-` |
| Wrong chrome at tablet width | Header breakpoint `1276px` but Navigation used `769px` — both desktop and mobile visible |

---

## Architecture (required)

```
Header (logo once, burger on mobile)
  └── site-header__panel          ← ONE panel; CSS = inline bar (desktop) or full-screen drawer (mobile)
        ├── Placeholder header-nav-{id}     ← ONCE → Navigation
        └── Placeholder header-utility-{id}   ← ONCE → HeaderIconLink × N or IconLinkList
```

### Never mount the same placeholder twice

**Forbidden:** `<Placeholder name="header-utility-1" />` in both desktop utility row and mobile drawer.

**Required:** one DOM home per placeholder key; responsive layout is CSS on that single mount.

### Header TSX rules

| Rule | Detail |
|------|--------|
| **One nav placeholder** | Single `<Placeholder name={header-nav-…} />` |
| **One utility placeholder** | Single `<Placeholder name={header-utility-…} />` on Header (not Navigation) |
| **Logo once** | One logo node; responsive sizing via CSS |
| **Panel owns mobile drawer** | `site-header__panel` is full-screen overlay on mobile when `.is-menu-open`; inline flex row on desktop |
| **Burger on Header** | Mobile menu toggle lives on Header, not Navigation |

### Navigation TSX rules

| Rule | Detail |
|------|--------|
| **Main nav only** | Desktop row + mobile list from fields; **no** utility placeholder, **no** drawer portal |
| **SAI nav tree** | Start from industry-verticals `Navigation.tsx` + `Rendering Contents Resolver` — see header-navigation skill |
| **Unified breakpoint** | One breakpoint from `section.html` (RAI: **1276px**) |

### Nested placeholder keys

```typescript
dynamicPlaceholderKey('header-nav', params);      // header-nav-1
dynamicPlaceholderKey('header-utility', params);  // header-utility-1
```

Partial design:

```xml
Navigation @ /headless-header/header-nav-1
HeaderIconLink × N @ /headless-header/header-utility-1
```

---

## Authoring verification

- [ ] Header rendering `Placeholders`: `header-nav` + `header-utility`
- [ ] Navigation rendering: **no** nested `header-utility` placeholder
- [ ] Partial design: utility under `/headless-header/header-utility-1`
- [ ] DevTools: no duplicate placeholder mounts; no key warnings from `AppPlaceholder`
- [ ] Desktop PNG: FAQ / Contact / Search / English icons visible
- [ ] Mobile PNG: full-screen white drawer with nav + utility

---

## Skill cross-references

- Baseline: [header-navigation/SKILL.md](../../../sitecore-rendering-host-skills/header-navigation/SKILL.md)
- Detection: [header-from-screenshot.md](header-from-screenshot.md)
- Repeated utility: [repeated-pattern-placeholders.md](../../../sitecore-rendering-host-skills/sitecore-component-from-design/references/repeated-pattern-placeholders.md)
