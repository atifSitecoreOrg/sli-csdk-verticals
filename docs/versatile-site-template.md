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

The rendering host is registered and not deployed by this change. `Project.Versatile` is listed for a later item deploy. Push the module on its own with `dotnet sitecore serialization push -i Project.Versatile`.

## Page types

Home, Landing, Listing, Detail, Article, Contact, and Search. Each inherits Page. Listing, Detail, and Article carry title, image, summary, tags, link, and body.

Branches under `/sitecore/templates/Branches/Project/versatile`:

- Property showcase — hero, listing, enquiry, contact
- Retail catalogue — hero, promo, listing, card
- Campaign launch — hero, rich text, testimonial, call to action

## Presentation

Each page type maps to its own page design. The design is Header, the type partial, and Footer. Type partials do not render into `headless-main`. Editable body renderings, including an empty Container placeholder, sit on the page. Placeholder keys are `sxa-header`, `sxa-footer`, `sxa-home`, `sxa-landing`, `sxa-listing`, `sxa-detail`, `sxa-article`, `sxa-contact`, and `sxa-search`.

## Brand

`{site}/Settings/Brand` fields: Logo, LogoAlt, Primary, Secondary, Accent, Background, Foreground, HeadingFont, BodyFont.

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
