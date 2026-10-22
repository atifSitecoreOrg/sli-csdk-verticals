# Versatile site template reference

Ids verified on the verticals content manager, 22 Oct 2026, except where marked as starter-repo YAML.

## Dialog item

| | |
| --- | --- |
| Data template | Solution template `1b2dfd3b-f2f2-4f40-a75c-f6c2490919c4` |
| Path to create | `/sitecore/system/Settings/Project/versatile/Templates/Versatile` |
| Name | `82e64b52-0b8a-4a38-8c78-530c5493814e` = `Versatile` |
| Description | `9f437e68-a84d-48ae-8ce1-a3e26c0b5e64` |
| Content | `da855368-e5f2-4932-ae55-7f8b08a5a205` |
| Site Modules | `c262443b-653d-461d-96c8-7cfaa0ef2b2d` |
| Tenant Modules | `41ac536a-923a-43f9-ac87-f3993f638125` |
| Thumbnail | `c7c26117-dbb1-42b2-ab5e-f7223845cca3` |

Content JSON:

```json
[
  {"name":"Pages","content":"Home, Landing, Listing, Detail, Article, Person, Contact, Search"},
  {"name":"Uses","content":"Real estate, retail, campaign"},
  {"name":"Components","content":"Header, hero, projects, people, journal, search, contact"},
  {"name":"Integrations","content":"Personalization and Analytics"}
]
```

Site Modules starts with the same foundation/feature modules as Basic Site, then the Versatile setup id:

```
{5A2F6A6F-3028-4210-AAD3-82C1365C4802}
{9F10010E-49E2-4DCD-A5A1-4DA752ADED2A}
{4342A029-0186-4B0D-8959-FFEF4FD998C2}
{AE5D1384-BB75-4C6B-A8B5-4B008C2AC5DA}
{C4658673-5D70-44ED-9004-D66EAC1DC718}
{CA502DCF-20D2-4618-A735-E4FCB6D5E114}
{E2AF1A41-799E-481B-8FDC-B2D33FB729A1}
{66B9C663-2602-42B1-A5A2-3D04DB6C506A}
{1FD78E81-59A6-4513-90F1-165A95D4B16B}
{BEBF4026-24A3-4EA6-986A-518B76DBD71A}
{385F31BE-FF0C-4D84-A627-9ECD21295AFD}
{F0EA389E-F78D-440B-9429-F04FE735344A}
{AC1A27CA-6BF3-4D23-915E-668326D52CF1}
{D7EEAF4D-2B58-4029-B141-844221565EF0}
{1F35559F-2140-4774-8BC1-525BB722BAA2}
{VERSATILE-SETUP-ID}
```

Tenant Modules, copied from Alaris YAML:

```
{7B81B847-1891-43B2-BC13-5047A62EC32A}
{7BAAA4FC-3051-442D-9BD2-AD720B655E0B}
{0DC2E395-4A95-4773-88CA-75B22A130849}
{4346A98A-D6E9-491E-A0ED-CD12F524CF4E}
{4CBC64BF-8116-48A1-ABAC-DB19103897A6}
{7574F439-0B48-48BE-BA6B-94B1A3CE01A3}
{D912C30C-7A98-4A8D-A094-611D9AF9605D}
{6DE1F4E9-815D-491D-923D-D5038100DBEE}
{02CD7086-1F87-41EC-B40F-B92C1226895B}
{1B0A98C0-1801-44A0-85F2-845694FEAFF3}
{D315A501-6503-4545-A5D8-B9FECBA1097D}
```

## Setup actions

Setup item template: HeadlessSiteSetupRoot `bed31d6f-d968-45a9-b54e-12d7f977d861`.

AddItem template: `3aea335c-d06d-45b1-841a-cbc8d2d1ce40`. Location field: `52c91c75-6698-4701-a8a2-242ace59a8d6`. Template field: `e62c28f0-9d3b-46e2-8bec-a5e120542499`. Name field: `7868e6bc-525c-4fce-ab8a-77da3e09b171`. The live Basic Site "Add About" action stores the branch id in Template and a JSS Site branch prototype id in Location. Home prototype `e96b4685-0341-4077-afce-bcce690b3927`. Settings prototype `9af6ce61-4fc5-43ee-9014-03e9d9c9c3df`. Data prototype `ba2f959d-a614-4c92-8b57-f1fc1a323abe`. Page Designs prototype `ab94fec8-3dca-40dc-86bc-8402fa98ac09`. Partial Designs prototype `98ab60c3-0fe5-467b-a6c7-abd981e30e7a`.

ExecuteScript template: `bc9bb684-36df-4285-888b-d8b4d87b10de`.

