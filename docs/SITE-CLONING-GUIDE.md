# Site Cloning Guide

Worked example: clone FormaLux to a new site named **visitlondon**. That name is only an example. It is not a host in this repository. Use your own site key in every step below.

---

## Overview

Creating a new site in the Industry Verticals repository involves two main parts:

1. **Sitecore Content Tree Clone** - Clone the site structure, content, and settings in Sitecore
2. **Rendering Host Creation** - Create the Next.js front-end application

---

## Prerequisites

- Access to Sitecore XM Cloud environment
- Sitecore PowerShell Extensions (SPE) access
- Git repository access
- Node.js 22.11.0+

---

## Part 1: Sitecore Content Tree Clone

### Method 1: Using Sitecore AI Clone Site Feature (Recommended)

The easiest way to clone a site is using the built-in Sitecore AI Clone Site feature.

**Reference:** [Sitecore AI - Clone a Site](https://doc.sitecore.com/sai/en/developers/sitecoreai/clone-a-site.html)

#### Steps:

1. **Navigate to Channels** in SitecoreAI
2. Click the **three dots** on the source site (e.g., Forma Lux)
3. Select **Clone Site**
4. Enter the new site details:
   - **Site Name:** `visitlondon` (lowercase, no spaces)
   - **Display Name:** `Visit London`
5. Click **Clone**
6. Wait for the cloning process to complete

This will create:
- Site root item
- Home page structure
- Data folder with datasources
- Dictionary items
- Presentation settings
- Media library folder

### Method 2: Using PowerShell Script

For more control, you can use Sitecore PowerShell Extensions:

1. **Open PowerShell ISE** in Sitecore (Sitecore menu > PowerShell ISE)
2. Run the following script:

```powershell
# Clone Site Script
$sourceSiteName = "forma-lux"
$targetSiteName = "visitlondon"
$targetDisplayName = "Visit London"

# Source paths
$sourceContentPath = "/sitecore/content/industry-verticals/$sourceSiteName"
$sourceMediaPath = "/sitecore/media library/Project/industry-verticals/$sourceSiteName"

# Target paths
$targetContentPath = "/sitecore/content/industry-verticals/$targetSiteName"
$targetMediaPath = "/sitecore/media library/Project/industry-verticals/$targetSiteName"

# Clone content tree
Write-Host "Cloning content tree..."
Copy-Item -Path $sourceContentPath -Destination $targetContentPath -Recurse

# Clone media library
Write-Host "Cloning media library..."
Copy-Item -Path $sourceMediaPath -Destination $targetMediaPath -Recurse

# Update site settings
$settingsItem = Get-Item -Path "$targetContentPath/Settings"
$settingsItem."App Name" = $targetSiteName
$settingsItem | Save-Item

Write-Host "Clone complete: $targetSiteName"
```

---

## Part 2: Configure Site Settings

After cloning, update the site configuration:

### 2.1 Update App Name

1. Navigate to `/sitecore/content/industry-verticals/visitlondon/Settings`
2. Set the **App Name** field to: `visitlondon`
3. Save the item

### 2.2 Update Site Grouping and preferred editing host

1. In **Content Editor**, navigate to the site grouping item for your clone, for example:  
   `/sitecore/content/industry-verticals/visitlondon/Settings/Site Grouping/visitlondon`  
   (path pattern: `…/industry-verticals/<site-key>/Settings/Site Grouping/<site-key>`).

2. Verify or update the **RenderingHost** field so it matches your rendering host key (same as the `renderingHosts` entry in `xmcloud.build.json`), for example `visitlondon`.

3. Update the **Hostname** field if your environment requires a specific host.

4. **Preferred editing host (Content Editor)** — in the **Settings** section, set **Predefined application editing host** to the **exact** editing host name you created in **SitecoreAI Deploy** (XM Cloud Deploy). This ties the site definition to that host for editing (Pages, Experience Editor, and related flows). It must match **case-sensitively** (for example `demosite`, `visitlondon`).

5. Save the item.

![Predefined application editing host in Content Editor](./assets/sitecore-predefined-application-editing-host.png)

### 2.3 Update Site Definition

Verify the site definition has the correct values:

| Field | Value |
|-------|-------|
| Site Name | `visitlondon` |
| App Name | `visitlondon` |
| Rendering Host | `visitlondon` |
| Predefined application editing host | Same as editing host in Deploy (e.g. `visitlondon`) |
| Language | `en` |

---

## Part 3: Create Rendering Host

### 3.1 Clone the Directory

Copy an existing rendering host as a starting point:

```powershell
# From repository root
Copy-Item -Path "industry-verticals/retail" -Destination "industry-verticals/visitlondon" -Recurse
```

Or clone from another vertical that better matches your needs (e.g., `travel` for tourism sites).

### 3.2 Update Package.json

Edit `industry-verticals/visitlondon/package.json`:

```json
{
  "name": "visitlondon",
  "description": "Visit London - London's Official Visitor Guide demo site",
  ...
}
```

### 3.3 Create Environment File

Create `industry-verticals/visitlondon/.env.local`:

```env
NEXT_PUBLIC_DEFAULT_SITE_NAME=visitlondon
SITECORE_EDGE_CONTEXT_ID=your-context-id
NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID=your-context-id
SITECORE_EDITING_SECRET=your-editing-secret
```

### 3.4 Update Styling (Optional)

Customize the brand styling in:
- `src/assets/base/variables.css` - Colors, fonts, spacing
- `src/assets/base/base.css` - Base element styles
- `src/assets/main.css` - Font imports

### 3.5 Update README

Update `industry-verticals/visitlondon/README.md` with site-specific information.

---

## Part 4: Register Rendering Host

### 4.1 Update xmcloud.build.json

Add the new rendering host to `xmcloud.build.json`:

```json
{
  "renderingHosts": {
    "visitlondon": {
      "path": "./industry-verticals/visitlondon",
      "nodeVersion": "22.11.0",
      "jssDeploymentSecret": "YOUR_SECRET_HERE",
      "enabled": true,
      "type": "sxa",
      "buildCommand": "build",
      "runCommand": "next:start"
    }
  }
}
```

### 4.2 Add to Post Actions (Optional)

If you want content serialization, add to the `scsModules` array:

```json
{
  "postActions": {
    "actions": {
      "scsModules": {
        "modules": [
          "Project.VisitLondon-Content",
          "Project.VisitLondon-Media"
        ]
      }
    }
  }
}
```

### 4.3 Add Editing Host in XM Cloud Deploy

After your new rendering host entry (for example `legal`) is added to `xmcloud.build.json` and pushed to your repository, add a corresponding **Editing host** in XM Cloud Deploy:

1. In the Sitecore Cloud Portal, open **XM Cloud Deploy** for your project.
2. Go to the **Editing hosts** tab.
3. Click **Add editing host**.
4. Enter the **Editing host name** (for example `legal`, matching the key in `xmcloud.build.json`).
5. Select the correct **Authoring environment**, **GitHub account**, **Repository**, and **Branch**.
6. (Optional) Enable **Auto deploy on push to repository**.
7. Click **Save** to create the editing host.

For reference, the dialog should look similar to this:

![Add editing host in XM Cloud Deploy](./assets/xmcloud-deploy-add-editing-host.png)

### 4.4 Add variables for the new host (XM Cloud Deploy)

After the editing host is created, add the required environment variables for your site:

1. Open the editing host (for example `demosite`).
2. Go to the **Variables** tab.
3. Add the required variables (for example, search variables if your site uses search).
4. Click **Save**.

For reference, the Variables screen looks like this:

![Editing host variables in XM Cloud Deploy](./assets/xmcloud-deploy-host-variables.png)

### 4.5 Rendering Host item fields in Sitecore

When the Editing host is created, XM Cloud automatically creates a corresponding **Rendering Host** item under:

- `/sitecore/system/Settings/Services/Rendering Hosts/<app-name>`

For headless Next.js apps using the Content SDK (as in this repo), you normally do **not** need to manually edit the server-side rendering fields. If you do need (or want) to configure them explicitly, you can use the following patterns (replace `<host>` with your deployed app URL, for example your Vercel/XM Cloud app host):

- **Server side rendering engine endpoint URL**  
  - `https://<host>/api/editing/render`
- **Server side rendering engine application URL**  
  - `https://<host>/`
- **Server side rendering engine configuration URL**  
  - `https://<host>/api/editing/config`
- **Application name**  
  - The app name / site key (for example `legal`, `visitlondon`, etc.), matching `NEXT_PUBLIC_DEFAULT_SITE_NAME` and the `renderingHosts` key in `xmcloud.build.json`.

> In most XM Cloud scenarios, these values are populated and managed for you when you configure the Editing host. Only override them if you have a specific need (for example, a custom deployment host or on-prem/headless proxy setup).

---

## Part 5: Deploy and Verify

### 5.1 Local Testing

```powershell
cd industry-verticals/visitlondon
npm install
npm run dev
```

Visit http://localhost:3000 to verify the site loads.

### 5.2 Deploy to XM Cloud

1. Commit and push changes to your repository
2. XM Cloud Deploy will automatically build the new rendering host
3. Alternatively, manually trigger a deployment from the Deploy Portal

### 5.3 Assign Editing Host

After deployment, the editing host must match what you configured in **Part 2** (**Predefined application editing host** on the Site Grouping item) and in XM Cloud Deploy.

**Option A — SitecoreAI (Channels)** (if your workflow uses Site hosts):

1. Navigate to **Channels** in SitecoreAI
2. Select your site (for example Visit London)
3. Go to **Settings** > **Site hosts**
4. Set the **Editing host** field to the same value (for example `visitlondon`)

**Option B — Content Editor** — already covered in **§2.2**: **Settings** > **Site Grouping** > `<site-key>` > **Predefined application editing host**.

> **Important:** The editing host name is case-sensitive everywhere (Deploy portal, Content Editor, and Channels).

### 5.4 Verify in Pages Editor

1. Open the Visit London site in SitecoreAI
2. Navigate to a page
3. Click **Edit** to open in Pages
4. Verify components render correctly

---

## Part 6: Content Serialization (Optional)

To serialize content for version control:

### 6.1 Create Module Configuration

Create `authoring/items/industry-verticals/sites/visitlondon/visitlondon-content.module.json`:

```json
{
  "$schema": "../../../.sitecore/schemas/ModuleFile.schema.json",
  "namespace": "Project.VisitLondon-Content",
  "references": ["Project.IndustryVerticles"],
  "items": {
    "includes": [
      {
        "name": "visitlondon-home",
        "path": "/sitecore/content/industry-verticals/visitlondon/home",
        "scope": "DescendantsOnly",
        "allowedPushOperations": "CreateAndUpdate"
      },
      {
        "name": "visitlondon-data",
        "path": "/sitecore/content/industry-verticals/visitlondon/Data",
        "scope": "DescendantsOnly",
        "allowedPushOperations": "CreateAndUpdate"
      },
      {
        "name": "visitlondon-dictionary",
        "path": "/sitecore/content/industry-verticals/visitlondon/Dictionary",
        "scope": "DescendantsOnly",
        "allowedPushOperations": "CreateAndUpdate"
      },
      {
        "name": "visitlondon-presentation",
        "path": "/sitecore/content/industry-verticals/visitlondon/Presentation",
        "scope": "DescendantsOnly",
        "allowedPushOperations": "CreateAndUpdate"
      }
    ]
  }
}
```

### 6.2 Pull Content

```powershell
# Login to XM Cloud
dotnet sitecore cloud login

# Connect to environment
dotnet sitecore cloud environment connect --environment-id <your-env-id> --allow-write true

# Pull content
dotnet sitecore ser pull -i Project.VisitLondon-Content
```

---

## Sitecore Content Structure

After cloning, your site will have this structure:

```
/sitecore/content/industry-verticals/visitlondon/
├── Home                          ← Homepage
│   ├── [Page 1]
│   ├── [Page 2]
│   └── ...
├── Data/                         ← Shared datasources
│   ├── Hero Banners/
│   ├── Link Lists/
│   ├── Footers/
│   └── ...
├── Dictionary/                   ← Translation strings
├── Media/                        ← Content tree media references
├── Presentation/                 ← Page designs, partial designs
│   ├── Headless Variants/
│   ├── Page Designs/
│   ├── Partial Designs/
│   └── Styles/
└── Settings/                     ← Site configuration
    ├── Site Grouping/
    └── [Site Settings]
```

**Site shell templates:** Each folder above must use the correct SXA/JSS template (Dictionary Domain, MediaVirtualFolder, Presentation Folder, JSS App Settings — not JSS Data on every folder). See [SITECORE-SITE-SHELL.md](./SITECORE-SITE-SHELL.md).

---

## Checklist

### Sitecore Content (Part 1-2)
- [ ] Clone site content tree
- [ ] Clone media library items
- [ ] Update App Name in Settings
- [ ] Verify **site shell templates** (Dictionary, Media, Presentation, Settings — not all JSS Data) — [SITECORE-SITE-SHELL.md](./SITECORE-SITE-SHELL.md)
- [ ] Verify Site Grouping (RenderingHost, Hostname, **Predefined application editing host**)
- [ ] Verify Page Designs → Template to design mapping (Page → Default, etc.)
- [ ] Test pages load in Content Editor

### Rendering Host (Part 3-4)
- [ ] Clone rendering host directory
- [ ] Update package.json name and description
- [ ] Create .env.local with correct site name
- [ ] Customize branding/styling
- [ ] Update README.md
- [ ] Add to xmcloud.build.json
- [ ] Test locally with `npm run dev`

### Deployment (Part 5)
- [ ] Commit and push changes
- [ ] Deploy to XM Cloud
- [ ] Assign editing host to site
- [ ] Verify in Pages editor
- [ ] Test published site

### Serialization (Part 6 - Optional)
- [ ] Create module configuration
- [ ] Pull content to local
- [ ] Commit serialized items

### Agent inventory (same change as the host)
- [ ] Add the site to [.cursor/SITE-REGISTRY.md](../.cursor/SITE-REGISTRY.md)
- [ ] Update Available Sites in `.cursor/rules/project-context.mdc`
- [ ] Update the Industry Verticals table in [README.md](./README.md)
- [ ] Add `docs/{SITE}.md` and, if the site has its own rules, `.cursor/skills/{site}/SKILL.md` plus a row in `.cursor/AGENTS.md`

Follow `.cursor/skills/new-site-inventory/SKILL.md`.

---

## Troubleshooting

### Site Not Loading

- Verify `NEXT_PUBLIC_DEFAULT_SITE_NAME` matches the Sitecore site name exactly
- Check `SITECORE_EDGE_CONTEXT_ID` is set correctly
- Ensure the site is published in Sitecore

### Editing Host Not Working

- Verify the editing host name is case-sensitive match
- Check the rendering host is enabled in xmcloud.build.json
- Ensure deployment completed successfully

### Components Not Rendering

- Verify component map is generated (`npm run sitecore-tools:generate-map`)
- Check component names match between Sitecore and code
- Ensure datasources are properly configured

### Media Not Loading

- Check media items are published
- Verify remote patterns in next.config.js include the media domain
- Ensure Content Hub connection is configured (if using DAM)

---

## Related Documentation

- [Sitecore AI - Clone a Site](https://doc.sitecore.com/sai/en/developers/sitecoreai/clone-a-site.html)
- [XM Cloud Rendering Hosts](https://doc.sitecore.com/xmc/en/developers/xm-cloud/rendering-hosts.html)
- [Content Serialization](https://doc.sitecore.com/xmc/en/developers/xm-cloud/serialization-in-sitecore.html)
- [Deployment Guide](./DEPLOYMENT-GUIDE.md)
- [Vercel Deployment](./VERCEL-DEPLOYMENT.md)

---

_Document Version: 1.0_  
_Last Updated: February 2026_
