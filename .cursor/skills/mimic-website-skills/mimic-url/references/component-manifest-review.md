# Phase 4 — Component manifest & user review

Before any TSX or YAML is written, produce a **component manifest** from screenshot + HTML analysis and **stop for user approval**. Implementation starts only after the manifest is accepted or revised.

**Child skill detail:** [`sitecore-page-from-design`](../../../sitecore-rendering-host-skills/sitecore-page-from-design/SKILL.md) Phase 1 (analysis) and Phase 2+ (build).

**Region catalog:** [`page-regions.md`](../../../sitecore-rendering-host-skills/sitecore-page-from-design/references/page-regions.md)

---

## Workflow overview

```
4a Analyze (no code)
    ↓
4b Present manifest + evidence → STOP — wait for user
    ↓
4c Apply feedback → revised manifest (repeat 4b if major changes)
    ↓
4d Reuse audit
    ↓
4e Build components (approved rows only)
    ↓
4f Assemble page YAML (all target pages)
    ↓
4g Validate & push
```

**Hard gate:** Do **not** enter 4e until the user explicitly approves the manifest (or approves a revised version).

---

## 4a — Analyze (no code)

For **each captured page** (each URL / screenshot folder from Phase 3):

1. Read `desktop.png` (primary), `tablet.png`, `mobile.png` when present.
2. Read `page.html`, `main.html`, `source-url.txt` from the capture folder.
3. Walk [page-regions.md](../../../sitecore-rendering-host-skills/sitecore-page-from-design/references/page-regions.md) — mark **Present / Absent / Unclear**.
4. List horizontal **bands** top → bottom for every **Present** region.
5. Propose a **component name** per band (PascalCase, Sitecore `componentName` — e.g. `HeroCarousel`, `NewsBar`).
6. Note **shared vs page-specific** (Header/Footer usually shared; hero often per page).
7. Record **evidence** for every row (see below).

When multiple URLs were captured, produce **one manifest per page** plus a **shared chrome** section (Header, Footer, CookieBanner) that applies site-wide.

---

## Evidence (required per manifest row)

Each row must cite **where** the region was identified so the user can verify or correct.

| Evidence field | What to record | Example |
|----------------|----------------|---------|
| **Page** | Route or page label | `Home`, `/about-us` |
| **Source URL** | From `source-url.txt` | `https://matthey.com/about-us` |
| **Screenshot** | File + visual band | `matthey-com--home/desktop.png` — band 1, top ~0–55% (hero carousel) |
| **HTML** | Landmark, class, or heading | `main.html` — `.matthey--carousel`, `h1.homehero__heading` |
| **Copy snippet** | Short visible text (optional) | `"Metals that matter, for a healthier world"` |

Use **band labels** consistently:

| Band | Typical content |
|------|-----------------|
| `chrome-top` | Announcement, header |
| `above-fold` | Hero, page title band |
| `main-1`, `main-2`, … | Content sections top → bottom |
| `chrome-bottom` | Footer |
| `overlay` | Cookie banner, modals (may be Unclear) |

---

## Manifest table format

Present this table to the user (one table per page, plus shared chrome if applicable):

| ID | Proposed component | Region type | Page | Band | Evidence | Action | Notes |
|----|-------------------|-------------|------|------|----------|--------|-------|
| S1 | Header | Layout chrome | all pages | chrome-top | `desktop.png` top bar; `page.html` `<header role="banner">` | create | partial design |
| S2 | Navigation | Nav (in Header ph) | all pages | chrome-top | `page.html` `#navigation` | reuse | OOTB Navigation in header-nav |
| H1 | HeroCarousel | Hero banner | Home | above-fold | `main.html` `.matthey--carousel` | create | 3 slides |
| H2 | NewsBar | Stats/info strip | Home | main-1 | `main.html` `.hero-panels-panel` ×3 | create | News / ARA / Investors |
| A1 | HeroSection | Hero + stats | About Us | above-fold | `about-us/main.html` `.panels-hero` | create | stats overlay |
| … | … | … | … | … | … | … | … |

**Action column values:**

| Action | Meaning |
|--------|---------|
| **create** | New TSX + YAML |
| **reuse** | Existing component in editing host or serialized renderings |
| **skip** | Detected but user or agent chose not to implement |
| **unclear** | Needs user decision before build |

**Status** (optional column): `Present` | `Absent` | `Unclear`

---

## 4b — Present & wait for user (mandatory stop)

After analysis, send a summary like:

> **Phase 4a complete** — I identified **N** components across **P** page(s).  
> Shared chrome: …  
> Per page: …  
>  
> Please review the manifest below. You can **accept**, **skip** rows, **rename** components, **split** or **merge** bands, **add** missing components, or attach **extra context** (copy, behaviour, variants).

Then paste the full manifest table(s).

