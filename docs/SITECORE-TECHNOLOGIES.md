# Sitecore Technologies Reference

This document provides an overview of the key Sitecore technologies used in this project.

---

## Table of Contents

1. [Sitecore XM Cloud](#sitecore-xm-cloud)
2. [Content SDK](#content-sdk)
3. [Headless JSS](#headless-jss)
4. [Sitecore AI](#sitecore-ai)
5. [SXA (Sitecore Experience Accelerator)](#sxa-sitecore-experience-accelerator)

---

## Sitecore XM Cloud

### Overview

Sitecore XM Cloud is a fully managed, cloud-native Content Management System (CMS) that enables headless content delivery at scale.

### Key Features

| Feature | Description |
|---------|-------------|
| **Cloud-Native** | Fully managed SaaS platform, no infrastructure management |
| **Headless Architecture** | Content delivered via APIs, front-end framework agnostic |
| **Composable DXP** | Integrates with other Sitecore products and third-party services |
| **Pages Editor** | Visual WYSIWYG editing experience for marketers |
| **Edge Delivery** | Global CDN for fast content delivery |
| **Multi-Site** | Host multiple sites from a single instance |

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        XM Cloud Platform                         │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Authoring     │   Edge API      │   Experience Edge           │
│   Environment   │   (GraphQL)     │   (Global CDN)              │
└────────┬────────┴────────┬────────┴──────────────┬──────────────┘
         │                 │                       │
         ▼                 ▼                       ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│  Content Editor │ │  Editing Host   │ │  Production Rendering   │
│  (Pages/CE)     │ │  (Preview)      │ │  Host (Next.js)         │
└─────────────────┘ └─────────────────┘ └─────────────────────────┘
```

### Documentation Links

- [XM Cloud Overview](https://doc.sitecore.com/xmc/en/developers/xm-cloud/xm-cloud-overview.html)
- [Getting Started](https://doc.sitecore.com/xmc/en/developers/xm-cloud/getting-started-with-xm-cloud.html)
- [Deploy a Project](https://doc.sitecore.com/xmc/en/developers/xm-cloud/deploy-a-project-and-environment.html)

---

## Content SDK

### Overview

The **Sitecore Content SDK** (formerly JSS SDK) is the modern way to build headless applications with Sitecore XM Cloud. It provides a framework-agnostic approach to fetching and rendering Sitecore content.

### Key Features

| Feature | Description |
|---------|-------------|
| **Framework Agnostic** | Works with Next.js, React, Vue, Angular, etc. |
| **GraphQL-First** | Uses GraphQL for efficient data fetching |
| **Layout Service** | Fetches page layout and component data |
| **Component Mapping** | Maps Sitecore renderings to front-end components |
| **Editing Support** | Full support for Pages and Experience Editor |
| **Personalization** | Integrates with Sitecore Personalize |
| **Search** | `useSearch` and `useInfiniteSearch` in `@sitecore-content-sdk/nextjs/search` (new CLI apps) |

### Scaffold a new app

Use the Content SDK CLI for an empty Next.js head that includes the new search APIs:

```bash
npx create-content-sdk-app nextjs
```

Or pin the latest initializer:

```bash
npx create-content-sdk-app@latest nextjs
```

Then add the app to a SitecoreAI project (this repo via `xmcloud.build.json`, or a dedicated head repo). See [Create a Content SDK app locally](https://doc.sitecore.com/sai/en/developers/content-sdk/20/en/create-a-content-sdk-app-locally.html).

### How It Works

```typescript
// 1. Define your component
import { Text, RichText, Image } from '@sitecore-content-sdk/nextjs';

const HeroBanner = ({ fields }) => (
  <div className="hero-banner">
    <Image field={fields.image} />
    <Text tag="h1" field={fields.title} />
    <RichText field={fields.description} />
  </div>
);

// 2. Register with component factory
const componentFactory = new Map();
componentFactory.set('HeroBanner', HeroBanner);

// 3. Content SDK handles the rest
// - Fetches layout from Sitecore
// - Maps components automatically
// - Enables inline editing
```

### Core Packages

| Package | Purpose |
|---------|---------|
| `@sitecore-content-sdk/core` | Core functionality and types |
| `@sitecore-content-sdk/nextjs` | Next.js integration and components |
| `@sitecore-content-sdk/react` | React components and hooks |

### Field Helpers

```typescript
import { 
  Text,           // Editable text fields
  RichText,       // Rich text/HTML content
  Image,          // Image fields with lazy loading
  Link,           // Link fields
  DateField,      // Date/time fields
  File,           // File download fields
  Placeholder     // Dynamic placeholder areas
} from '@sitecore-content-sdk/nextjs';
```

### GraphQL Queries

The Content SDK uses GraphQL to fetch data from Sitecore Edge:

```graphql
query LayoutQuery($siteName: String!, $path: String!, $language: String!) {
  layout(site: $siteName, routePath: $path, language: $language) {
    item {
      rendered
    }
  }
}
```

### Documentation Links

- [Content SDK Overview](https://doc.sitecore.com/xmc/en/developers/content-sdk/sitecore-content-sdk-for-xm-cloud.html)
- [Create a Content SDK app locally](https://doc.sitecore.com/sai/en/developers/content-sdk/20/en/create-a-content-sdk-app-locally.html) (`npx create-content-sdk-app nextjs`)
- [Search hooks](https://doc.sitecore.com/sai/en/developers/content-sdk/20/search-hooks-for-react-and-next-js.html)
- [Getting Started with Next.js](https://doc.sitecore.com/xmc/en/developers/content-sdk/getting-started-with-the-sitecore-content-sdk-for-nextjs.html)
- [Component Development](https://doc.sitecore.com/xmc/en/developers/content-sdk/component-development.html)

---

## Headless JSS

### Overview

**Sitecore JSS (JavaScript Services)** is the predecessor to Content SDK and provides the foundation for building JavaScript-based headless applications with Sitecore.

### Evolution: JSS → Content SDK

| JSS (Legacy) | Content SDK (Current) |
|--------------|----------------------|
| `@sitecore-jss/sitecore-jss-nextjs` | `@sitecore-content-sdk/nextjs` |
| Layout Service REST API | GraphQL-first approach |
| Experience Editor focus | Pages editor optimized |
| XM/XP compatible | XM Cloud native |

### Key Concepts

#### 1. Component Factory

Maps Sitecore rendering names to React components:

```typescript
// componentFactory.ts
import dynamic from 'next/dynamic';

const components = new Map<string, React.ComponentType>();

// Static import
components.set('ContentBlock', ContentBlock);

// Dynamic import (code splitting)
components.set('ProductListing', dynamic(() => import('./ProductListing')));

export default components;
```

#### 2. Placeholders

Dynamic areas where components are placed:

```tsx
import { Placeholder } from '@sitecore-content-sdk/nextjs';

const Layout = ({ rendering }) => (
  <div className="layout">
    <header>
      <Placeholder name="header" rendering={rendering} />
    </header>
    <main>
      <Placeholder name="main" rendering={rendering} />
    </main>
    <footer>
      <Placeholder name="footer" rendering={rendering} />
    </footer>
  </div>
);
```

#### 3. Layout Service

Fetches page structure and component data:

```typescript
// Automatic via Content SDK
const layoutData = await layoutService.fetchLayout({
  siteName: 'brother',
  itemPath: '/products/printers',
  language: 'en'
});
```

#### 4. Dictionary Service

Manages translations and localized strings:

```typescript
const dictionaryService = new GraphQLDictionaryService({
  siteName: 'brother',
  clientFactory
});

const phrases = await dictionaryService.fetchDictionary('en');
// { "Learn More": "Learn More", "Add to Cart": "Add to Cart" }
```

### Project Structure (JSS/Content SDK)

```
src/
├── components/           # Sitecore components
│   ├── HeroBanner/
│   │   └── HeroBanner.tsx
│   └── ProductListing/
│       └── ProductListing.tsx
├── pages/
│   ├── [[...path]].tsx  # Catch-all route for Sitecore pages
│   └── api/
│       └── editing/     # Editing integration endpoints
├── lib/
│   └── component-factory.ts
└── Layout.tsx           # Main layout wrapper
```

### Documentation Links

- [JSS Documentation](https://doc.sitecore.com/xmc/en/developers/jss/latest/jss-xmc/sitecore-javascript-rendering-sdk--jss--for-xm-cloud.html)
- [Migrating to Content SDK](https://doc.sitecore.com/xmc/en/developers/content-sdk/migrating-from-jss-to-content-sdk.html)

---

## Sitecore AI

### Overview

**Sitecore AI** provides artificial intelligence capabilities integrated into the Sitecore platform, enabling content automation, personalization, and intelligent assistance.

### Key Features

| Feature | Description |
|---------|-------------|
| **Content Generation** | AI-assisted content creation and optimization |
| **Auto Personalization** | ML-driven personalization without rules |
| **Image Recognition** | Automatic tagging and alt text generation |
| **Search Enhancement** | Semantic search and recommendations |
| **Clone a Site** | AI-assisted site duplication |

### Clone a Site

New verticals in this repo are cloned from an existing site (often FormaLux) inside `/sitecore/content/industry-verticals/`. Steps, rendering-host copy, and `xmcloud.build.json` registration are in [SITE-CLONING-GUIDE.md](./SITE-CLONING-GUIDE.md).

**What gets cloned:**

| Item type | Example source | Example destination |
|-----------|----------------|---------------------|
| Site root | `/sitecore/content/industry-verticals/forma-lux` | `/sitecore/content/industry-verticals/{new-site}` |
| Media | `/sitecore/media library/.../forma-lux` | matching folder for the new site |
| Settings | Site Grouping, language settings | new site-specific settings |
| Pages | Home and child pages | cloned page structure |

### AI-Powered Features in XM Cloud

#### 1. Content Assist
- Generate headlines, descriptions, and copy
- Optimize content for SEO
- Translate content across languages

#### 2. Image Optimization
- Auto-generate alt text
- Smart cropping suggestions
- Image tagging for search

#### 3. Personalization
- Automatic audience segmentation
- Content recommendations
- A/B testing optimization

### Using Sitecore AI in Development

```typescript
// Example: AI-enhanced component
const ProductDescription = ({ fields, aiSuggestions }) => (
  <div>
    <RichText field={fields.description} />
    {aiSuggestions && (
      <div className="ai-suggestions">
        <h4>AI Suggestions:</h4>
        <ul>
          {aiSuggestions.map(s => <li key={s.id}>{s.text}</li>)}
        </ul>
      </div>
    )}
  </div>
);
```

### Documentation Links

- [Sitecore AI Overview](https://doc.sitecore.com/xmc/en/users/xm-cloud/sitecore-ai.html)
- [Clone a Site](https://doc.sitecore.com/sai/en/developers/sitecoreai/clone-a-site.html)
- [AI Content Generation](https://doc.sitecore.com/xmc/en/users/xm-cloud/ai-content-generation.html)

---

## SXA (Sitecore Experience Accelerator)

### Overview

**SXA** provides pre-built components, themes, and site management capabilities that accelerate Sitecore development.

### Key Features in XM Cloud

| Feature | Description |
|---------|-------------|
| **Site Templates** | Pre-configured site structures |
| **Headless Variants** | Component styling without code changes |
| **Partial Designs** | Reusable page sections (headers, footers) |
| **Page Designs** | Template layouts for page types |
| **Themes** | CSS/styling management |
| **Multi-Site** | Manage multiple sites from one tenant |

### SXA in This Project

All verticals use SXA type in `xmcloud.build.json`:

```json
{
  "brother": {
    "type": "sxa",  // SXA-enabled site
    "path": "./industry-verticals/brother"
  }
}
```

### Partial Designs

Reusable sections across pages:

```
/sitecore/content/brother/Presentation/Partial Designs/
├── Header
├── Footer
├── Sidebar
└── Newsletter Signup
```

### Page Designs

Page-level layouts:

```
/sitecore/content/brother/Presentation/Page Designs/
├── Home Page
├── Product Listing Page
├── Product Detail Page
├── Article Page
└── Contact Page
```

**Template to design mapping** (on the Page Designs folder item) uses this field source query:

```
query:$templates||query:$pageDesigns//*[@@templatename='Page Design']
```

- `$templates` → site **Settings → Templates** (e.g. `/sitecore/templates/Project/{site}`)
- `$pageDesigns` → site **Presentation → Page Designs** folder
- Left side of `||` → page templates; right side → page design items

If the template dropdown shows unrelated system entries (PowerShell, Folder, …), `$templates` is not resolving — usually **Settings** is on the wrong template or **Templates** path is empty. See [SITECORE-SITE-SHELL.md](./SITECORE-SITE-SHELL.md).

### Component Variants

Style variations without code:

```
Header Component
├── Default (standard header)
├── Transparent (overlay on hero)
├── Sticky (fixed on scroll)
└── Minimal (logo + menu only)
```

### Documentation Links

- [SXA for XM Cloud](https://doc.sitecore.com/xmc/en/developers/xm-cloud/sitecore-experience-accelerator.html)
- [Creating Sites](https://doc.sitecore.com/xmc/en/developers/xm-cloud/creating-a-site-using-sxa.html)
- [Headless Variants](https://doc.sitecore.com/xmc/en/developers/xm-cloud/headless-variants.html)

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **CMS** | Sitecore XM Cloud | Content management and authoring |
| **Delivery** | Experience Edge | Global CDN and GraphQL API |
| **Framework** | Next.js 14+ | React-based rendering |
| **SDK** | Sitecore Content SDK | Sitecore integration |
| **Styling** | Tailwind CSS + Shadcn | UI components and utilities |
| **AI** | Sitecore AI | Content automation and assistance |
| **Accelerator** | SXA | Pre-built components and themes |

---

## Quick Reference: Common Tasks

### Fetch Page Data

```typescript
import { getStaticProps } from '@sitecore-content-sdk/nextjs';

export const getServerSideProps = async (context) => {
  const props = await getStaticProps(context, {
    site: 'brother',
    language: 'en'
  });
  return { props };
};
```

### Create a New Component

```typescript
// 1. Create component file
// src/components/EcoProBanner/EcoProBanner.tsx

import { Text, Image, Link } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/types';

interface EcoProBannerProps extends ComponentProps {
  fields: {
    title: TextField;
    description: RichTextField;
    ctaLink: LinkField;
    backgroundImage: ImageField;
  };
}

export const EcoProBanner = ({ fields }: EcoProBannerProps) => (
  <section className="eco-pro-banner">
    <Image field={fields.backgroundImage} />
    <Text tag="h2" field={fields.title} />
    <RichText field={fields.description} />
    <Link field={fields.ctaLink} className="cta-button" />
  </section>
);

export default EcoProBanner;
```

### Register Component

```typescript
// src/lib/component-factory.ts
import EcoProBanner from '@/components/EcoProBanner/EcoProBanner';

components.set('EcoProBanner', EcoProBanner);
```

---

## Additional Resources

### Official Documentation
- [Sitecore XM Cloud Docs](https://doc.sitecore.com/xmc/en/developers/xm-cloud/)
- [Content SDK Docs](https://doc.sitecore.com/xmc/en/developers/content-sdk/)
- [Sitecore AI Docs](https://doc.sitecore.com/sai/en/developers/sitecoreai/)

### Learning Resources
- [Sitecore Learning](https://learning.sitecore.com/)
- [Sitecore Community](https://community.sitecore.com/)
- [XM Cloud Starter Kits](https://github.com/sitecorelabs)

### Tools
- [Sitecore CLI](https://doc.sitecore.com/xmc/en/developers/xm-cloud/sitecore-command-line-interface.html)
- [Sitecore PowerShell Extensions](https://doc.sitecore.com/xmc/en/developers/xm-cloud/sitecore-powershell-extensions.html)

