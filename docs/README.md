# Documentation

Sitecore industry verticals: six Next.js rendering hosts under `industry-verticals/`, with shared content in `authoring/items/industry-verticals/`.

The live host list is [.cursor/SITE-REGISTRY.md](../.cursor/SITE-REGISTRY.md). When a site is added, update that registry and this page together.

## Sites

| Vertical | Folder | Site | Deploy key |
| -------- | ------ | ---- | ---------- |
| Healthcare | `industry-verticals/healthcare` | Nova Medical | `healthcare` |
| Luxury retail | `industry-verticals/luxury-retail` | Essential Living | `luxury-retail` |
| Retail | `industry-verticals/retail` | FormaLux | `nextjsstarter` |
| Starter | `industry-verticals/starter` | starter | not deployed |
| Travel | `industry-verticals/travel` | Skywings | `travel` |
| Energy | `industry-verticals/energy` | Gridwell | `energy` |

Component lists: [COMPONENTS.md](./COMPONENTS.md).

## Start here

| Doc | Use it when |
| --- | ----------- |
| [Project structure](./PROJECT-STRUCTURE.md) | You need the repo layout, serialization modules, or where a host lives |
| [Junior developer guide](./JUNIOR-DEVELOPER-GUIDE.md) | You are new to XM Cloud, templates, placeholders, or this repo |
| [Components](./COMPONENTS.md) | You need the React components in each vertical, or the Pages toolbox |

Run a site locally:

```powershell
cd industry-verticals/retail
npm install
npm run dev
```

Other hosts: `healthcare`, `luxury-retail`, `travel`, `energy`, `starter`. Open http://localhost:3000.

## Create a site

[Site cloning guide](./SITE-CLONING-GUIDE.md) — clone a vertical in Sitecore and add a rendering host under `industry-verticals/`.

Finish by updating [.cursor/SITE-REGISTRY.md](../.cursor/SITE-REGISTRY.md), this page, and [COMPONENTS.md](./COMPONENTS.md).

## Deploy

| Doc | Use it when |
| --- | ----------- |
| [Deployment guide](./DEPLOYMENT-GUIDE.md) | You are creating an XM Cloud project and editing hosts. Includes the check that every `renderingHosts` key exists in Deploy |
| [Vercel](./VERCEL-DEPLOYMENT.md) | You are hosting a vertical on Vercel |

Editing host keys must match `xmcloud.build.json`. Retail’s key is `nextjsstarter`, not `retail`.

## Sitecore reference

| Doc | Use it when |
| --- | ----------- |
| [Technologies](./SITECORE-TECHNOLOGIES.md) | You need a short map of XM Cloud, Content SDK, JSS, Sitecore AI, and SXA |
| [Site shell](./SITECORE-SITE-SHELL.md) | Dictionary, Media, Presentation, or Settings is on the wrong template |
| [Datasource fields](./SITECORE-DATASOURCE-FIELDS.md) | Links render as `[object Object]` or images are hotlinked |
| [Authoring API](./SITECORE-AUTHORING-API.md) | You are calling the Authoring and Management API |
| [Marketer MCP](./SITECORE-AI-MCP-SETUP.md) | You are connecting Cursor to Sitecore AI |