### What the user may reply with

| User intent | Example phrasing | Agent action in 4c |
|-------------|------------------|-------------------|
| **Accept all** | "Looks good", "approve", "proceed" | Mark all non-unclear rows approved; go to 4d |
| **Accept subset** | "Skip cookie banner", "don't build NewsBar" | Set Action → `skip` for those rows |
| **Rename** | "Call it JMHero not HeroSection" | Update Proposed component; note in Notes |
| **Split** | "Split hero into carousel + news panels" | Replace one row with two; new IDs |
| **Merge** | "Combine stats and hero into one component" | Merge rows; single component |
| **Add** | "Also need a Breadcrumb on inner pages" | Append row with user-provided context |
| **Reuse** | "Use retail Navigation" | Action → `reuse`; link existing path |
| **Context** | "Hero should autoplay; footer 3 link lists" | Append to Notes; no manifest structure change |
| **Re-analyze** | "You missed the PGM video section" | Re-run 4a for affected page; re-present 4b |

If any row is still **unclear**, resolve with the user before 4e.

Use **AskQuestion** or a clear yes/no prompt when the manifest is large and you need explicit approval — do not assume silence means approval.

---

## 4c — Apply feedback

1. Update manifest rows per user feedback.
2. Show a **diff-style summary**: added / removed / renamed / split / merged.
3. Present the **revised manifest** if changes were non-trivial.
4. Wait for confirmation again when:
   - More than 3 rows changed, or
   - User only gave partial feedback, or
   - Split/merge affects placeholders or page YAML structure

Save the approved manifest in the phase summary (chat) so implementation traceability is clear.

---

## 4d — Reuse audit

Only for manifest rows with Action **create** or **reuse**:

- Search `editing-hosts/{folder}/src/components/`
- Search serialized renderings under the module
- Upgrade Action to **reuse** when ≥80% match; note path in Notes

If reuse replaces create, tell the user before 4e.

---

## 4e–4g — Build, assemble, validate

Follow [`sitecore-page-from-design`](../../../sitecore-rendering-host-skills/sitecore-page-from-design/SKILL.md) Phases 3–4:

- Build **only approved** manifest rows (Action = `create`, or `reuse` needing wiring)
- After each component (TSX + component-map): **`npm run build`** in `editing-hosts/{folder}/` — **fix all errors** before the next component ([`sitecore-content-sdk-component`](../../../sitecore-rendering-host-skills/sitecore-content-sdk-component/SKILL.md) Step 4)
- Skip rows marked `skip`
- Assemble page YAML from `site-content-tree.json` — **mimicked pages with renderings + stub pages for link-only routes** ([site-structure-from-links.md](../../../sitecore-rendering-host-skills/sitecore-page-from-design/references/site-structure-from-links.md))
- `dotnet sitecore serialization validate --fix` then `push`
- Final **`npm run build`** — must pass before Phase 4 is complete

---

## Multi-page projects

| Scope | Manifest section |
|-------|------------------|
| Site-wide | Header, Footer, Navigation, LinkList, CookieBanner |
| Per URL | Hero, sections, page-specific grids |

Build order:

1. Shared chrome (once)
2. Per-page content bands in dependency order ([page-decomposition.md](../../../sitecore-rendering-host-skills/sitecore-page-from-design/references/page-decomposition.md))
3. **Stub pages** for all nav/footer links from `site-content-tree.json` ([site-structure-from-links.md](../../../sitecore-rendering-host-skills/sitecore-page-from-design/references/site-structure-from-links.md))

---

## Agent checklist (Phase 4)

```
4a Analyze
- [ ] Each capture folder read (png + html + source-url)
- [ ] Bands marked top → bottom per page
- [ ] Evidence column filled for every row
- [ ] `site-content-tree.json` generated from header/footer/nav links

4b User review — STOP
- [ ] Manifest table(s) shared with user
- [ ] Unclear rows called out explicitly
- [ ] Waited for explicit approval

4c Feedback applied
- [ ] Renames / splits / merges / adds reflected
- [ ] Revised manifest confirmed if needed

4d–4g Build
- [ ] Reuse audit complete (sibling-host TSX is reference only — not copied verbatim)
- [ ] Section PNGs opened before TSX for each component — [screenshot-done-gate.md](../../sitecore-rendering-host-skills/sitecore-component-from-design/references/screenshot-done-gate.md)
- [ ] Only approved components implemented
- [ ] `npm run build` passes after components (errors fixed)
- [ ] Page YAML for each target route (**mimicked + stub** from `site-content-tree.json`)
- [ ] Same-origin General Link fields in chrome datasources use `linktype="internal"` when route exists in `site-content-tree.json` — [site-structure-from-links.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/site-structure-from-links.md)
- [ ] validate + push succeeded
- [ ] Final `npm run build` passes
```
