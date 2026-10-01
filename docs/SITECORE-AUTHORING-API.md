# Sitecore Authoring & Management API Guide

This document covers how to use the **Sitecore Authoring and Management API** to programmatically manage templates, items, and content in XM Cloud.

---

## Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Authentication](#authentication)
4. [Template Operations](#template-operations)
5. [Item Operations](#item-operations)
6. [Integration with Workflow](#integration-with-workflow)
7. [Sample Prompts](#sample-prompts)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What is the Authoring API?

The **Sitecore Authoring and Management API** provides REST endpoints for programmatic content management in XM Cloud. Unlike the Marketer MCP (which uses natural language), the Authoring API gives you direct control over:

- **Templates**: Get template fields, create/update templates
- **Items**: Create, read, update, delete content items
- **Media**: Upload and manage media library items
- **Languages**: Manage language versions
- **Workflow**: Control publishing workflow

### API vs MCP Comparison

| Feature | Authoring API | Marketer MCP |
|---------|---------------|--------------|
| **Interface** | REST/GraphQL | Natural Language |
| **Use Case** | Bulk operations, CI/CD | Interactive editing |
| **Authentication** | OAuth 2.0 / API Key | OAuth via Sitecore Identity |
| **Template Management** | ✅ Full CRUD | ❌ Read only |
| **Bulk Import** | ✅ Efficient | ⚠️ Sequential |
| **Automation** | ✅ CI/CD friendly | ⚠️ Requires human |

### When to Use Authoring API

- **Bulk imports**: Import 100+ products from CSV
- **Template management**: Add/modify template fields
- **CI/CD pipelines**: Automated deployments
- **Migrations**: Move content between environments
- **Scheduled updates**: Automated content refreshes

---

## API Endpoints

### Base URLs

| Environment | Base URL |
|-------------|----------|
| **XM Cloud Authoring** | `https://{your-cm-host}/sitecore/api/authoring/` |
| **Edge GraphQL** | `https://edge.sitecorecloud.io/api/graphql/v1` |
| **Management API** | `https://xmcloud-cm.sitecorecloud.io/api/management/` |

### Key Endpoints

#### Items API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/authoring/item/{id}` | Get item by ID |
| GET | `/api/authoring/item?path={path}` | Get item by path |
| POST | `/api/authoring/item` | Create new item |
| PUT | `/api/authoring/item/{id}` | Update item |
| DELETE | `/api/authoring/item/{id}` | Delete item |

#### Templates API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/authoring/template/{id}` | Get template definition |
| GET | `/api/authoring/template/{id}/fields` | Get template fields |
| POST | `/api/authoring/template` | Create template |
| PUT | `/api/authoring/template/{id}` | Update template |

#### Search API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/authoring/search?query={query}` | Search items |
| POST | `/api/authoring/search` | Advanced search |

---

## Authentication

### Method 1: OAuth 2.0 (Recommended)

Reference: [Sitecore Authoring API Authentication](https://doc.sitecore.com/sai/en/developers/sitecoreai/walkthrough--enabling-and-authorizing-requests-to-the-authoring-and-management-api.html)

#### Step 1: Register an Application

1. Go to **Sitecore Cloud Portal** → **Organization Settings**
2. Navigate to **OAuth Applications**
3. Click **Create Application**
4. Configure:
   - **Name**: `Hackathon Automation`
   - **Redirect URI**: `http://localhost:3000/callback` (for local dev)
   - **Scopes**: `content.write`, `content.read`, `templates.write`

#### Step 2: Get Client Credentials

After registration, you'll receive:
- **Client ID**: `your-client-id`
- **Client Secret**: `your-client-secret`

#### Step 3: Obtain Access Token

```bash
curl -X POST "https://auth.sitecorecloud.io/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "audience=https://api.sitecorecloud.io"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

#### Step 4: Use Token in Requests

```bash
curl -X GET "https://{cm-host}/sitecore/api/authoring/item/{id}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Method 2: API Key (Simpler)

For development, you can use an API key:

1. Create API key in Sitecore: `/sitecore/system/Settings/Services/API Keys/`
2. Use in requests:

```bash
curl -X GET "https://{cm-host}/sitecore/api/authoring/item/{id}" \
  -H "sc_apikey: YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

---

## Template Operations

### Get Template Fields

Check what fields a template has before creating items:

```bash
# Get ProductPage template fields
GET /api/authoring/template/f6e44a9e-074a-4865-987e-0c2dc00b7af5/fields

# Response
{
  "templateId": "f6e44a9e-074a-4865-987e-0c2dc00b7af5",
  "templateName": "ProductPage",
  "fields": [
    {
      "id": "...",
      "name": "Title",
      "type": "Single-Line Text",
      "section": "Content"
    },
    {
      "id": "...",
      "name": "SKU",
      "type": "Single-Line Text",
      "section": "Content"
    },
    {
      "id": "...",
      "name": "Price",
      "type": "Number",
      "section": "Content"
    }
    // ... more fields
  ]
}
```

### Create/Update Template

Add new fields to existing template:

```bash
PUT /api/authoring/template/f6e44a9e-074a-4865-987e-0c2dc00b7af5

{
  "fields": {
    "add": [
      {
        "name": "PrintWidth",
        "type": "Single-Line Text",
        "section": "Specifications"
      },
      {
        "name": "PrintResolution",
        "type": "Single-Line Text",
        "section": "Specifications"
      },
      {
        "name": "Connectivity",
        "type": "Multi-Line Text",
        "section": "Specifications"
      },
      {
        "name": "PrintSpeed",
        "type": "Single-Line Text",
        "section": "Specifications"
      },
      {
        "name": "Features",
        "type": "Multi-Line Text",
        "section": "Specifications"
      }
    ]
  }
}
```

### Verify Template Update

```bash
GET /api/authoring/template/f6e44a9e-074a-4865-987e-0c2dc00b7af5/fields

# Should now include the new Specifications section with printer fields
```

---

## Item Operations

### Create Item

Create a new product from CSV data:

```bash
POST /api/authoring/item

{
  "itemName": "QL-810W-Wireless-Label-Printer",
  "templateId": "f6e44a9e-074a-4865-987e-0c2dc00b7af5",
  "parentId": "281f37ed-e425-4126-837a-27518ef83ceb",
  "language": "en",
  "fields": {
    "Title": "QL-810W Wireless Label Printer",
    "SKU": "QL-810W",
    "ShortDescription": "Versatile and easy to use, print labels with black and red text",
    "PrintWidth": "Up to 62mm",
    "PrintResolution": "Up to 300dpi",
    "Connectivity": "USB and Wi-Fi connectivity with AirPrint support",
    "Features": "Print on pre sized labels, Built-in label editing software, Print in black and red without needing ink or toner, Integrated cutter"
  }
}
```

Response:
```json
{
  "itemId": "new-item-guid",
  "itemName": "QL-810W-Wireless-Label-Printer",
  "path": "/sitecore/content/industry-verticals/brother/Home/Products/Labelling-and-Receipts/Desktop-Label-Printers/QL-810W-Wireless-Label-Printer",
  "created": true
}
```

### Update Item

```bash
PUT /api/authoring/item/{itemId}

{
  "language": "en",
  "fields": {
    "Price": 192.00,
    "SalePrice": 160.00
  }
}
```

### Bulk Create Items

For multiple products:

```bash
POST /api/authoring/items/bulk

{
  "items": [
    {
      "itemName": "QL-810W",
      "templateId": "f6e44a9e-074a-4865-987e-0c2dc00b7af5",
      "parentId": "...",
      "fields": { ... }
    },
    {
      "itemName": "TD-2120N",
      "templateId": "f6e44a9e-074a-4865-987e-0c2dc00b7af5",
      "parentId": "...",
      "fields": { ... }
    }
    // ... more items
  ]
}
```

---

## Integration with Workflow

### Full Automation Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 AUTHORING API INTEGRATION                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. DESIGN PHASE (Figma MCP)                                           │
│     └─→ Extract design specs, component structure                       │
│                                                                         │
│  2. TEMPLATE UPDATE (Authoring API)                                     │
│     └─→ Check if ProductPage has required fields                        │
│     └─→ Add missing fields (PrintWidth, Connectivity, etc.)             │
│                                                                         │
│  3. CONTENT CREATION (Authoring API)                                    │
│     └─→ Parse CSV data from docs/product/                               │
│     └─→ Bulk create items via API                                       │
│     └─→ Set field values from CSV columns                               │
│                                                                         │
│  4. CODE SYNC (GitHub MCP)                                              │
│     └─→ Update TypeScript types to match template                       │
│     └─→ Create PR with component changes                                │
│                                                                         │
│  5. PUBLISH (Authoring API)                                             │
│     └─→ Publish items to Edge                                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Environment Configuration

Add to `.cursor/environment.json`:

```json
{
  "snapshot": "POPULATED_FROM_SETTINGS",
  "install": "npm install",
  "env": {
    "SITECORE_CM_HOST": "https://xmc-your-instance.sitecorecloud.io",
    "SITECORE_CLIENT_ID": "your-client-id",
    "SITECORE_CLIENT_SECRET": "your-client-secret"
  }
}
```

Add secrets to **Cursor Settings → Cloud Agents → Secrets**:
- `SITECORE_CLIENT_ID`
- `SITECORE_CLIENT_SECRET`

---

## Sample Prompts

### Prompt 1: Check Template Fields

```
Using the Sitecore Authoring API:

1. Get the ProductPage template (ID: f6e44a9e-074a-4865-987e-0c2dc00b7af5)
2. List all current fields
3. Compare with the fields in src/types/products.ts
4. Identify any fields that exist in TypeScript but not in Sitecore

API: GET /api/authoring/template/{id}/fields
Auth: Bearer token from OAuth flow
```

### Prompt 2: Add Missing Template Fields

```
Using the Sitecore Authoring API:

The ProductPage template is missing these fields for printer products:
- PrintWidth (Single-Line Text)
- PrintResolution (Single-Line Text)
- Connectivity (Multi-Line Text)
- PrintSpeed (Single-Line Text)
- Features (Multi-Line Text)

1. Authenticate using OAuth client credentials
2. Call PUT /api/authoring/template/{id} to add fields
3. Verify the fields were added
4. Update src/types/products.ts to match

Template ID: f6e44a9e-074a-4865-987e-0c2dc00b7af5
```

### Prompt 3: Bulk Import Products

```
Using the Sitecore Authoring API:

Import all products from docs/product/brother-desktop-label-printers.csv:

1. Authenticate with OAuth
2. Parse CSV file
3. For each row, create item via POST /api/authoring/item:
   - Template: ProductPage (f6e44a9e-074a-4865-987e-0c2dc00b7af5)
   - Parent: Desktop-Label-Printers category
   - Map CSV columns to Sitecore fields

Field mapping:
- Name → Title (also use to generate itemName slug)
- SKU → SKU
- Description → ShortDescription
- Price (Ex VAT) → Price (parse number, remove £)
- Print Width → PrintWidth
- Print Resolution → PrintResolution
- Connectivity → Connectivity
- Print Speed → PrintSpeed
- Features → Features

4. Log results: created/failed items
5. Publish created items
```

### Prompt 4: Sync Template with TypeScript

```
Ensure Sitecore template and TypeScript types are in sync:

1. GET template fields from Authoring API
2. Read src/types/products.ts
3. For each TypeScript field not in template:
   - Add field via PUT /api/authoring/template
4. For each template field not in TypeScript:
   - Add to Product interface

Template ID: f6e44a9e-074a-4865-987e-0c2dc00b7af5
TypeScript file: industry-verticals/brother/src/types/products.ts
```

---

## Troubleshooting

### Authentication Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid/expired token | Refresh OAuth token |
| `403 Forbidden` | Missing scopes | Check app has `content.write` scope |
| `Invalid client_id` | Wrong credentials | Verify client ID in Cloud Portal |

### API Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `404 Template not found` | Wrong template ID | Verify GUID in Sitecore |
| `400 Invalid field type` | Type mismatch | Check Sitecore field types |
| `409 Item exists` | Duplicate name | Use unique itemName |

### Rate Limiting

The Authoring API has rate limits:
- **100 requests/minute** for item operations
- **10 requests/minute** for template operations

For bulk imports, use batch endpoints or add delays:

```typescript
// Add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

for (const product of products) {
  await createItem(product);
  await delay(600); // 600ms = max 100 req/min
}
```

---

## Code Examples

### TypeScript Client

```typescript
// lib/sitecore-authoring-client.ts

interface AuthToken {
  access_token: string;
  expires_in: number;
}

interface CreateItemRequest {
  itemName: string;
  templateId: string;
  parentId: string;
  language: string;
  fields: Record<string, any>;
}

class SitecoreAuthoringClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(cmHost: string) {
    this.baseUrl = `${cmHost}/sitecore/api/authoring`;
  }

  async authenticate(clientId: string, clientSecret: string): Promise<void> {
    const response = await fetch('https://auth.sitecorecloud.io/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        audience: 'https://api.sitecorecloud.io'
      })
    });
    
    const data: AuthToken = await response.json();
    this.token = data.access_token;
  }

  async getTemplateFields(templateId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/template/${templateId}/fields`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async createItem(request: CreateItemRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/item`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    return response.json();
  }

  async updateItem(itemId: string, fields: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/item/${itemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ language: 'en', fields })
    });
    return response.json();
  }
}

