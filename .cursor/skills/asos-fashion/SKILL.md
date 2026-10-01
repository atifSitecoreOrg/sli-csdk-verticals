---
name: asos-fashion
description: >-
  ASOS isolated collection — wide-leg jeans under £50, Berlin October edit,
  Content Hub brand 95911. Use when editing industry-verticals/asos,
  authoring/items/asos. The host is not in this clone.
---

# ASOS

The ASOS host is not in this clone. Playbook: [`isolated-collection-site`](../sitecore-serialization-skills/isolated-collection-site/SKILL.md). Do not look for `docs/ASOS.md`.

| | Value |
|--|--|
| Host | `industry-verticals/asos` (Pages Router) |
| Module | `asos-scs` |
| Paths | `/sitecore/content/asos` → `/sitecore/content/asos/asos` |
| GUID prefix | Journey pages `a50c` |
| CH brand | **95911** ASOS DESIGN on spd-asos |

## Hard rules

- Do **not** invent extra people profiles. Emma is story-only.
- Never hotlink asos.com. DAM `src` + `dam-id` on Image fields after upload.
- Never commit Content Hub env, `.env`, `.env.local`, or a copy such as `.env copy`. Real keys stay in `.env.local` only. If one of those files is tracked, remove it and do not print the values.
- Keep helpers in `src/lib/`. Every `.tsx` under `src/components/` is registered by `sitecore-tools:generate-map`.
- Pages stay `/women`, `/men`, `/account`, `/my-edit`, `/saved-items`. Products are `/products/{slug}` (one ProductPage under Home/Products). Category and edit pages are the listing item (`/women/denim`, `/edits/{slug}`), not a `/cat` child. Taxonomy lives in Data, not beside Home.
- Do not re-run collection or site generators. The one-shot writers (`generate-asos-pages`, `serialize-asos-ia`, `serialize-asos-denim`, `cleanup-asos-tree`, `flatten-asos-pages`, `write-asos-presentation`) are removed. Serialized YAML is the source of truth.

## Journey

Arrive `/` → `/women` → denim edit (`cid=88011`, wide-leg jeans under £50) → mid-wash PDP `8805001` → Style Feed → My Edit **Berlin, October** (jean, knit, boot).

## Maps

