# Sitecore XM Cloud - Junior Developer Guide

Welcome to Sitecore development! This guide explains core concepts and helps you understand how the Industry Verticals projects work.

---

## Table of Contents

1. [What is Sitecore?](#what-is-sitecore)
2. [Key Concepts](#key-concepts)
3. [Architecture Overview](#architecture-overview)
4. [Components Explained](#components-explained)
5. [Templates & Fields](#templates--fields)
6. [Datasources](#datasources)
7. [Rendering Variants](#rendering-variants)
8. [Working with Industry Verticals](#working-with-industry-verticals)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

---

## What is Sitecore?

**Sitecore XM Cloud** is a cloud-native, headless Content Management System (CMS). Unlike traditional CMSs where the frontend and backend are tightly coupled, Sitecore uses a **headless architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SITECORE XM CLOUD                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Content   │  │  Templates  │  │    Experience Edge      │  │
│  │   Editor    │  │   & Fields  │  │    (GraphQL API)        │  │
│  └─────────────┘  └─────────────┘  └───────────┬─────────────┘  │
└───────────────────────────────────────────────│─────────────────┘
                                                │ JSON/GraphQL
                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  RENDERING HOST (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Components  │  │  Tailwind   │  │    Server/Client        │  │
│  │ (React/TSX) │  │    CSS      │  │    Rendering            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
                                    ┌─────────────────────┐
                                    │   User's Browser    │
                                    │    (HTML/CSS/JS)    │
                                    └─────────────────────┘
```

### Key Benefits

| Benefit | Description |
|---------|-------------|
| **Headless** | Frontend and backend are separate - developers use modern frameworks (Next.js) |
| **Cloud-Native** | No servers to manage - Sitecore handles infrastructure |
| **Omnichannel** | Same content can power websites, apps, kiosks, IoT devices |
| **Personalisation** | Built-in tools for A/B testing and targeted content |

---

## Key Concepts

### 1. Content Tree

Sitecore organises all content in a **tree structure** (like a file system):

```
sitecore/
├── content/
│   └── industry-verticals/
│       └── forma-lux/                ← Site Root (Retail)
│           ├── Home                  ← Homepage
│           ├── Products/             ← Products section
│           │   ├── Furniture/
│           │   │   ├── Sofas/
│           │   │   │   ├── Modern-Sofa ← Product page (uses ProductPage template)
│           │   │   │   └── ...
│           │   └── Lighting/
│           └── Data/                 ← Shared datasources (components)
│               ├── Hero Banner/
│               ├── Footer/
│               └── ...
├── templates/                        ← Content structure definitions
└── media library/                    ← Images, PDFs, videos
```

### 2. Templates

**Templates** define the structure of content items - what fields they have and what type of data each field holds.

Think of templates like **TypeScript interfaces** for your content:

```typescript
// This is conceptually what a ProductPage template defines
interface ProductPage {
  Title: string;           // single-line text
  SKU: string;             // single-line text
  Price: number;           // number
  ShortDescription: string; // multi-line text
  LongDescription: string;  // rich text (HTML)
  Image1: ImageField;       // image
  Category: Reference;      // droplink (reference to another item)
}
```

### 3. Components

**Components** are reusable building blocks for pages. In Sitecore:

- **Rendering** = The visual component (React/Next.js code)
- **Datasource** = The content that populates the component

```
┌─────────────────────────────────────────────────────┐
│                  HERO BANNER COMPONENT              │
├──────────────────────┬──────────────────────────────┤
│ RENDERING (Code)     │ DATASOURCE (Content)         │
│ HeroBanner.tsx       │ "Homepage Hero"              │
│                      │ - Title: "Welcome..."        │
│ <h1>{fields.Title}   │ - Description: "..."         │
│ <Image field={...}   │ - Image: hero.jpg            │
│                      │ - CtaLink: /products         │
└──────────────────────┴──────────────────────────────┘
```

### 4. Placeholders

**Placeholders** are slots in page layouts where components can be added:

```jsx
// A page layout with placeholders
<Layout>
  <Placeholder name="headless-header" />      {/* Header components go here */}
  <main>
    <Placeholder name="headless-main" />      {/* Main content components */}
  </main>
  <Placeholder name="headless-footer" />      {/* Footer components go here */}
</Layout>
```

Content authors can drag-and-drop components into these placeholders using Sitecore's visual editor (**Pages**). See [Out-of-the-box Components in Sitecore AI Pages](./COMPONENTS.md#out-of-the-box-components-in-sitecore-ai-pages) for the built-in Media, Navigation, Page Content, and Page Structure components and how to add them in the visual editor.

---

## Architecture Overview

### Project Structure

```
industry-verticals/
├── authoring/                          ← Sitecore serialization (YAML)
│   ├── items/                          ← Content items
│   └── src/                            ← Sitecore configuration
├── industry-verticals/                 ← Rendering hosts
│   ├── retail/                         ← Forma Lux (Retail)
│   │   ├── src/
│   │   │   ├── components/             ← React components
│   │   │   ├── assets/                 ← CSS (Tailwind)
│   │   │   └── lib/                    ← Utilities
│   │   ├── .env.local                  ← Environment config
│   │   └── package.json
│   ├── travel/                         ← SkyWings (Travel)
│   ├── healthcare/                     ← Nova Medical
│   ├── luxury-retail/                  ← Essential Living
│   ├── energy/                         ← Gridwell
│   └── starter/                        ← Minimal starter
├── docs/                               ← Documentation
└── xmcloud.build.json                  ← Deployment config
```

### Data Flow

```
1. CONTENT AUTHOR creates/edits content in Sitecore
                            │
                            ▼
2. Content stored in SITECORE CONTENT TREE
                            │
                            ▼
3. Content published to EXPERIENCE EDGE (CDN)
                            │
                            ▼
4. RENDERING HOST (Next.js) fetches via GraphQL
                            │
                            ▼
5. COMPONENTS receive data as props (fields)
                            │
                            ▼
6. Page rendered as HTML and sent to browser
```

---

## Components Explained

### Component File Structure

```
src/components/hero-banner/
├── HeroBanner.tsx              ← Main component file
└── HeroBanner.module.css       ← Optional CSS module
```

### Anatomy of a Sitecore Component

```tsx
// src/components/hero-banner/HeroBanner.tsx

import {
  Text,              // Renders editable single-line text
  RichText,          // Renders editable rich text (HTML)
  Image,             // Renders editable image
  Link,              // Renders editable link
  useSitecore,       // Hook to access Sitecore context
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

// 1. DEFINE THE FIELDS INTERFACE
//    These match the datasource template fields in Sitecore
interface Fields {
  Title: TextField;              // Maps to "Title" field
  Description: RichTextField;    // Maps to "Description" field
  Image: ImageField;             // Maps to "Image" field
  CtaLink: LinkField;            // Maps to "CtaLink" field
}

// 2. DEFINE PROPS INTERFACE
interface HeroBannerProps extends ComponentProps {
  fields: Fields;
}

// 3. CREATE THE COMPONENT
export const Default = ({ params, fields }: HeroBannerProps) => {
  const { page } = useSitecore();  // Access page mode, site info, etc.
  const { styles, RenderingIdentifier: id } = params;

  // 4. HANDLE EMPTY/EDITING STATE
  if (!fields) {
    return page.mode.isEditing ? (
      <div className="component hero-banner">
        <p>Hero Banner: No datasource selected</p>
      </div>
    ) : null;
  }

  // 5. RENDER THE COMPONENT
  return (
    <section className={`component hero-banner ${styles}`} id={id}>
      {/* Text component renders editable text */}
      <h1>
        <Text field={fields.Title} />
      </h1>
      
      {/* RichText renders HTML content */}
      <div className="description">
        <RichText field={fields.Description} />
      </div>
      
      {/* Image with responsive handling */}
      <Image field={fields.Image} className="hero-image" />
      
      {/* Link with Sitecore tracking — CtaLink must be valid on Edge (full internal link XML with target id).
          Malformed link fields render as [object Object]. See docs/SITECORE-DATASOURCE-FIELDS.md */}
      <Link field={fields.CtaLink} className="cta-button">
        Learn More
      </Link>
    </section>
  );
};
```

### Field Types Reference

| Field Type | Sitecore Type | TypeScript Type | Component |
|------------|---------------|-----------------|-----------|
| Single-Line Text | `single-line text` | `TextField` | `<Text field={...} />` |
| Multi-Line Text | `multi-line text` | `TextField` | `<Text field={...} />` |
| Rich Text | `rich text` | `RichTextField` | `<RichText field={...} />` |
| Image | `image` | `ImageField` | `<Image field={...} />` |
| Link | `general link` | `LinkField` | `<Link field={...} />` |
| Number | `number` | `Field<number>` | `{fields.Price?.value}` |
| Checkbox | `checkbox` | `Field<boolean>` | `{fields.IsActive?.value}` |
| Date | `date` | `Field<string>` | `{fields.Date?.value}` |

### Rendering Variants

Instead of creating separate components, you can create **variants** - different visual styles for the same component:

```tsx
// HeroBanner.tsx

// Default variant
export const Default = (props: HeroBannerProps) => {
  return <div className="hero-default">...</div>;
};

// Compact variant - smaller version
export const Compact = (props: HeroBannerProps) => {
  return <div className="hero-compact">...</div>;
};

// Split variant - different layout
export const Split = (props: HeroBannerProps) => {
  return <div className="hero-split">...</div>;
};
```

Content authors select variants in the Sitecore editor when adding the component.

---

## Templates & Fields

### Page Templates

Templates define what fields a page or component datasource has.

#### ProductPage Template
**ID:** `f6e44a9e-074a-4865-987e-0c2dc00b7af5`

| Field | Type | Description |
|-------|------|-------------|
| `Title` | single-line text | Product name |
| `SKU` | single-line text | Product SKU code |
| `Price` | number | Product price |
| `ShortDescription` | multi-line text | Brief description |
| `LongDescription` | rich text | Full HTML description |
| `Image1` - `Image5` | image | Product images (gallery) |
| `Category` | droplink | Reference to category |
| `Color` | treelist | Available colours |
| `Size` | treelist | Available sizes |
| `Tags` | treelist | Product tags |
| `metadataTitle` | single-line text | SEO title |
| `metadataDescription` | multi-line text | SEO description |
| `NavigationTitle` | single-line text | Menu display name |

#### ProductCategoryPage Template
**ID:** `4d2b49e6-1130-444a-b22c-5c7e25d01b56`

| Field | Type | Description |
|-------|------|-------------|
| `Title` | single-line text | Category page title |
| `CategoryName` | single-line text | Category name |
| `Content` | rich text | Category description |
| `metadataTitle` | single-line text | SEO title |
| `metadataDescription` | multi-line text | SEO description |
| `NavigationTitle` | single-line text | Menu display name |

#### ArticlePage Template
**ID:** `412bf445-b1a6-4aff-8054-0b21a1febc47`

| Field | Type | Description |
|-------|------|-------------|
| `Title` | single-line text | Article title |
| `ShortDescription` | multi-line text | Article summary |
| `Content` | rich text | Article body |
| `Image` | image | Featured image |
| `Author` | droplink | Reference to author |
| `Category` | droplink | Article category |
| `PublishedDate` | date | Publication date |
| `Tags` | treelist | Article tags |

---

## Datasources

### What is a Datasource?

A **datasource** is a content item that provides data to a component. It lives in the content tree under `/Data/`.

```
sitecore/content/industry-verticals/forma-lux/
├── Home                           ← Page
├── Products/
└── Data/                          ← Datasources folder
    ├── Hero Banner/
    │   ├── Homepage Hero          ← Datasource for homepage hero
    │   ├── Products Hero          ← Datasource for products page
    │   └── Sale Hero              ← Datasource for sale banner
    ├── Footer/
    │   └── Main Footer            ← Footer datasource
    └── ...
```

### Component Datasource Configuration

When you get component details, you'll see datasource configuration:

```json
{
  "id": "b49cf2d7-7cb2-4918-8f38-2607d956d995",
  "name": "Hero Banner",
  "datasourceTemplateId": "ac18eef2-f134-4985-8b74-6ad16cca6577",
  "datasourceTemplatePath": "Project/industry-verticals/Components/Page Content/Hero Banner/Hero Banner",
  "datasourceFields": [
    { "name": "Title", "type": "Single-Line Text" },
    { "name": "Description", "type": "Rich Text" },
    { "name": "Image", "type": "Image" },
    { "name": "Video", "type": "File" },
    { "name": "CtaLink", "type": "General Link" }
  ],
  "datasourceRequired": true,
  "datasourceAutoGenerated": false
}
```

| Property | Description |
|----------|-------------|
| `datasourceTemplateId` | Template used to create datasource items |
| `datasourceTemplatePath` | Where the template is in Sitecore |
| `datasourceFields` | Available fields for content |
| `datasourceRequired` | Must have a datasource to render |
| `datasourceAutoGenerated` | Sitecore auto-creates datasource when adding component |

---

## Working with Industry Verticals

### Cursor AI rules and skills

This repo includes agent configuration under `.cursor/`:

- **Rules** (`.cursor/rules/*.mdc`) — coding standards, XM Cloud patterns, and safety constraints applied automatically when you use Cursor Agent.
- **Skills** (`.cursor/skills/**/SKILL.md`) — step-by-step workflows for capturing reference sites and generating Sitecore TSX + YAML.

Full tables of what each rule and skill does: **[`.cursor/AGENTS.md`](../.cursor/AGENTS.md)**.

### Local Development Setup

```bash
# 1. Navigate to your chosen rendering host
cd industry-verticals/retail    # or travel, healthcare, etc.

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.remote.site .env.local
# Edit .env.local with your Edge context ID

# 4. Run development server
npm run dev

# 5. Open browser
# http://localhost:3000
```

### Environment Configuration

**`.env.local`** file:

```env
# Required
NEXT_PUBLIC_DEFAULT_SITE_NAME=forma-lux
SITECORE_EDGE_CONTEXT_ID=your-context-id-here
NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID=your-context-id-here

# For editing in Sitecore Pages
SITECORE_EDITING_SECRET=your-secret-here
```

### Key Directories

| Path | Purpose |
|------|---------|
| `src/components/` | React components (renderings) |
| `src/assets/` | Tailwind CSS files |
| `src/lib/` | Utility functions, type definitions |
| `src/hooks/` | Custom React hooks |
| `.sitecore/` | Generated Sitecore config (don't edit manually) |

---

## Common Tasks

### 1. Adding a New Component Variant

```tsx
// 1. Open the component file
// src/components/hero-banner/HeroBanner.tsx

// 2. Add your variant export
export const MyNewVariant = ({ params, fields }: HeroBannerProps) => {
  // Your custom implementation
  return (
    <section className="my-new-variant">
      <Text field={fields.Title} />
    </section>
  );
};

// 3. Variants are automatically available in Sitecore
```

### 2. Creating a New Component

```tsx
// 1. Create component folder
// src/components/my-component/

// 2. Create MyComponent.tsx
import { ComponentProps } from '@/lib/component-props';

interface Fields {
  // Define fields matching your datasource template
}

interface MyComponentProps extends ComponentProps {
  fields: Fields;
}

export const Default = ({ params, fields }: MyComponentProps) => {
  return (
    <div className={`component my-component ${params.styles}`}>
      {/* Your component JSX */}
    </div>
  );
};

// 3. Register in .sitecore/component-map.ts
// (Usually auto-generated, but may need manual update)
```

### 3. Styling with Tailwind CSS

```tsx
// Use Tailwind classes directly
<div className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark">
  Button
</div>

// CSS variables are defined in src/assets/base/variables.css
// Each site has its own brand colors
```

### 4. Working with the Sitecore AI MCP

The MCP (Model Context Protocol) lets you use AI to interact with Sitecore:

```bash
# List all pages on a site
mcp_sitecore-marketer_get_all_pages_by_site
  siteName: "forma-lux"

# Create a new page
mcp_sitecore-marketer_create_page
  templateId: "f6e44a9e-074a-4865-987e-0c2dc00b7af5"  # ProductPage
  parentId: "parent-item-id"
  name: "New-Product"
  fields: [{"Title": "New Product", "SKU": "NP-001", "Price": 199.99}]
```

See [SITECORE-AI-MCP-SETUP.md](./SITECORE-AI-MCP-SETUP.md) for setup instructions.

---

## Troubleshooting

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot find module '.sitecore/sites.json'` | Missing generated files | Run `npm run bootstrap` or create stub file |
| `Configuration error: provide Edge contextId` | Missing environment variable | Add `SITECORE_EDGE_CONTEXT_ID` to `.env.local` |
| `Component not found` | Component not registered | Check `.sitecore/component-map.ts` |
| `TypeError: Cannot read property 'value' of undefined` | Missing field data | Add null checks: `fields?.Title?.value` |

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run TypeScript check
npx tsc --noEmit
```

### Editing Mode Issues

If components don't render in Sitecore Pages editor:

1. Check `SITECORE_EDITING_SECRET` matches in Sitecore
2. Ensure component handles `page.mode.isEditing`
3. Verify datasource is configured correctly

---

## Glossary

| Term | Definition |
|------|------------|
| **Content Tree** | Hierarchical structure of all Sitecore items |
| **Datasource** | Content item that provides data to a component |
| **Experience Edge** | CDN that serves content via GraphQL API |
| **Headless** | Architecture where CMS is decoupled from presentation |
| **Item** | Any piece of content in Sitecore (page, image, datasource) |
| **Layout** | Page structure with placeholders for components |
| **Placeholder** | Slot in a layout where components can be added |
| **Rendering** | Visual component (the React/Next.js code) |
| **Rendering Host** | Frontend application (Next.js) |
| **Template** | Definition of content structure (fields and types) |
| **Variant** | Different visual style of the same component |
| **XM Cloud** | Sitecore's cloud-native CMS platform |

---

## Further Reading

- [Documentation index](./README.md)
- [Components](./COMPONENTS.md)
- [Site cloning guide](./SITE-CLONING-GUIDE.md)
- [Sitecore XM Cloud Docs](https://doc.sitecore.com/xmc/en/developers/xm-cloud/)
- [Content SDK Documentation](https://doc.sitecore.com/xmc/en/developers/content-sdk/)
- Scaffold a search-ready head: `npx create-content-sdk-app nextjs` — [create locally](https://doc.sitecore.com/sai/en/developers/content-sdk/20/en/create-a-content-sdk-app-locally.html)
- [Sitecore AI Documentation](https://doc.sitecore.com/sai/en/developers/sitecoreai/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

_Document Version: 1.3_  
_Last Updated: September 2026_
