---
name: scaffold-rendering-host
description: Scaffolds a new Sitecore Content SDK Next.js editing/rendering host under editing-hosts/, registers it in xmcloud.build.json renderingHosts, and prepares it for SitecoreAI Deploy. Use when creating a new Content SDK app, rendering host, editing host, or running create-content-sdk-app.
paths:
  - "editing-hosts/**"
  - "xmcloud.build.json"
---

# Scaffold a Content SDK editing host

Create a new **Content SDK** Next.js app under `editing-hosts/` at the repository root and register it as a **rendering host** in `xmcloud.build.json` so it can be deployed as a **SitecoreAI editing host**.

**Docs:**
- [Create a Content SDK app locally](https://doc.sitecore.com/sai/en/developers/content-sdk/20/create-a-content-sdk-app-locally.html)
- [Content SDK initializer parameters](https://doc.sitecore.com/sai/en/developers/content-sdk/content-sdk-initializer-parameters.html)
- [Add an editing host](https://doc.sitecore.com/sai/en/developers/sitecoreai/environment-editing-hosts-and-rendering-hosts/add-an-editing-host.html)

**Template:** [references/rendering-host.template.json](references/rendering-host.template.json)

**Related:** [`sitecore-new-collection-yaml`](../../sitecore-serialization-skills/sitecore-new-collection-yaml/SKILL.md) + [`sitecore-new-site-yaml`](../../sitecore-serialization-skills/sitecore-new-site-yaml/SKILL.md) — SCS module and YAML for the Sitecore site

**After scaffold:** [`sitecore-env-local`](../sitecore-env-local/SKILL.md) — `.env.local` from Deploy portal Developer settings

**Project isolation:** Each new host is paired with its **own** SCS module. Do not copy components, YAML, or env values from sibling `editing-hosts/` or `authoring/items/` trees — [project-isolation.md](../sitecore-component-from-design/references/project-isolation.md).

---

## When to apply

- User asks to **scaffold**, **create**, or **add** a Content SDK / rendering host / editing host
- New head app needed under `industry-verticals/` (this repo) or `editing-hosts/`
- `xmcloud.build.json` needs a new `renderingHosts` entry

---

## Step 0 — Host root

This repository’s apps live in `industry-verticals/`. Use that as `{HOST_ROOT}`.

Use `editing-hosts/` only when `industry-verticals/` has no Next.js apps and `editing-hosts/` is already the host root.

Every `editing-hosts/` path later in this skill means `{HOST_ROOT}`. `xmcloud.build.json` `path` is `./{HOST_ROOT}/{folder}`.

When the host is registered, run [`new-site-inventory`](../../new-site-inventory/SKILL.md) so [SITE-REGISTRY.md](../../../SITE-REGISTRY.md), project context, and `docs/README.md` match the new folder.

---

## Step 1 — Collect inputs

Ask only for values the user has **not** provided.

| Input | Required | Description | Example |
|-------|----------|-------------|---------|
| **Editing host name** | Yes | Key in `xmcloud.build.json` → `renderingHosts`. Must match the **Editing host name** in the SitecoreAI Deploy app. | `johnson-matthey` |
| **Rendering host folder** | Yes | Subfolder name under `editing-hosts/` where the app is created | `johnson-matthey` |

**Naming rules**

- **Editing host name** — lowercase, no spaces; unique among existing `renderingHosts` keys
- **Rendering host folder** — filesystem folder name; often same as editing host name but can differ

If the user gives only one name, use it for both unless they specify otherwise.

---

## Step 2 — Prepare `editing-hosts/` directory

From the **repository root**:

1. If `editing-hosts/` does not exist, create it.
2. If `editing-hosts/{folder}/` already exists and contains an app, **stop** and ask whether to overwrite or choose a different folder name.
3. If `editing-hosts/` exists but the target subfolder does not, proceed.

---

## Step 3 — Scaffold the Content SDK app

Run from the **repository root**. Default prerender mode is **SSG** (static site generation).

```powershell
npx create-content-sdk-app@latest nextjs --destination=./editing-hosts/{EDITINGHOSTFOLDER} --prerender=SSG
```

When prompted to install `create-content-sdk-app`, answer **y**.

### Reducing interactive prompts

| Flag | Effect |
|------|--------|
| `--prerender=SSG` | **Default.** Static site generation — skip prerender prompt |
| `--prerender=SSR` | Server-side rendering — use only when user explicitly requests SSR |
| `--yes` | Accept defaults for CLI argument questions |
| `--force` | Accept defaults for filesystem prompts |

Example with fewer prompts (default SSG):

```powershell
npx create-content-sdk-app@latest nextjs --destination=./editing-hosts/{EDITINGHOSTFOLDER} --prerender=SSG --yes
```

**Do not** use `nextjs-app-router` unless the user explicitly requests App Router.

After scaffolding, verify the folder contains `package.json` and run `npm install` only if dependencies were not installed.

### Post-scaffold: PartialDesignDynamicPlaceholder (mandatory)

`create-content-sdk-app` does **not** include `PartialDesignDynamicPlaceholder`. **Always** add it immediately after scaffold — required for Partial/Page Designs and standard headless layout chrome:

1. **Copy TSX** to `editing-hosts/{FOLDER}/src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx`
   - Source: [`.cursor/skills/sitecore-rendering-host-skills/sitecore-page-from-design/references/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx`](../sitecore-page-from-design/references/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx) or `industry-verticals/kpmg/src/components/partial-design-dynamic-placeholder/`
2. **Register** in `.sitecore/component-map.ts`:
   ```typescript
   ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
   ```
   Do **not** set `componentType: 'client'`.
3. **Run** `npm run build` from `editing-hosts/{FOLDER}/` and fix errors.

See also [placeholder-settings.md](../sitecore-content-sdk-component/references/placeholder-settings.md) for YAML placeholder artifacts created during page/component build.

---

## Step 4 — Register in `xmcloud.build.json`

1. Read `xmcloud.build.json` at the repository root.
2. Confirm `{EDITINGHOSTNAME}` is **not** already a key under `renderingHosts`. If it exists, ask before overwriting.
3. Add a new entry to `renderingHosts` using [references/rendering-host.template.json](references/rendering-host.template.json):

Replace placeholders:

| Placeholder | Value |
|-------------|-------|
| `{{EDITINGHOSTNAME}}` | Editing host name from Step 1 |
| `{{EDITINGHOSTFOLDER}}` | Rendering host folder from Step 1 |

```json
"{EDITINGHOSTNAME}": {
  "path": "./editing-hosts/{EDITINGHOSTFOLDER}",
  "nodeVersion": "22.11.0",
  "jssDeploymentSecret": "110F1C44A496B45478640DD36F80C18C9",
  "enabled": true,
  "type": "sxa",
  "buildCommand": "build",
  "runCommand": "next:start"
}
```

4. Preserve JSON formatting (2-space indent) and trailing commas consistent with the file.
5. Do **not** change other `renderingHosts` entries, `deployItems`, or `postActions` unless the user asks.

### Editing host name ↔ Deploy app

Per [Add an editing host](https://doc.sitecore.com/sai/en/developers/sitecoreai/environment-editing-hosts-and-rendering-hosts/add-an-editing-host.html), the **Editing host name** in the Deploy app must match the `renderingHosts` key in `xmcloud.build.json` (e.g. `nextjsstarter` in the docs example).

---

## Step 5 — Verify

```powershell
# JSON is valid
Get-Content xmcloud.build.json | ConvertFrom-Json

# App exists
Test-Path editing-hosts/{EDITINGHOSTFOLDER}/package.json
```

Document in the response:

- Editing host name (`renderingHosts` key)
- On-disk path: `editing-hosts/{EDITINGHOSTFOLDER}/`
- Next steps: connect to SitecoreAI ([Connect your Content SDK app to SitecoreAI](https://doc.sitecore.com/sai/en/developers/content-sdk/connect-your-content-sdk-app-to-sitecoreai.html)), add editing host in Deploy app if not auto-deployed

---

## Example

**User:** Scaffold a rendering host for a new site; editing host name `new-site`, folder `new-site`

**Actions:**

1. Create `editing-hosts/` if missing
2. `npx create-content-sdk-app@latest nextjs --destination=./editing-hosts/new-site --prerender=SSG`
3. Add to `xmcloud.build.json`:

```json
"new-site": {
  "path": "./editing-hosts/new-site",
  "nodeVersion": "22.11.0",
  "jssDeploymentSecret": "110F1C44A496B45478640DD36F80C18C9",
  "enabled": true,
  "type": "sxa",
  "buildCommand": "build",
  "runCommand": "next:start"
}
```

---

## Agent behavior

- **Execute** `npx create-content-sdk-app` in the terminal — do not only document the command
- **Use** `--prerender=SSG` by default; only use `--prerender=SSR` when the user explicitly asks for SSR
- **Ask** for editing host name and folder name when not provided
- **Create** `editing-hosts/` when missing; do not scaffold outside that directory
- **Match** existing `renderingHosts` entries in `xmcloud.build.json` for `nodeVersion`, `jssDeploymentSecret`, `type`, `buildCommand`, and `runCommand` unless user overrides

---

## Do not

- Scaffold into `industry-verticals/` or other legacy paths unless user explicitly requests
- Duplicate an existing `renderingHosts` key without confirmation
- Commit `.env`, `.env.local`, `.env copy`, or any other file that contains real keys from the new app
- Change `jssDeploymentSecret` per host unless user requests — reuse the repo default

---

## Checklist

```
- [ ] Editing host name: ___
- [ ] Rendering host folder: ___
- [ ] editing-hosts/ exists (created if needed)
- [ ] npx create-content-sdk-app@latest nextjs --destination=./editing-hosts/___ --prerender=SSG
- [ ] package.json present in new folder
- [ ] xmcloud.build.json renderingHosts entry added
- [ ] JSON validates
```
