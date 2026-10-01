# Homepage authoring (mimicked `/` route)

When the mimicked reference URL is the **site homepage** (pathname `/`, `/en`, or equivalent root), page components and `__Renderings` belong on the **existing `Home` item** created by site scaffold — **not** on a nested `Home/Home` child.

---

## Rule

| Mimicked URL | YAML file | Sitecore `Path` | `StartItem` |
|--------------|-----------|-----------------|-------------|
| `/` (homepage) | `{siteContentPath}/Home.yml` | `…/Home` | **Same item ID as `Home.yml`** |
| `/calendar` | `{siteContentPath}/Home/Calendar.yml` | `…/Home/Calendar` | — |
| `/about/team` | `{siteContentPath}/Home/About/Team.yml` | `…/Home/About/Team` | — |

**Do not create** `{siteContentPath}/Home/Home.yml` or `Path: "…/Home/Home"` for the homepage.

---

## Why

1. **Site generator** creates `Home` and sets **Start Item** → `Home` in Site Grouping.
2. **Route `/`** resolves to Start Item. If renderings live on a child `Home/Home`, the homepage renders empty chrome only.
3. **JM3 pattern** — `Complete-Jm3Authoring.mjs` writes homepage `__Renderings` directly to `Home.yml` using the scaffold `Home` item ID.

---

## Authoring script pattern

For homepage (`/`):

```javascript
// ✅ Correct — reuse scaffold Home item ID (read from Home.yml or site generator)
await writeYaml(`${SITE_REL}/Home.yml`, `---
ID: "${HOME_ID}"
Parent: "${SITE_ID}"
Path: "${SITE_PATH}/Home"
SharedFields:
- ID: "f1a1fe9e-a60c-4ddb-a3a0-bb5b29fe732e"
  Hint: __Renderings
  Value: |
${homeRenderingsXml}
...
`);

// ❌ Wrong — nested duplicate homepage
await writePageYaml('Home.yml', 'Home', HOME_ID, newPageId, 'Home', homeRenderingsXml);
// → creates …/Home/Home.yml
```

For non-home pages, use `{siteContentPath}/Home/{Page Name}.yml` with `Parent: "{HOME_ID}"`.

**Never** change `StartItem` to point at a nested homepage child. Leave it on the scaffold `Home` item.

---

## Detection during mimic

Treat a captured URL as the **homepage** when:

- Pathname is `/` or language root only (`/en`, `/nl`) with no further segments
- It is the first / primary URL in the mimic brief and matches the site root in `site-summary.json`

In `page-decomposition.json`, set the homepage slug's target path to `Home` (not `Home/Home`).

---

## Verification checklist

- [ ] `{siteContentPath}/Home.yml` contains `__Renderings` for homepage sections
- [ ] No `{siteContentPath}/Home/Home.yml` exists
- [ ] Site Grouping `StartItem` GUID equals `Home.yml` `ID`
- [ ] Edge / editing host `/` route shows homepage components (not empty `headless-main`)

See also [page-decomposition.md — Page content tree](page-decomposition.md#page-content-tree).
