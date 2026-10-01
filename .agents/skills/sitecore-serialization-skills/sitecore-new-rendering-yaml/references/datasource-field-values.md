# Datasource field values (YAML) — General Link, Image, Edge verification

Use this when authoring **datasource items** under `Data/` (Hero Banner, Promo, Footer links, etc.) or when generators emit `Hint` + `Value` pairs. Prevents **`[object Object]`** in the rendering host and **empty fields on Edge**.

**Canonical site example:** Bristan Home Hero — `authoring/items/bristan/serialized-content/bristan/bristan/Data/Hero Banners/Home Hero.yml`  
**Working reference:** Forma Lux Home Banner — `authoring/items/industry-verticals/sites/forma-lux/items/site-data/Data/Hero Banners/Home Banner.yml`

---

## General Link (`CtaLink`, `PromoMoreInfo`, `Link`, `TargetUrl`, …)

### Do not use minimal link XML

This **fails on Edge** (`jsonValue: null`, GraphQL `FORMAT` error) and causes `<Link field={...}>` to render **`[object Object]`**:

```xml
<link linktype="internal" text="Find a Product" url="/products/bathroom-taps" />
```

### Use full internal link XML with target item `id`

Match the Forma Lux / Bristan pattern — include empty attributes and the **GUID of the target content item**:

```xml
<link class="" querystring="" id="b8030001-0001-4000-8000-000000000003" anchor="" target="" title="" linktype="internal" text="Find a Product" url="/bathroom-taps" />
```

| Attribute | Rule |
|-----------|------|
| `id` | **Required** — GUID of the linked Sitecore item (page, product, etc.) |
| `url` | Site-relative route (e.g. `/bathroom-taps`), not an arbitrary external path |
| `text` | Link label shown in delivery |
| `linktype` | `internal` for content items |

**Generators:** `authoring/items/bristan/scripts/generate-bristan-site.mjs` — `ctaLinkXml(text, url, targetId)` — pass the target page GUID, not only the URL string.

---

## Image fields

### Do not hotlink reference-site media in serialized YAML

External URLs from the mimicked website (e.g. `https://www.bristan.com/-/media/.../banner-1.ashx`) **do not resolve on Edge** — GraphQL returns `value: {}` and images break in delivery.

### Use Content Hub DAM (recommended)

Assign images in **Sitecore Pages / Content Editor** via the DAM picker, then **pull** serialization. YAML should include DAM metadata:

```xml
<Image src="https://{tenant}.sitecoresandbox.cloud/api/public/content/{assetId}?v={version}" dam-id="..." width="..." height="..." alt="..." dam-content-type="Image" thumbnailsrc="https://{tenant}.sitecoresandbox.cloud/api/gateway/{id}/thumbnail" />
```

Example (Bristan Home Hero after CH DAM):

`https://spd-verticals.sitecoresandbox.cloud/api/public/content/f04b938c60c04ea18d59d9e7b17553ed?v=6f971d54`

### Acceptable fallbacks (dev / Storybook only)

- Local static path on the rendering host: `/images/hero/banner-1.jpg` (file under `public/`)
- XM Cloud media / public content API URLs from **your** tenant — not the reference brand's CDN

**Do not** commit DAM secrets. Image URLs in YAML are public delivery URLs.

---

## React component pattern (flat datasource fields)

For components like **Hero Banner** that use a **datasource folder item** (not IGQL nested `fields.data.datasource`):

1. **Follow retail / Forma Lux** — direct SDK field components on flat `fields`:

   ```tsx
   <Text field={fields.Title} />
   <RichText field={fields.Description} />
   <Link field={fields.CtaLink} />
   <NextImage field={fields.Image} />
   ```

2. **Unwrap EE / IGQL shape** when layout returns `{ jsonValue: { value: ... } }`:

   ```tsx
   function pickField<T>(field?: T | { jsonValue?: T | null }): T | undefined {
     if (!field || typeof field !== 'object') return undefined;
     if ('jsonValue' in field) return (field as { jsonValue?: T | null }).jsonValue ?? undefined;
     return field as T;
   }
   ```

3. **Guard General Link** — only render `<Link>` when `href` resolves (malformed CtaLink → `[object Object]`):

   ```tsx
   function getValidCtaLink(field?: LinkField): LinkField | undefined {
     const link = pickField(field);
     return link?.value?.href ? link : undefined;
   }
   ```

Reference implementation: `industry-verticals/bristan/src/components/hero-banner/HeroBanner.tsx`  
Retail baseline (no guards needed when content is correct): `industry-verticals/retail/src/components/hero-banner/HeroBanner.tsx`

---

## Verify on Edge (before blaming React)

Use your `SITECORE_EDGE_CONTEXT_ID`:

```graphql
query {
  item(path: "/sitecore/content/{collection}/{site}/Data/Hero Banners/Home Hero", language: "en") {
    title: field(name: "Title") { jsonValue }
    cta: field(name: "CtaLink") { jsonValue }
    image: field(name: "Image") { jsonValue }
  }
  layout(site: "{site-name}", routePath: "/", language: "en") {
    item { rendered }
  }
}
```

| Symptom | Likely cause |
|---------|----------------|
| `CtaLink` `jsonValue: null` + `FORMAT` error | Minimal link XML — fix `id` + full attributes |
| `Image` `value: {}` | External / broken image URL — use CH DAM or tenant media |
| `layout.rendered` empty `{}` | Home / datasource not **published** to Edge |
| Title OK, CtaLink broken | Component shows `[object Object]` on CTA only |

---

## Deploy checklist

1. `dotnet sitecore serialization push -n <cm-nickname> -i <module>`
2. **Publish** datasource items and pages to Edge (not only master DB push)
3. Re-run Edge GraphQL above
4. Refresh Experience Editor / `npm run dev`

Human guide: [docs/SITECORE-DATASOURCE-FIELDS.md](../../../../docs/SITECORE-DATASOURCE-FIELDS.md)