Actions to generate: Add Available Renderings, Add Partial Designs, Add Page Designs, Add Brand, Add Data Folders, Add Home, and one Add action per page type, then a post step.

## Presentation fields

| Field | Id |
| --- | --- |
| TemplatesMapping | `ba1f60d6-3deb-40cc-bb61-eec772279ee1` |
| PartialDesigns | `0966b999-0d0e-4278-acc9-9da69d461fe6` |
| Signature | `55faae90-3bba-4f7f-96fe-13c3f40055ff` |
| __Renderings | `f1a1fe9e-a60c-4ddb-a3a0-bb5b29fe732e` |
| Layout device | `{96E5F4BA-A2CF-4A4C-A4E7-64DA88226362}` |
| Page design template (FormaLux) | `1105b8f8-1e00-426b-bf1f-c840742d827b` |
| Partial design template (FormaLux) | `fd2059fd-6043-4dfe-8c04-e2437ce87634` |
| JSON rendering | `04646a89-996f-4ee7-878a-ffdbf1f0ef0d` |
| componentName | `037fe404-dd19-4bf7-8e30-4dadf68b27b0` |
| Datasource Template | `1a7c85e5-dc0b-490d-9187-bb1dbcb4c72f` |
| Datasource Location | `b5b27af1-25ef-405c-87ce-369b3a004016` |

Encode one mapping pair as `%7bTEMPLATE%7d%3d%257BDESIGN%257D`. Join with `%26`.

Shell templates: Dictionary `0a2847e6-9885-450b-b61e-f9e6528480ef`, Media `e8e8c94f-4248-43c3-a79f-99fbb49d78e6`, Data root only `a29d272e-9d48-453c-9e9d-b47585fa7f20`, Presentation `0a70fa73-8923-4a6e-abf3-4134f25f3221`, Settings `0de7a4ac-f98c-4e55-912a-7fa90da860aa`.

## Workflow

| | Id |
| --- | --- |
| Basic Workflow | `b4f49b23-4bba-4c79-ba22-f89f5f0d4e4f` |
| Draft (initial) | `57cc7dce-e6b1-4564-9581-0e5850b8bdf2` |
| Basic Datasource Workflow | `a053ed9f-4099-4682-9411-2b4c98e481e4` |
| Datasource Draft | `12ffac4c-565f-4c9a-b63e-7f77e96b4d1f` |
| __Default workflow | `ca9b9f52-4fb0-4f87-a79f-24dea62cda65` |
| __Workflow | `a4f985d9-98b3-4b52-aaaf-4344f6e747c6` |
| __Workflow state | `3e431de1-525e-47a3-b6b0-1ccbec3a8c98` |
| _PerSiteStandardValues | `44a022db-56d3-419a-b43b-e27e4d8e9c41` |
| Page base | `3f8a6a5d-7b1a-4566-8cd4-0a50f3030bd8` |

## Brand contract

Item: `{site}/Settings/Brand`. Fields: Logo, LogoAlt, Primary, Secondary, Accent, Background, Foreground, HeadingFont, BodyFont.

Neutral defaults: primary `#1f2937`, secondary `#4b5563`, accent `#0f766e`, background `#fafafa`, foreground `#111827`, heading and body `Georgia, serif` is not used. Heading `Source Serif 4`, body `Source Sans 3`. These strings live on the Brand item only.

The host sets, on the site root:

```css
--brand-primary: ...;
--brand-secondary: ...;
--brand-accent: ...;
--brand-background: ...;
--brand-foreground: ...;
--brand-font-heading: ...;
--brand-font-body: ...;
```

Components use those variables. Header and footer bind Logo to this item.

## Baseline components

Layout: Container, RowSplitter, ColumnSplitter, PartialDesignDynamicPlaceholder.

Chrome: Header, Footer, Navigation, Breadcrumb, LanguageSwitcher.

Content: Hero, RichText, Promo, Card, Accordion, Cta, Media, Image, Video, Testimonial.

Discovery: Listing, Detail, Article, Search, ContactForm.

Each rendering's `componentName` matches the component-map key. Datasource location:

`query:$site/*[@@name='Data']/*[@@templatename='{Name} Folder']`

## Page branches

| Branch | Arranges |
| --- | --- |
| Property showcase | Hero, listing of properties, enquiry CTA, contact |
| Retail catalogue | Hero, promo, product listing, offer card |
| Campaign launch | Hero, rich text, testimonial, CTA |

Listing and Detail fields: Title, Image, Summary, Tags, Link, Body. A property, a product, and a campaign offer are the same templates.
