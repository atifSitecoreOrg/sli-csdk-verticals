# Vercel Deployment Guide

Deploy Industry Verticals sites to Vercel for production hosting.

---

## Pre-requisite

> **Important:** The site must be published at least once using the **Publish** button in the Page Builder. This ensures the site is accessible via the Vercel deployment.

![Publish in Page Builder — SkyWings](./assets/skywings-publish.png)

---

## Deployment Steps

### Step 1: Log in to Vercel Dashboard

Go to [vercel.com](https://vercel.com) and log in to your account.

### Step 2: Create New Project

1. Click **Add New**
2. Select **Project**

![Vercel Add New — Project](./assets/vercel-projects.png)

### Step 3: Import Git Repository

Import the git repository that contains this Industry Verticals codebase.

![Import the Git repository](./assets/vercel-import-repository.png)

### Step 4: Configure Deployment

1. Click **Edit** to select the **Root Directory**
2. Choose one folder under `industry-verticals`. One Vercel project deploys one vertical.

Configure the following:

- **Project name:** for example `xmc-forma-lux`
- **Framework Preset:** `Next.js`
- **Root Directory:** the vertical you are deploying, for example `industry-verticals/retail`

![New Vercel project — root directory and environment variables](./assets/vercel-new-project.png)

### Step 5: Add Environment Variables

Set the following XM Cloud related variables before deployment.

#### Mandatory Variables (All Sites)

The following three variables are mandatory for all sites and can be found in the Deploy Portal:

1. Go to **Project → Environment → Developer Settings**
2. Select the correct site from the dropdown
3. Switch **Context** to **Live** (Preview is for editing; production delivery uses Live)
4. Copy these variables into Vercel. Do not commit the values.

| Variable name | Where the value comes from |
|---------------|----------------------------|
| `SITECORE_EDGE_CONTEXT_ID` | Developer Settings, Context **Live** |
| `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` | Same value as `SITECORE_EDGE_CONTEXT_ID` |
| `NEXT_PUBLIC_DEFAULT_SITE_NAME` | Site name in the Developer Settings dropdown (`forma-lux`, `skywings`, `gridwell`, `nova-medical`, `essential-living`) |

![Developer Settings — Context set to Live. Values stay in the portal.](./assets/deploy-developer-settings-live.png)

`NEXT_PUBLIC_DEFAULT_SITE_NAME` can stay empty until post actions finish. A green **Deploy completed** bar is not enough. Open the deployment log and wait until **Post actions** is complete.

![Deployment log — wait for Post actions](./assets/deploy-log-post-actions.png)

#### Search Variables (If Search is Implemented)

The following variables are mandatory only if search is implemented on the site.

One Vercel project deploys one site. Add only that site's search variables. Set `NEXT_PUBLIC_SEARCH_ENV` to `prod`. Copy the customer key, API key, and source id from your search configuration into Vercel. Do not store those values in git.

| Site | Root directory | Search variables |
|------|----------------|------------------|
| FormaLux | `industry-verticals/retail` | `NEXT_PUBLIC_SEARCH_CUSTOMER_KEY`, `NEXT_PUBLIC_SEARCH_API_KEY`, `NEXT_PUBLIC_SEARCH_SOURCE` |
| SkyWings | `industry-verticals/travel` | `NEXT_PUBLIC_SEARCH_CUSTOMER_KEY`, `NEXT_PUBLIC_SEARCH_API_KEY`, `NEXT_PUBLIC_SKYWINGS_SEARCH_SOURCE` |
| GridWell | `industry-verticals/energy` | `NEXT_PUBLIC_SEARCH_CUSTOMER_KEY`, `NEXT_PUBLIC_SEARCH_API_KEY`, `NEXT_PUBLIC_GRIDWELL_SEARCH_SOURCE` |
| Nova Medical | `industry-verticals/healthcare` | none |
| Essential Living | `industry-verticals/luxury-retail` | none |

### Step 6: Deploy

Once the environment variables are set, click **Deploy**.

After the deployment is successful, open the site from **Domains** on the project **Overview** tab. Existing vertical projects on the sitecoredemo team:

![Vercel projects for the industry verticals](./assets/vercel-projects.png)

---

## Quick Reference

### Environment Variables by Site

| Site | Root Directory | Mandatory Search Variables |
|------|----------------|---------------------------|
| FormaLux | `industry-verticals/retail` | `NEXT_PUBLIC_SEARCH_SOURCE` |
| Skywings | `industry-verticals/travel` | `NEXT_PUBLIC_SKYWINGS_SEARCH_SOURCE` |
| Gridwell | `industry-verticals/energy` | `NEXT_PUBLIC_GRIDWELL_SEARCH_SOURCE` |
| Nova Medical | `industry-verticals/healthcare` | _(none)_ |
| Essential Living | `industry-verticals/luxury-retail` | _(none)_ |

### Common Variables Checklist

All deployments require:

- [ ] `SITECORE_EDGE_CONTEXT_ID`
- [ ] `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID`
- [ ] `NEXT_PUBLIC_DEFAULT_SITE_NAME`

Sites with search also require:

- [ ] `NEXT_PUBLIC_SEARCH_ENV`
- [ ] `NEXT_PUBLIC_SEARCH_CUSTOMER_KEY`
- [ ] `NEXT_PUBLIC_SEARCH_API_KEY`
- [ ] Site-specific search source variable

---

## Troubleshooting

### Site Not Loading

- Verify the site has been published at least once in Page Builder
- Check that all environment variables are set correctly
- Ensure the Edge Context is set to **Live** when copying values for **Production**
- Root Directory must be the same vertical as `NEXT_PUBLIC_DEFAULT_SITE_NAME` (for example `industry-verticals/retail` with `forma-lux`).

### Search Not Working

- Verify all search-related environment variables are set
- Check that you're using the correct search source variable for your site
- Ensure the search source ID matches the configured source

### Build Failures

- Check the Vercel build logs for specific errors
- Verify the root directory is set correctly
- Ensure Node.js version compatibility (22.11.0+; `xmcloud.build.json` uses 24.18.0)
- If the build fails resolving files above the app folder, enable **Include files outside the root directory in the Build Step**

---

_Document Version: 1.0_  
_Last Updated: February 2026_