- Component map: `industry-verticals/asos/.sitecore/component-map.ts`. Run `npm run sitecore-tools:generate-map` in `industry-verticals/asos` after adding a component. `SharedBoard` is registered and rendered by the catch-all, not a Pages rendering.
- Page map: `authoring/items/asos/scripts/media-maps/asos-page-map.csv` (`Route`, `SitecorePath`, `Title`, `YamlFile`). Full lookup: `asos-item-index.csv`. Refresh with `node authoring/items/asos/scripts/write-asos-maps.mjs`.
- DAM stills and wordmarks: `content-hub-asset-registry.csv`, `Asos-image-xml.json`, `src/lib/dam-registry.ts` (brand **95911** on spd-asos). Old public links are listed in `asos-media-migration.csv`.
- Content Hub env: copy `authoring/items/brother/scripts/set-ch-env.example.ps1` to OneDrive. Never commit secrets.
- Header wordmark: `DAM['asos-wordmark.png']` (asset 107264, brand 95911). White PNG of the official mark, first in the black bar, left of Women/Men.
- Page designs: Default, Product, ProductPage, ProductListing — each chains Header + Footer. Listing pages use template ProductListing; PDP items use ProductPage.
- Category listings expose Title, Intro, CategoryId, and Products (Treelist of ProductPage items under Home/Products). The CategoryListing rendering uses the listing page as its datasource. A filled Products field is the grid; an empty one keeps the category catalogue. Intro replaces the denim and Topshop fallback lines. The denim drop selects the jean `8805001`, knit `8805013`, and boot `8805014`.
- `GlobalBanner` is the first rendering on Home `headless-main` (rendering `…000009`), not the header. `Default` follows visit intent: a return visit shows the welcome-back offer, sale intent shows under £10, home shows the Berlin denim offer, other pages show NEWHERE. CDP affinity (brand, fit, category) changes the WOMEN link when the CMS href is empty. Pin `NewHere`, `Home`, `Product`, `Sale`, or `Returning` in Pages to override the offer. Datasource fields Message, Terms, WomenLabel, MenLabel, WomenHref, MenHref replace the variant copy when filled.
- Home is `GlobalBanner`, then `HomeBanner` (women/men split, `…000015`), `EditHero` (`…000030`, datasource `Data/HomeComponents/EditHero`), `Edit` (`…000016`), `NewIn` (`…000017`), and `AsSeenOnYou` (`…000029`) in `headless-main`. EditHero is the background promo (kicker, title, body, button, image). The same rendering sits on `/women`. As seen on you uses the NewIn datasource fields (heading, shop link, product ids). It ranks denim for the shopper's size. Signed-in size is UK 8 (`?known=1` or account sign-in), and the product page pre-selects it when it is in stock. Guests stay on UK 8 and do not get a size pre-selected. Cards and the product page show **Not in your size** when that size is missing, and **Not available in your size** when UK 8 is listed but sold out. `210425806` and `208718129` are UK 10–16. `210645207`, `210943513`, `211556430`, and `208718219` list UK 8 as sold out. The Chelsea boot `8805014` is UK 3–8.
- `Subscribe` (`…000024`) sits on the Footer partial above the link columns. Datasource `Data/HomeComponents/Subscribe`: Image, Heading, Placeholder, ButtonLabel, PreferenceLabel, Terms, SuccessMessage. The logo is the Content Hub wordmark. Do not hotlink asos.com.
- `StyleFeed` (`…000008`) is the homepage story row. Datasource `Data/HomeComponents/StyleFeed` (heading, intro, read label, four cards). Each card opens an `Article` (`…000025`) under `/style-feed/{slug}`, edited at `Data/Articles`. Each styling article also places Buy the look, You might also like, People also bought, Recently viewed, Your style, the Style Feed row, the SEO link grid, and SEO copy. Buy the look shops that story's product ids. Copy is original. Images are Content Hub stills.
- PDP rails (`YouMightAlsoLike`, `BuyTheLook`, `PeopleAlsoBought`, `RecentlyViewed`, `YourStyle`) are composed by `ProductPage` and are also renderings. Product page fields PayCopy, PromoCopy, SizeFit, Details, Composition, BrandStory, DeliveryCopy are editable on the product. Rail datasource `ProductRail` has Heading, Intro, Intent (`similar`, `outfit`, `cobought`, `recent`, `style`), and ProductIds. Empty ProductIds means the rail ranks the catalogue from CDP affinity. Browsing events, the guest session id, and referral stay in `localStorage` (`asos-cdp-session-events` and the matching keys), so affinity scores survive a closed browser on the demo machine. The CDP drawer shows visits, referral, affinity scores, the event payload, and subscribe or identify. **Reset browsing profile** clears those events, the referral, and the visit count.
- Bag and saved: the header bag button opens My Bag (hold line, colour, size, qty, sub-total, View bag, Checkout). The heart opens `/saved-items` (recently added, size, Move to bag). First visit seeds the story jean in the bag and the jean plus knit on the heart. Add to bag and save write `ADD_TO_BAG` and `SAVE` events with affinity name/value pairs (`content_type`, `brand`, `product_type`, `category`, `colour`).
- Affinities: template `Affinity` field `Affinities` (multi-line `name|value`, max 10, `a-z`, `0-9`, underscore). ProductPage and ProductListing inherit it. Bag, saved items, women, and the style articles use `AsosPage`, which inherits Page plus Affinity. `POST /api/affinities` with `{ pageId, affinities: [{ name, value }] }` PATCHes that field through the Pages API when `SITECORE_PAGES_API_TOKEN` is set (`PATCH https://xmapps-api.sitecorecloud.io/api/v1/pages/{pageId}`). Performance → Settings → Affinities is the UI for the same pairs: https://doc.sitecore.com/sai/en/users/sitecoreai/audience-and-insights/affinities/set-up-affinities-for-a-site.html
- Search: `HeaderSearch` (`src/lib`) and `SiteSearch` on `/search`. Both autocomplete “wide-leg jeans”. `q=denim` lists denim product cards. Facets use `refine`, `pricerange`, and `iscurated`. `AiChatbot` and `CdpProfileShell` mount from `_app.tsx`.
- Fit: `/account` writes a session profile (`src/lib/asos-profile.ts`). Listings, search, shared boards, and the PDP size use it.
- Women's denim trend: `/women/denim` (CategoryId 17014). Product pages are `Home/Products/{slug}` (GUID prefix `a50c0004`, except Belle Paris `a50c0002-…0024` and Weekday `a50c0002-…0042`). ProductPage fields Title, Brand, Price, Colour, Size, Image, Video, ProductId, Categories, plus PayCopy, PromoCopy, SizeFit, Details, Composition, BrandStory, DeliveryCopy. Size is one UK size per line (`4`, `6`, `8`, `10`, `12`, `14`, `16`). `210425806` and `208718129` are stored without UK 8. Colour stays a single value. Affinities stay `name|value` lines. In Pages, the product field editor is a grouped affinity multi-select, a UK size multi-select, and a searchable colour swatch. `?fields=1` opens the same editor. Image fields use Content Hub `src` + `dam-id` (brand **95911**). Do not point them at `public/asos/products/live/` or `public/asos/editorial/`. One Content Hub photo per product. Story products `8805001`, `8805013`, `8805014`, `200415553`, and `211674477` are ProductPage items. The Product page design chains Header, an empty ProductContent partial, and Footer. Each product item places the ProductPage rendering on `headless-main` with that item as the datasource, so Pages can edit it and the body is not rendered twice.
- Homepage datasources live in `Data/HomeComponents`: GlobalBanner, HomeBanner, Edit, NewIn. Home renderings point at them with `s:ds`. NewIn `ProductIds` is a pipe-separated list of product ids. Filling GlobalBanner Message replaces the variant offer line.
- Data, not a second site tree: `Data/Categories` is the taxonomy. Catalogue, Sites (Topshop), Shared, and Signals sit under Data.
- Long YAML paths live in hash folders. After moving items, run `dotnet sitecore serialization validate --fix -i asos-scs` before push. Do not invent hash names.
