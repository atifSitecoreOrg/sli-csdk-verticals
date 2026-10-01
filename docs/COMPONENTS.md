# Components

React components in this clone, taken from each host’s `src/components/` folders. Shared layout and Pages components are listed once. Each vertical section lists only what that host adds.

Paths are `industry-verticals/{folder}/src/components/{name}/`.

## Hosts

| Folder | Site | Deploy key |
| ------ | ---- | ---------- |
| `healthcare` | Nova Medical | `healthcare` |
| `luxury-retail` | Essential Living | `luxury-retail` |
| `retail` | FormaLux | `nextjsstarter` |
| `starter` | starter | not deployed |
| `travel` | Skywings | `travel` |
| `energy` | Gridwell | `energy` |

## Shared

These folders exist on every host except where noted. `starter` has the layout set only (no header, footer, or hero).

| Folder | Rendering | Role |
| ------ | --------- | ---- |
| `column-splitter` | ColumnSplitter | Multi-column layout |
| `container` | Container | Styled wrapper |
| `content-block` | ContentBlock | Rich content block |
| `content-sdk` | Content SDK helpers | SDK field components |
| `image` | Image | Media library image |
| `link-list` | LinkList | Title, link, and text list |
| `navigation` | Navigation | Site menu |
| `non-sitecore` | — | Local UI helpers, not renderings |
| `page-content` | PageContent | Fields from a datasource |
| `partial-design-dynamic-placeholder` | PartialDesignDynamicPlaceholder | Partial design placeholder |
| `promo` | Promo | Image, text, and link |
| `rich-text` | RichText | HTML rich text |
| `row-splitter` | RowSplitter | Multi-row layout |
| `search-experience` | Search | Search UI |
| `title` | Title | Page title or subtitle |

Also on the full verticals (not `starter`): `footer`, `header` (`header-extended` on healthcare), `hero-banner`, `section-wrapper`, `social-follow`, `theme-editor`.

## Pages toolbox

Sitecore AI Pages groups the shared renderings like this:

| Category | Components |
| -------- | ---------- |
| Media | Image |
| Navigation | LinkList, Navigation |
| Page content | PageContent, Promo, RichText, Title |
| Page structure | ColumnSplitter, Container, RowSplitter |

In Pages, open a placeholder (`headless-main`, `headless-header`, `headless-footer`), insert the component, assign a datasource when asked, then publish.

## Healthcare — Nova Medical

Doctors and reviews.

`doctor-details`, `doctors-listing`, `reviews`, `header-extended`, `theme-switcher`

## Luxury retail — Essential Living

Products, offers, and a page header.

`product-details`, `product-listing`, `selected-products`, `offers`, `page-header`, `navigation-icons`, `language-switcher`, `social-feed`

## Retail — FormaLux

The widest catalog: products, articles, offers, and forms. Deploy key is `nextjsstarter`.

`all-products-carousel`, `product-details`, `product-listing`, `selected-products`, `article-details`, `article-listing`, `selected-articles`, `offers`, `reviews`, `breadcrumb`, `contact-form`, `subscribe`, `navigation-icons`, `language-switcher`, `social-feed`

## Starter

Layout and Pages components only: the shared table above, without header, footer, hero, or search chrome beyond `search-experience`.

## Travel — Skywings

Articles, destinations, and deals.

`article-details`, `article-listing`, `selected-articles`, `destination-details`, `destination-listing`, `selected-destinations`, `deals`, `icon-link-list`, `item-finder`, `subscribe`

## Energy — Gridwell

Articles plus grid status.

`article-details`, `article-listing`, `selected-articles`, `grid-conditions`, `grid-demand`, `gridstatusgauge`

## Where to read next

- [Junior developer guide](./JUNIOR-DEVELOPER-GUIDE.md) — placeholders, datasources, variants
- [Project structure](./PROJECT-STRUCTURE.md) — where the hosts and YAML live
