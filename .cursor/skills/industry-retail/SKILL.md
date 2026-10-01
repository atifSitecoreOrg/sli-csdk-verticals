---
name: industry-retail
description: >-
  Retail and luxury-retail verticals — product listing, product detail,
  selected products, offers, articles, and cart-style actions. Use for
  industry-verticals/retail (FormaLux), industry-verticals/luxury-retail
  (Essential Living), fashion catalogues, or furniture commerce.
---

# Retail

Read [industry-verticals](../industry-verticals/SKILL.md) first.

| | FormaLux | Essential Living |
|--|----------|------------------|
| Folder | `industry-verticals/retail` | `industry-verticals/luxury-retail` |
| Site | `forma-lux` | `essential-living` |
| Editing host | `nextjsstarter` | `luxury-retail` |
| Content | `authoring/items/industry-verticals/sites/forma-lux` | `authoring/items/industry-verticals/sites/essential-living` |

FormaLux is the wider catalog (products, articles, offers, reviews, forms). Essential Living is the same product shape without the article set. Clone FormaLux unless the new site is a thinner product catalog.

## Components to reuse

`product-listing`, `product-details`, `selected-products`, `all-products-carousel` (retail only), `offers`, `reviews`, `article-listing`, `article-details`, `selected-articles`, `promo`, `breadcrumb`, `subscribe`.

A category page is a listing item. Its datasource is that page. A product page is one item under the products folder, not a new template per product.

## Commerce behavior

- Product cards: image and title link to the product. Add to cart is a sibling control, not inside that link.
- The product partial is breadcrumb plus product detail. Related products and a discount banner are page-level renderings, or the detail component reads a treelist on the product. Do not put them on the product partial.
- A return-visit offer is a promo on the product **page** layout so authors can personalize it in Pages.
- Price, SKU, and related items come from the product fields or a catalog module in `src/lib/`. Do not hardcode a brand catalogue in the component.
