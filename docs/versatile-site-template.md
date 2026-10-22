# Versatile site template

One Create site template for real estate, retail, and campaign sites. English only. Logo, colours, and type live on each site's Brand item, not in the component source.

## Where it lives

| | Path |
| --- | --- |
| Rendering host | `industry-verticals/versatile` |
| Deploy key | `versatile` in `xmcloud.build.json` |
| Serialization | `authoring/items/site-templates/versatile` (`Project.Versatile`) |
| Solution template | `/sitecore/system/Settings/Project/versatile/Templates/Versatile` |
| Setup | `/sitecore/system/Settings/Project/versatile/Versatile Setup` |
| Preview collection | `/sitecore/content/versatile` |
| Preview site | `/sitecore/content/versatile/versatile-preview` |
| Research | [research/site-templates.md](./research/site-templates.md) |

The rendering host key `versatile` is enabled. Push item changes with `dotnet sitecore serialization push -n dev -i Project.Versatile`. The media-library include is CreateAndUpdate, so a later push leaves site media in place.

## Page types

Home, Landing, Listing, Detail, Article, Person, Contact, and Search. Each inherits Page. Listing, Detail, and Article carry title, image, summary, tags, link, and body. Person inherits Page only. A profile uses the Detail datasource on that page.

Branches under `/sitecore/templates/Branches/Project/versatile`:

- Property showcase — hero, listing, enquiry, contact
- Retail catalogue — hero, promo, listing, card
- Campaign launch — hero, rich text, testimonial, call to action

## Presentation

Each page type maps to its own page design. The design is the header partial, the type partial, and the footer partial. Body renderings sit on the page in `headless-main`. The layout placeholders are `headless-header`, `headless-main`, and `headless-footer`.

A post-setup step turns the created Home into the Home template, sets the rendering host to `versatile` and the host name to the site name, fills the page-design mapping, and adds Projects, one sample project, People, one sample person, Journal, one article, Contact, and Search. Property showcase, Retail catalogue, and Campaign launch stay insert options.

## Brand

`{site}/Settings/Brand` fields: Logo, LogoAlt, Primary, Secondary, Accent, Background, Foreground, HeadingFont, BodyFont, PrimaryNavigation, and CtaLink. PrimaryNavigation is the header and footer link list. CtaLink is the header action.

The preview site uses neutral defaults: primary `#1f2937`, secondary `#4b5563`, accent `#0f766e`, background `#fafafa`, foreground `#111827`, heading Source Serif 4, body Source Sans 3. The header writes those values onto `--brand-*` variables. Components use the variables.

## Workflow

`__Default workflow` is Basic Workflow on page template standard values, and Basic Datasource Workflow on datasource template standard values. `__Workflow` and `__Workflow state` stay blank. New items start in Draft.

## Motion

Fade and rise, card lift, underline, accordion, and the navigation drawer are short CSS transitions. They stop when `prefers-reduced-motion` is set, and while `page.mode.isEditing` is true: the header is not fixed, accordions are open, and entrance classes are omitted.

## Local host

```powershell
cd industry-verticals/versatile
copy .env.remote.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_DEFAULT_SITE_NAME` to `versatile-preview` and fill the Edge context id and editing secret from the environment you are using.