export default SitecoreAuthoringClient;
```

### CSV Import Script

```typescript
// scripts/import-products.ts

import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import SitecoreAuthoringClient from './lib/sitecore-authoring-client';

const TEMPLATE_ID = 'f6e44a9e-074a-4865-987e-0c2dc00b7af5';
const PARENT_ID = '281f37ed-e425-4126-837a-27518ef83ceb';

async function importProducts() {
  const client = new SitecoreAuthoringClient(process.env.SITECORE_CM_HOST!);
  await client.authenticate(
    process.env.SITECORE_CLIENT_ID!,
    process.env.SITECORE_CLIENT_SECRET!
  );

  // Read CSV
  const csv = fs.readFileSync('docs/product/brother-desktop-label-printers.csv', 'utf-8');
  const records = parse(csv, { columns: true, skip_empty_lines: true });

  // Import each product
  for (const record of records) {
    const itemName = record.Name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const result = await client.createItem({
      itemName,
      templateId: TEMPLATE_ID,
      parentId: PARENT_ID,
      language: 'en',
      fields: {
        Title: record.Name,
        SKU: record.SKU,
        ShortDescription: record.Description,
        Price: parseFloat(record['Price (Ex VAT)']?.replace('£', '') || '0'),
        PrintWidth: record['Print Width'],
        PrintResolution: record['Print Resolution'],
        Connectivity: record.Connectivity,
        PrintSpeed: record['Print Speed'],
        Features: record.Features
      }
    });

    console.log(`Created: ${record.Name} → ${result.itemId}`);
    
    // Rate limit delay
    await new Promise(resolve => setTimeout(resolve, 600));
  }
}

importProducts().catch(console.error);
```

---

## Related Documentation

- [Sitecore Authoring API Walkthrough](https://doc.sitecore.com/sai/en/developers/sitecoreai/walkthrough--enabling-and-authorizing-requests-to-the-authoring-and-management-api.html)
- [Sitecore AI MCP Setup](./SITECORE-AI-MCP-SETUP.md)
- [Sitecore Technologies Reference](./SITECORE-TECHNOLOGIES.md)

---

---

*Document created: January 30, 2026*
