# Event detail page — screenshot-first (hero + info band)

Apply when building **`EventDetailHeroSection`** and **`EventDetailInfoSection`** from `rai-nl--en-calendar-{slug}/` captures.

**Primary input:** full HLTH (or event) page PNG + **`page.html`** inside the event slug folder — **not** the thin `sections/event-detail-hero-section/section.html` crop alone.

---

## Why this page fails when built from generator defaults

| Failure | Cause |
|---------|--------|
| Generic `.rai-event-detail-hero__*` BEM | Generator scaffold — not from `page.html` |
| Emoji icons (🕐 📍 ℹ) in info cards | Generic placeholder icons — PNG shows `fa-solid fa-clock`, `fa-location-dot`, `fa-info` at 54px |
| Purple info panel | Wrong token — capture uses `bg-brand-primary-1` (red) |
| Title in wrong column | Capture has **h1 full width first**, then 4+8 grid (logo/date \| subtitle+body) |
| Missing organisation row | Footer of event band: "Organisation: HLTH 2026" + globe link |
| Wrong CTAs | Capture uses `rai-button` + `fa-kit fa-rai-arrow`, not `rai-rai-button` |

---

## Correct DOM (from `rai-nl--en-calendar-hlth-2026/page.html`)

**Hero band (`EventDetailHeroSection`):**

```
.rai-agenda-detail
  .mt-28
    h1.mb-9                    → Title
    .grid.grid-cols-12.gap-x-8
      .col-span-12.lg:col-span-4
        .session-agenda-detail-image-container → Image (border border-gray-300)
        h3.mt-4                  → DateRange
      .col-span-12.lg:col-span-8.mb-4
        h4.mb-4                  → Title (repeat)
        p                        → Description
    .flex.flex-wrap.gap-4
      a.rai-button × 2           → PrimaryCta, SecondaryCta
```

**Info band (`EventDetailInfoSection`):**

```
.rai-agenda-detail
  .bg-brand-primary-1.mt-12
    .grid.grid-cols-12.gap-y-8.text-center.py-10
      × 3 columns lg:col-span-4
        fa-solid fa-clock | fa-location-dot | fa-info  (54px, white)
        h2 → OpeningHoursTitle | LocationTitle | TicketTitle
        p.mt-8 → OpeningHours | Location | TicketInfo
  .w-full.mt-14.mb-24
    Organisation: {OrganisationName}
    fa-earth-americas link → OrganisationLink
```

---

## section-plan.json is often wrong for this page

Detection may label hero as `FullBleedHeroBannerSection` or info as `TitleDescriptionCtaSection`. **Correct before coding** — see [screenshot-done-gate.md](screenshot-done-gate.md).

If `sections/event-detail-hero-section/section.html` contains only `<h1>`, treat **`page.html`** as the layout authority for hero + info.

---

## Checklist

```
- [ ] Opened event page desktop PNG (full slug folder, not home page)
- [ ] Read rai-nl--en-calendar-{slug}/page.html for hero + info DOM
- [ ] TSX uses captured class names (rai-agenda-detail, session-agenda-detail-image-container, …)
- [ ] Font Awesome icons — not emoji
- [ ] Info panel bg-brand-primary-1 — not generic purple
- [ ] Organisation row present when PNG shows it
- [ ] Passed screenshot done gate before YAML push
```
