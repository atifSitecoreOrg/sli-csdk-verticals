# Sitecore datasource fields — General Link, images, and `[object Object]`

Quick reference for authors and agents wiring **datasource items** (`Data/Hero Banners`, `Data/Promos`, etc.) to Content SDK components. Prevents broken CTA links, empty images, and **`[object Object]`** in the browser.

**Skill reference (YAML examples + GraphQL):**  
[`.cursor/skills/sitecore-serialization-skills/sitecore-new-rendering-yaml/references/datasource-field-values.md`](../.cursor/skills/sitecore-serialization-skills/sitecore-new-rendering-yaml/references/datasource-field-values.md)

---

## General Link fields (`CtaLink`, `PromoMoreInfo`, …)

Serialized **internal** links must include the **target item GUID** in the `id` attribute, not only `text` and `url`.

| Status | Example |
|--------|---------|
| **Bad** — Edge `jsonValue: null`, UI shows `[object Object]` | `<link linktype="internal" text="Find out more" url="/homeowners-home" />` |
| **Good** | `<link class="" querystring="" id="{target-item-guid}" anchor="" target="" title="" linktype="internal" text="Find out more" url="/products" />` |

Copy the pattern from **FormaLux → Data → Hero Banners → Home Banner** after a pull from CM. The `id` must be that target item’s GUID.

---

## Image fields

| Source | Edge / delivery |
|--------|-----------------|
| Reference website CDN (e.g. `bristan.com/.../banner-1.ashx`) | **Fails** — empty `value: {}` on Edge |
| **Content Hub DAM** (Pages media picker) | **Recommended** — includes `dam-id`, public `src`, `thumbnailsrc` |
| Rendering host `public/` path (e.g. `/images/hero/banner-1.jpg`) | OK for local dev / fallback |
| Your tenant XM Cloud public content URL | OK |

**Workflow:** Pick image in CM with CH DAM → publish → `dotnet sitecore serialization pull` → commit YAML.

---

## Hero Banner (FormaLux)

- **Datasource template:** `Project/industry-verticals/Components/Page Content/Hero Banner/Hero Banner`
- **React:** flat `fields` — `Title`, `Description`, `Image`, `CtaLink` passed to SDK `<Text>`, `<RichText>`, `<NextImage>`, `<Link>` in `industry-verticals/retail/src/components/hero-banner/`
- Content must be valid on Edge. A link without a target item `id` comes back as `jsonValue: null` and renders as `[object Object]`.

---

## Verify before debugging React

```graphql
# Replace path and site name
query {
  item(path: "/sitecore/content/industry-verticals/forma-lux/Data/Hero Banners/Home Banner", language: "en") {
    field(name: "CtaLink") { jsonValue }
    field(name: "Image") { jsonValue }
  }
}
```

Then publish if fields are correct in CM but delivery is empty.

---

## Related docs

- [JUNIOR-DEVELOPER-GUIDE.md](./JUNIOR-DEVELOPER-GUIDE.md) — component anatomy
- [SITECORE-SITE-SHELL.md](./SITECORE-SITE-SHELL.md) — site shell and Page Designs
- [README.md](./README.md) — documentation index
