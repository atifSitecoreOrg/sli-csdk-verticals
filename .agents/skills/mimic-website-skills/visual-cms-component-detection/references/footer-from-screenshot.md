# Footer detection — screenshot-first (never generic)

Apply when the footer band appears in desktop/tablet/mobile section PNGs or in `sections/footer/`.

**Primary input:** footer section PNGs (`footer-desktop.png`, etc.) — **not** a generic “Footer + LinkList columns” template from another project.

---

## Rule: never default to generic footer patterns

| Forbidden without screenshot evidence | Why |
|---------------------------------------|-----|
| `Footer` + `footer-links` placeholder + multiple `LinkList` children | JM2/JM3 pattern — not universal |
| `Footer` with only `Logo` + `CopyrightText` fields | Too minimal; misses visible regions |
| Assuming “footer = link columns” | Many sites use inline links, panels, newsletter, social icons |

**If the screenshot shows a different layout, the detection plan must describe that layout — not a reusable template from another site.**

---

## Visual analysis checklist (desktop PNG first)

Open `footer-desktop.png` and label every distinct region top → bottom:

1. **About / links column(s)** — headings, inline links with icons, newsletter block
2. **Contact / CTA panel** — colored panel, address, phone, contact/directions links
3. **Logo row** — site logo, partner logos, certification marks
4. **Copyright bar** — legal links (often pipe-separated), year + ©, social icon row

For each region, note:

- Background colors (grey band vs magenta panel vs lighter copyright strip)
- Grid layout (e.g. 12-column: 4 + spacer + 4 on desktop)
- Icons (Font Awesome arrows on links, phone/messages/location in contact panel, brand social icons)
- Typography (heading size, uppercase CTA button)

Tablet/mobile PNGs: confirm stack order (contact panel below links, copyright bar wraps, social icons align).

---

## Component model from screenshot (RAI Amsterdam example)

When the PNG matches this pattern:

```
[ grey band: events links + newsletter CTA | empty col | magenta contact panel ]
[ logo row: RAI logo + partner logo ]
[ copyright bar: legal | year © Copyright | social icons ]
```

| Correct detection | Wrong detection |
|-------------------|-----------------|
| **One** `Footer` component, **no** nested LinkList placeholder | Footer + 3× LinkList in `footer-links` |
| Fields derived from visible regions (see below) | Only Logo + CopyrightText |
| Standalone partial design — single Footer rendering | Partial design with LinkList children |

**Suggested fields (adjust counts to match PNG):**

- `EventsTitle`, `EventLink1`–`EventLink3` (General Link)
- `NewsletterTitle`, `NewsletterCta`
- `ContactTitle`, `ContactBody`, `ContactPhone`, `ContactLink`, `DirectionsLink`
- `Logo`, `PartnerLogo` (Image)
- `LegalLink1`–`LegalLink3`, `SocialLink1`–`SocialLink3`
- `CopyrightYear`, `CopyrightText`

**Placeholders:** none — links are fields on Footer, not separate LinkList renderings.

---

## Validate against `section.html` (after visual plan)

Use HTML only to **confirm** field names, hrefs, and class names — not to invent a different layout:

- Copy wrapper/class structure from `section.html` into TSX (e.g. `bg-brand-footer-about-bg`, `footer-two-column-clip-path`, `btn-footer-solid`)
- Grep icons: `fa-sharp`, `fa-brands`, `fa-duotone` → Font Awesome kit required in editing host
- Extract partner logo URL, legal hrefs, social URLs for datasource YAML

If `section.html` and PNG disagree on structure, **PNG wins**; use HTML for copy/URLs only.

---

## `section-plan.json` output

When writing or correcting `sections/footer/section-plan.json`:

- `implementationPlan.components` → **one** Footer, `role: "standalone"`
- `placeholders` → `[]` or omit when all links are Footer fields
- `fields` → full list from visual inventory (not Logo-only)
- `narrativeSummary` → describe the actual bands seen in PNGs
- Set `detection.source: "visual"` when overriding a generic DOM template

---

## Verification before approval

- [ ] Footer PNG shows all planned regions (contact panel, newsletter, logos, legal, social)
- [ ] No LinkList placeholder unless PNG shows **distinct repeating link-column components** authored separately
- [ ] Field list covers every editable text/link/image visible in PNG
- [ ] Plan mentions icon fonts if PNG shows icons
- [ ] Tablet/mobile PNGs reviewed for stack/wrap behavior
