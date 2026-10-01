# Screenshot done gate — mandatory before marking a component complete

**Problem this solves:** Components are often shipped as generic placeholders copied from another editing host (JM2/JM3 patterns, simplified BEM, wrong fields). They only match screenshots after the user explicitly asks for a fix.

**Rule:** A component is **not done** until it passes this gate. There is no “first pass generic, fix later” workflow.

---

## Hard blockers (must pass before YAML push)

| # | Gate | How to verify |
|---|------|----------------|
| 1 | **Open all three section PNGs** (desktop, tablet, mobile) before writing TSX | Agent must reference specific visible regions in notes or plan |
| 2 | **List every visible region** in the PNG (columns, panels, icon rows, CTAs, **photos/logos**) | Compare to field list and DOM — missing region or **missing Image field for visible photo** = incomplete |
| 3 | **TSX class names match `section.html`** | Grep `section.html` for classes on wrapper nodes; same strings on TSX |
| 4 | **CSS ported for non-standard classes** | Every captured class used in TSX has a rule in site stylesheet — [captured-css-and-fonts.md](captured-css-and-fonts.md) |
| 5 | **Icons visible** | If PNG shows icons, TSX has `<i class="fa-…">` and Font Awesome kit is loaded |
| 6 | **No sibling-project copy** | TSX/CSS/YAML written fresh for **this** capture — [project-isolation.md](project-isolation.md), [section-field-inventory-from-screenshot.md](section-field-inventory-from-screenshot.md) |
| 6b | **No generator-default scaffold** | TSX class names come from **`page.html` / section.html**, not from `Generate-*Components.mjs` placeholder BEM — grep TSX for `rai-` prefixes not present in capture |
| 7 | **`npm run build` passes** | No CSS/TSX compile errors |
| 8 | **Section PNG mental diff** | Agent states what still differs from PNG, or confirms match |
| 9 | **Chrome placeholders** | Header: one nav placeholder; nested keys match partial design (`header-utility-1`) — [header-responsive-chrome.md](../../../mimic-website-skills/visual-cms-component-detection/references/header-responsive-chrome.md) |

If any gate fails → **do not push YAML** or mark the component complete.

---

## Forbidden “done” signals

| Wrong signal | Why it fails |
|--------------|--------------|
| “Build passes” | Generic markup can compile without matching PNG |
| “Follows JM3 Header pattern” | Another site’s pattern ≠ this screenshot |
| “section-plan.json says Header” | Plan may be wrong until validated against PNG |
| “Used standard Navigation fields” | Standard fields may not match icon-link utility row |
| “Close enough for now” | User should not need a second request for fidelity |

---

## Required workflow order

```
1. Open section PNGs (desktop → tablet → mobile)
2. Write visual region inventory from PNGs — include every photo/logo → Image field — [section-field-inventory-from-screenshot.md](section-field-inventory-from-screenshot.md)
3. Confirm page-decomposition.json: one parent component per horizontal band (do not merge bands)
4. Read section.html for class names, copy, hrefs, icons only
5. Read section-plan.json — correct plan if it contradicts PNG
6. Detect repeating patterns → child component + placeholder — [repeated-pattern-placeholders.md](repeated-pattern-placeholders.md)
7. Implement TSX + CSS from capture (not from sibling host)
8. Wire fonts/icons from site-summary.json
9. Run screenshot done gate checklist
10. npm run build
11. YAML push
```

**Step 1–2 happen before any TSX file is created.** Opening PNGs is not optional context — it is the implementation spec.

---

## Chrome components (Header, Footer, Navigation)

Use section-specific references — never a default chrome template:

| Component | Reference |
|-----------|-----------|
| Footer | [footer-from-screenshot.md](../../../mimic-website-skills/visual-cms-component-detection/references/footer-from-screenshot.md) |
| Header / Navigation | [header-from-screenshot.md](../../../mimic-website-skills/visual-cms-component-detection/references/header-from-screenshot.md) |
| Event detail (HLTH / calendar slug) | [event-detail-from-screenshot.md](event-detail-from-screenshot.md) |

---

## Checklist (copy into every component task)

```
Screenshot done gate
- [ ] Opened desktop, tablet, mobile section PNGs before coding
- [ ] Region inventory written from PNGs (not from generic template)
- [ ] Every visible image has a matching Image field on template/datasource
- [ ] page-decomposition.json: separate component per section band (no merged hero+grid)
- [ ] section-plan.json corrected if plan ≠ PNG
- [ ] TSX classes match section.html
- [ ] CSS rules ported for captured classes
- [ ] Icons/fonts wired when PNG shows them
- [ ] No TSX/YAML copied from sibling editing host
- [ ] Repeating patterns use child component + placeholder where applicable
- [ ] npm run build passes
- [ ] Confirmed layout matches section PNGs (or listed remaining diffs)
```
