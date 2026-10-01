---
name: mimic-url
description: End-to-end workflow to bootstrap a new SitecoreAI website from reference URL(s) — scaffolds Content SDK editing host, generates collection and site serialization YAML, captures design screenshots, analyzes designs into a component manifest (with screenshot/URL evidence) for user approval, then builds page components and imports media via Content Hub (preferred) or media-library YAML. Orchestrates scaffold-rendering-host, sitecore-new-collection-yaml, sitecore-new-site-yaml, url-screenshots, sitecore-page-from-design, sitecore-content-hub-images, sitecore-media-from-url-yaml, and sitecore-env-local. Use when creating a new website, new client site, or full project from URLs.
paths:
  - "editing-hosts/**"
  - "authoring/items/**"
  - "design-screenshots/**"
  - "xmcloud.build.json"
  - "sitecore.json"
---

# New Sitecore website (full bootstrap)

Orchestrates four skills to create everything needed for a new website from **one or more reference URLs** and a **Sitecore site item path**.

**Input reference:** [references/project-inputs.md](references/project-inputs.md)

**Phase 4 review gate:** [references/component-manifest-review.md](references/component-manifest-review.md)

| Phase | Skill | Delivers |
|-------|-------|----------|
| 1 | [`scaffold-rendering-host`](../../sitecore-rendering-host-skills/scaffold-rendering-host/SKILL.md) | Next.js app in `editing-hosts/`, `xmcloud.build.json` entry |
| 2 | [`sitecore-new-collection-yaml`](../../sitecore-serialization-skills/sitecore-new-collection-yaml/SKILL.md) + [`sitecore-new-site-yaml`](../../sitecore-serialization-skills/sitecore-new-site-yaml/SKILL.md) | Collection `*.module.json`, tenant + site YAML on disk |
| 3 | [`url-screenshots`](../url-screenshots/SKILL.md) | `desktop.png`, `tablet.png`, `mobile.png`, `page.html`, `main.html` |
| 4 | [`sitecore-page-from-design`](../../sitecore-rendering-host-skills/sitecore-page-from-design/SKILL.md) + [`sitecore-content-hub-images`](../../sitecore-serialization-skills/sitecore-content-hub-images/SKILL.md) (or media-library fallback) | Components (TSX + YAML), page assembly, media import, push to CM |
| 5 | [`sitecore-env-local`](../../sitecore-rendering-host-skills/sitecore-env-local/SKILL.md) | `.env.local` from Deploy portal Developer settings (+ Auth0 if login) |

**Extension point:** Additional phases (search, etc.) may be added later — do not run them unless listed in an updated version of this file.

**Project isolation:** Each bootstrap creates its **own** editing host + SCS module. Never reuse TSX, templates, renderings, datasources, GUIDs, or `.env.local` values from sibling projects (`axa2`, `jm2`, etc.) — see [project-isolation.md](../../sitecore-rendering-host-skills/sitecore-component-from-design/references/project-isolation.md).

---

## When to apply

- User asks to **create a new website**, **new project**, or **bootstrap a site from URL(s)**
- User provides reference URL(s) + Sitecore site path and wants the full stack
- User references this skill or "new website workflow"

---

## Phase 0 — Collect and document inputs

Read [references/project-inputs.md](references/project-inputs.md). Ask only for **missing** required fields.

**Required:**

1. **Reference URL(s)** — `http(s)://` pages to capture and implement
2. **Sitecore site item path** — `/sitecore/content/{collection}/{sitename}` (authoritative for collection and site system names)
3. **Editing host name** — `renderingHosts` key in `xmcloud.build.json`

**Optional:** project name (display labels), rendering host folder, module folder override, target page name, prerender mode (default SSG).

**Recommended (Phase 5 / `.env.local`):** Sitecore Deploy portal **Developer settings** — Edge Context ID, editing secret, site name. **Always ask the user** to paste these before writing `.env.local` (see [`sitecore-env-local`](../../sitecore-rendering-host-skills/sitecore-env-local/SKILL.md)). You may propose `NEXT_PUBLIC_DEFAULT_SITE_NAME` from the site path; never assume Edge Context ID or editing secret.

**Derived from site path (do not ask separately):**

| Segment | Variable | Example |
|---------|----------|---------|
| After `content` | **collection** (system name) | `johnson-matthey-demo-creation-test` |
| Next segment | **sitename** (system name) | `jm-demo-creation-site` |
| Namespace | `{collection}-scs` | `johnson-matthey-demo-creation-test-scs` |

**Project folder rule:** `authoring/items/{project-folder}/`. Default `{project-folder}` = **collection** segment from the site path (not a shortened project-name slug). The site generator resolves the collection by folder name or display name — if you use `--folder` on the collection script, pass the **same string** to the site script's `--collection` flag.

**Collection display name** (for generators): must slugify to the **collection** segment (e.g. pass `johnson-matthey-demo-creation-test` directly, or a title-case label that lowercases to that slug). **Site display name** must slugify to **sitename**.

Document a **project brief** before executing:

```
Project: ___
Project folder: ___ (default: {collection} from site path)
URLs: ___
Site path: /sitecore/content/{collection}/{sitename}
Collection system name: {collection}
Site system name: {sitename}
SCS namespace: {collection}-scs
Editing host: ___
App path: editing-hosts/___/
Module path: authoring/items/{project-folder}/
Screenshot out: design-screenshots/___/
```

**Skip questions** when the user already provided values (e.g. `@authoring/items/johnson-matthey-demo-creation-test`).

---

## Phase 1 — Scaffold editing host

Follow [`scaffold-rendering-host`](../../sitecore-rendering-host-skills/scaffold-rendering-host/SKILL.md) **in full**.

**Host root:** this repo uses `industry-verticals/{folder}/`, not `editing-hosts/`. Pass that root to the scaffold skill. After the host is registered, run [`new-site-inventory`](../../new-site-inventory/SKILL.md).

| Pass to child skill | Value |
|---------------------|-------|
| Editing host name | from Phase 0 |
| Rendering host folder | from Phase 0 or same as editing host name |

**Execute** (do not only document):

```powershell
npx create-content-sdk-app@latest nextjs --destination=./editing-hosts/{FOLDER} --prerender=SSG --yes
```

Register in `xmcloud.build.json`. Verify `package.json` exists.

**Post-scaffold (mandatory):** copy `PartialDesignDynamicPlaceholder` into `editing-hosts/{FOLDER}/src/components/partial-design-dynamic-placeholder/` and register in component-map — see [`scaffold-rendering-host`](../../sitecore-rendering-host-skills/scaffold-rendering-host/SKILL.md) and [placeholder-settings.md](../../sitecore-rendering-host-skills/sitecore-content-sdk-component/references/placeholder-settings.md). Do not proceed to component YAML without this TSX.

**Post-scaffold (mandatory):** ask user for Deploy portal **Developer settings**, then create `.env.local` via [`sitecore-env-local`](../../sitecore-rendering-host-skills/sitecore-env-local/SKILL.md). Copy `{app-path}/.env.remote.example` → `{app-path}/.env.local`, propose `NEXT_PUBLIC_DEFAULT_SITE_NAME` and `SITECORE_RENDERINGHOST_NAME` from project context (confirm with user), and set Edge Context ID + editing secret **only from user paste** — never copy from sibling hosts without asking.

**Gate:** Phase 2+ for page build require `editing-hosts/{FOLDER}/` with a valid Content SDK app and `.env.local` with required Sitecore keys.

---

## Phase 2 — Sitecore serialization (collection + site YAML)

Generate serialization on disk with the collection and site YAML skills, then push to Sitecore CM. **Skip** if `authoring/items/{project-folder}/` already has collection tenant YAML and the target site include.

### 2a — Collection

Follow [`sitecore-new-collection-yaml`](../../sitecore-serialization-skills/sitecore-new-collection-yaml/SKILL.md) **in full**.

| Pass to child skill | Value |
|---------------------|-------|
| Collection display name | Slugifies to `{collection}` from site path |
| `--folder` (optional) | `{project-folder}` from Phase 0 when it differs from display name |

**Execute** (from repo root):

```powershell
node .cursor/skills/sitecore-serialization-skills/sitecore-new-collection-yaml/scripts/Generate-SitecoreCollection.mjs "{collection-display}" --folder "{project-folder}"
```

Omit `--folder` when the default `authoring/items/{collection-display}/` layout is acceptable.

### 2b — Site

Follow [`sitecore-new-site-yaml`](../../sitecore-serialization-skills/sitecore-new-site-yaml/SKILL.md) **in full**.

| Pass to child skill | Value |
|---------------------|-------|
| Site display name | Slugifies to `{sitename}` from site path |
| `--collection` | Same folder/display name used to locate the collection in 2a |

**Execute**:

```powershell
node .cursor/skills/sitecore-serialization-skills/sitecore-new-site-yaml/scripts/Generate-SitecoreSite.mjs "{site-display}" --collection "{project-folder}"
```

### 2c — Validate and push

From `authoring/items/{project-folder}/`:

```powershell
node ../../scripts/Check-SerializationUniqueIds.mjs
dotnet sitecore serialization validate --fix -i {collection}-scs
dotnet sitecore serialization push -n production -i {collection}-scs
```

If push reports **"existed on disk in more than one place"**, see [`unique-serialization-ids`](../../sitecore-serialization-skills/unique-serialization-ids/SKILL.md) — usually a copied generator still using a sibling `stableGuid` prefix.

**Gate:** Phase 4 needs `{collection}-scs` namespace and serialized paths under `serialized-content/` (templates, renderings, site tree).

---

## Phase 3 — Capture design from URLs

Follow [`url-screenshots`](../url-screenshots/SKILL.md) **in full**.

**Skip** if the user already attached desktop/tablet/mobile screenshots for the target page(s).

| Pass to child skill | Value |
|---------------------|-------|
| URL(s) | from Phase 0 |
| Output folder | `design-screenshots/{slug}/` per URL |

**One-time setup** (if capture fails):

```powershell
cd .cursor/skills/mimic-website-skills/url-screenshots
npm install
npm run setup
```

**Execute** from repo root (two steps — both required unless user already has section crops):

**Step 3a — Full-page screenshots + HTML:**

```powershell
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/capture.mjs `
  --urls "{URL1},{URL2}" `
  --out "./design-screenshots/{slug}" `
  --manifest
```

**Step 3b — Per-section screenshots under `{project}/sections/`** (do **not** skip — `capture.mjs` alone does not create this folder):

```powershell
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/section-capture.mjs `
  --urls "{URL1},{URL2}" `
  --out "./design-screenshots/{slug}" `
  --load domcontentloaded
```

Or, when page folders already exist from 3a:

```powershell
node .cursor/skills/mimic-website-skills/url-screenshots/scripts/section-capture.mjs `
  --page-dir "./design-screenshots/{slug}/{page-slug}" `
  --out "./design-screenshots/{slug}"
```

Follow [`url-screenshots`](../url-screenshots/SKILL.md) §4 for cookie/header chrome handling before section crops.

For `localhost` URLs, confirm the dev server is running before capture.

**Gate:** Phase 4 needs at least `desktop.png`; prefer all three breakpoints + `page.html` / `main.html` **and** `{page-slug}/sections/` + `{page-slug}/new-sections-manifest.json` + domain `{project}/sections/manifest.json`.

---

## Phase 4 — Build page from design

Follow [`sitecore-page-from-design`](../../sitecore-rendering-host-skills/sitecore-page-from-design/SKILL.md) for implementation detail.

**Primary goal:** the assembled Sitecore page(s) must match the **full-page screenshots** (desktop / tablet / mobile). Section PNGs are the fidelity gate for each component; the page PNGs verify the stack.

**Supporting artifacts** (`manifest.json`, `section-plan.json`, `section.html`, `page-decomposition.json`, `component-blueprint.json`, `site-summary.json`) list components, fields, placeholders, and YAML to create — they do **not** override screenshot layout.

When design-screenshots already exist (user says "continue from capture"), **skip Phase 3** and Phase 4a manifest review — use `sections/manifest.json` + per-page `page-decomposition.json` as the component list and proceed to build.

Wire orchestration context into the child workflow:

| Context | Value |
|---------|-------|
| Rendering host app | `editing-hosts/{FOLDER}/` from Phase 1 |
| Module namespace / paths | from Phase 2 — `{collection}-scs`, `authoring/items/{project-folder}/serialized-content/` |
| Design inputs | PNGs + HTML from Phase 3 (or user uploads) |
| Base URL | origin from `source-url.txt` |
| Target page(s) | from Phase 0 and each captured URL |

### Phase 4 sub-steps

| Step | Name | Code? | Action |
|------|------|-------|--------|
| **4a** | Analyze | No | Map sections → components using manifest + page decomposition; harvest internal links → `site-content-tree.json`; confirm against PNGs |
| **4b** | **User review** | No | **STOP** when manifest is new/uncertain — present for approval ([component-manifest-review.md](references/component-manifest-review.md)) |
| **4c** | Apply feedback | No | Revise manifest if user requested changes |
| **4d** | Reuse audit | No | Match manifest to existing TSX + serialized renderings; honor `{page-slug}/new-sections-manifest.json` `componentsToBuild` — [component-reuse-validation.md](../../mimic-website-skills/visual-cms-component-detection/references/component-reuse-validation.md) |
| **4e** | Build components | Yes | One row per manifest entry — [`sitecore-component-from-design`](../../sitecore-rendering-host-skills/sitecore-component-from-design/SKILL.md); section PNGs per component; **full-page PNGs** as final gate — [page-assembly-fidelity.md](../../sitecore-rendering-host-skills/sitecore-component-from-design/references/page-assembly-fidelity.md); **`npm run build` after each component** |
| **4f** | Assemble pages | Yes | Page YAML per route from `site-content-tree.json` (**mimicked + stub**); **homepage renderings on `Home.yml`** (never `Home/Home`); Header/Footer/**Cookie** on partial designs — [site-structure-from-links.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/site-structure-from-links.md), [homepage-authoring.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/homepage-authoring.md) |
| **4g** | Media import | Yes | Content Hub DAM (preferred) or media-library download; wire Image fields |
| **4h** | Validate & push | Yes | `validate --fix` + `push`; final `npm run build` |

### 4b — What to show the user

For each identified component, include:

- **Proposed component name** (PascalCase)
- **Page / URL** it belongs to (or “all pages” for chrome)
- **Visual band** (e.g. `chrome-top`, `above-fold`, `main-1`)
- **Evidence** — screenshot path + region; HTML landmark/class when available
- **Action** — `create` | `reuse` | `skip` | `unclear`

Use the manifest table format in [component-manifest-review.md](references/component-manifest-review.md).

**User may:** accept all, skip rows, rename components, split one region into multiple components, merge bands, add missing components, specify reuse of existing components, or add implementation notes.

**Do not proceed to 4e** until the user explicitly approves the manifest (or a revised version). Unclear rows must be resolved in 4b/4c.

### 4g — Media import

**After** page/datasource YAML is written and **before** validate/push. Prefer Content Hub when credentials are available — see [media-from-mimic.md](../../sitecore-yaml/references/media-from-mimic.md).

#### Path A — Content Hub (preferred)

Follow [`sitecore-content-hub-images`](../../sitecore-serialization-skills/sitecore-content-hub-images/SKILL.md) when `CONTENTHUB_URI` / OAuth env is loaded (user `set-ch-env.ps1` outside git).

1. Harvest unique image URLs from `section.html` / page HTML (same URL shapes as Path B).
2. Stage locally → upload new files only → public links → metadata → field map.
3. Patch Image fields with DAM XML (`src` + `dam-id`) — not hotlinks.
4. Ensure datasources/templates own the Image fields; unique item IDs ([`unique-serialization-ids`](../../sitecore-serialization-skills/unique-serialization-ids/SKILL.md)).
5. Sync map to `InSync`; then validate + push.

Reference: Brother scripts under `authoring/items/brother/scripts/` (adapt per collection).

#### Path B — Media library (fallback)

Follow [`sitecore-media-from-url-yaml`](../../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md) when Content Hub is unavailable.

| Input | Source |
|-------|--------|
| `MediaRoot` | `authoring/items/{project-folder}/serialized-content/media-library/{collection}/{sitename}` |
| `SiteMediaPath` | `/sitecore/media library/Project/{collection}/{sitename}` |
| `SiteRootItemId` | GUID from `{sitename}.yml` in the media include |
| `BaseUrl` | Capture origin — `design-screenshots/{slug}/source-url.txt` or reference URL from Phase 0 |
| `Assets` | Unique `{ Url, Alt }` from scraped HTML (see URL shapes below) |

#### URL shapes (all supported)

See [media-download.md](../../sitecore-serialization-skills/sitecore-media-from-url-yaml/references/media-download.md) for full detail.

| Shape | Example in HTML | Action |
|-------|-----------------|--------|
| **Absolute static / CDN** | `https://cdn.example.com/assets/images/hero.jpg` | Add to asset list as-is |
| **Root-relative** | `/static/logos/brand.svg` | Resolve with `BaseUrl` before placeholders + download |
| **Relative** | `images/teaser.png` | Resolve with `BaseUrl` before placeholders + download |
| **Protocol-relative** | `//cdn.example.com/logo.png` | Resolve to `https://…` |
| **Sitecore CDN** | `https://cdn.example.com/-/media/shared/logos/icon.svg?…` | Add as-is; script strips `/-/media/` for folder tree |
| **XM Cloud edge CDN** | `https://edge.sitecorecloud.io/{tenant}/media/project/{package}/…` | Unwrap CDN resize wrappers in authoring; pass stable edge URL; script strips tenant/project prefix |

**Canonical URL rule (Path B):** resolve each scraped URL **once** when writing datasource YAML. Use the **same string** in `{MEDIA:{Url}}` placeholders and in the `-Assets` list. Mixing relative placeholders with absolute asset URLs causes patch failures and orphaned `mediaid` values.

**Execute (Path B):**

1. Collect unique image URLs from `section.html` (content extraction) and page HTML. Prefer section HTML per component.
2. Resolve relative and root-relative URLs against `BaseUrl` (`new URL(path, baseUrl + '/')` or equivalent).
3. Write datasource Image fields with `{MEDIA:{canonicalUrl}}` placeholders (authoring scripts) or patch after download.
4. Run `create-media-from-urls.ps1` with paths derived from Phase 0 `{collection}` + `{sitename}` — **never** hardcode another site's media folder when forking scripts. Pass `-BaseUrl` when the asset list may still contain relative URLs.
5. Replace `{MEDIA:{Url}}` placeholders with returned `MediaId` values (**exact** `Url` string match).
6. **Verify before push:**
   - No `{MEDIA:https://…}` placeholders remain
   - Every `mediaid="…"` in datasource YAML has a matching media **file** item under `serialized-content/media-library/`
   - Download script completed without errors — **do not push** on partial failure
7. Fix non-unique media paths under `media-library/` manually if `validate --fix` reports them — see [media-orphan-prevention.md](../../sitecore-serialization-skills/sitecore-media-from-url-yaml/references/media-orphan-prevention.md).

**Common failures:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| Spurious `-` folder / `-.yml` error | Sitecore `/-/media/` URL not normalized | Use current `create-media-from-urls.ps1` (strips prefix) |
| Placeholders not patched | URL mismatch (relative vs absolute, `&` vs `&amp;`) | Canonicalize URLs at scrape time; match placeholder string exactly |
| `mediaid` in CM but item missing | Patched IDs without serialized media YAML | Re-run download; verify step 6 before push |
| `[M] {id} to {parent}: Item {id} did not exist` on push | Duplicate folder items (same `Path:`, different IDs); manual `Parent:` edit | Delete duplicate folder YAML; re-run media script; or new file ID + update datasource — [media-orphan-prevention.md](../../sitecore-serialization-skills/sitecore-media-from-url-yaml/references/media-orphan-prevention.md) |
| `NON-UNIQUE ITEM PATH` under media-library | Multiple script runs before folder reuse by `Path:` | Delete duplicate trees; run `validate --fix`; do not push until clean |
| Blob YAML under `{HASH}/` folder | Normal after `validate --fix` | Not an orphan — verify `Path:` + `Parent:` only |
| Wrong `MediaRoot` | Copied folder name from another site | Derive from `{collection}/{sitename}` on site path |
| Duplicate item ID on push | New datasource reused another item's `ID:` | Assign fresh GUID — [`unique-serialization-ids`](../../sitecore-serialization-skills/unique-serialization-ids/SKILL.md) |
| Content Editor error opening page | Invalid `__Renderings` XML on page or partial design | Escape `&amp;` in `s:par`; uppercase `p:after` GUIDs; **`uid="{GUID}"` not `uid="{GUID}}"`** — [renderings-xml.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/renderings-xml.md) |
| Duplicate React key `00000000-0000-0000-0000-000000000000` in Pages / dev server | Layout `<r>` entries have **`uid="{GUID}}"`** (extra `}`) — edit layout cannot assign rendering UIDs | Fix `__Renderings` on page + partial design items; push; verify with `authoring/scripts/inspect-*-layout.mjs` — [renderings-xml.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/renderings-xml.md) |
| `Placeholder 'sxa-footer' was not found` / Pages canvas **500** on `sxa-jss` | Partial Design placeholder-setting **children** missing (`Header.yml`, `Footer.yml`) — site scaffold creates folder only | Add child items under `Presentation/Placeholder Settings/Partial Design/` with `sxa-header` / `sxa-footer` keys — [partial-design-placeholder-settings/README.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/partial-design-placeholder-settings/README.md) |
| `Placeholder 'header-nav-1' was not found` / CM shows broken **Placeholders** reference | Double braces `{{GUID}}` on rendering **Placeholders** field instead of `{GUID}` | Fix serialized YAML to single braces; push renderings; verify in Content Editor — [placeholder-settings.md](../../sitecore-rendering-host-skills/sitecore-content-sdk-component/references/placeholder-settings.md) |

---

## Phase 5 — Connect editing host (`.env.local`)

Follow [`sitecore-env-local`](../../sitecore-rendering-host-skills/sitecore-env-local/SKILL.md) **in full** — agents **must execute this phase**, not only document it.

| Input | Source |
|-------|--------|
| App path | `editing-hosts/{FOLDER}/` from Phase 1 |
| Site name | `{sitename}` from site path → `NEXT_PUBLIC_DEFAULT_SITE_NAME` |
| Rendering host name | editing host name → `SITECORE_RENDERINGHOST_NAME` |
| Edge Context ID, editing secret, site name | **User paste** from Deploy portal Developer settings — always ask |
| Auth0 vars | Only if Phase 4 manifest included login/auth — [Auth0 Next.js quickstart](https://auth0.com/docs/quickstart/webapp/nextjs) |

**When to run:** immediately after Phase 1 post-scaffold (minimum `.env.local` with site name + rendering host name). Fill Edge Context ID and editing secret as soon as values are known — before first `npm run build` or `npm run dev`.

**Execute:**

1. Copy `editing-hosts/{FOLDER}/.env.remote.example` → `editing-hosts/{FOLDER}/.env.local` if missing.
2. Set required keys per [`sitecore-env-local`](../../sitecore-rendering-host-skills/sitecore-env-local/SKILL.md) Step 3.
3. Do not overwrite an existing `.env.local` without user confirmation — merge keys instead.

**Can run in parallel with Phase 4** (does not require pushed YAML).

**Gate:** `npm run build` / `npm run dev` succeed when Edge Context ID, site name, and editing secret are set.

### Example stop message

> Phase 4a done — **12** components across **3** pages (Home, About Us, Science).  
> Shared: Header, Navigation, Footer, LinkList.  
> Review the manifest below. Reply with **approve**, or list changes (rename / split / skip / add).  
> *(manifest table)*

---

## Execution order and parallelism

**Default: sequential** — 1 → 2 → 3 → 4.

| Can run in parallel | Notes |
|---------------------|-------|
| Phase 1 + Phase 2 | Independent until page YAML references app paths |
| Phase 3 + Phase 1/2 | Screenshots do not depend on scaffold or module |

**Recommended:** 1 and 2 first (infrastructure), then 3 (capture), then 4 (implementation). Phase 4 must wait for 1, 2, and 3.

---

## End-to-end example

**User:** Create Johnson Matthey site from `https://www.matthey.com/`  
Site path: `/sitecore/content/johnson-matthey-demo-creation-test/jm-demo-creation-site`  
Editing host: `johnson-matthey`

| Phase | Action |
|-------|--------|
| 1 | Scaffold `editing-hosts/johnson-matthey`, add `johnson-matthey` to `xmcloud.build.json` |
| 2a | `Generate-SitecoreCollection.mjs "johnson-matthey-demo-creation-test"` → `authoring/items/johnson-matthey-demo-creation-test/` |
| 2b | `Generate-SitecoreSite.mjs "jm-demo-creation-site" --collection "johnson-matthey-demo-creation-test"` |
| 2c | `validate --fix` + `push -i johnson-matthey-demo-creation-test-scs` |
| 3 | Capture to `design-screenshots/matthey-com/` |
| 4a–b | Analyze → manifest with evidence → **user approves** |
| 4e–g | Header, Hero, Sections, Footer → TSX + YAML → push all pages |

---

## Agent behavior

- **Read and follow** each child skill — this file orchestrates order and wiring, not implementation detail
- **Execute** terminal commands in each phase; do not stop after documenting
- **Create** `editing-hosts/{FOLDER}/.env.local` via [`sitecore-env-local`](../../sitecore-rendering-host-skills/sitecore-env-local/SKILL.md) after Phase 1 — do not defer until the user asks
- **Skip** phases already complete (e.g. editing host exists, collection/site YAML generated, screenshots attached)
- **Ask** only for missing required inputs from Phase 0
- **Report** a phase summary after each phase before continuing
- **Stop at Phase 4b** when the manifest is new or ambiguous — wait for user approval before writing TSX/YAML
- When user provides existing `design-screenshots/` and asks to continue, **skip 4b** and build from manifest + page decomposition
- **Stop** on phase failure; do not proceed to page build without screenshots and a scaffolded app

---

## Do not

- Create `authoring/items/` folders that don't match the collection system name from the site path unless `--folder` and `--collection` are wired consistently (see Phase 0)
- Run child skills out of order when dependencies are missing
- Guess Sitecore site path or editing host name
- Re-capture URLs when user provided screenshots (unless they ask to refresh)
- Implement page components before Phase 2 completes (need collection/site YAML paths)
- Skip the Phase 4b review gate or start coding before the user approves the component manifest
- Mark Phase 4 complete while `npm run build` fails in the editing host
- Commit `.sitecore/user.json` or `.env.local` secrets
- Invent Edge Context ID or editing secret — **always ask** user for Deploy portal Developer settings
- Copy secrets from another app's `.env.local` without user confirmation
- Reuse components, templates, renderings, datasource YAML, media IDs, or GUIDs from another editing host or another `authoring/items/{module}/` tree — [project-isolation.md](../../sitecore-rendering-host-skills/sitecore-component-from-design/references/project-isolation.md)
- Serialize **minimal** General Link XML (`linktype` + `text` + `url` only) — breaks Edge and causes `[object Object]` in CTAs — [datasource-field-values.md](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/references/datasource-field-values.md)
- Hotlink reference-website images (e.g. brand CDN `.ashx`) in datasource YAML — use CH DAM or tenant media instead
- Skip creating `.env.local` after scaffold — Phase 5 is mandatory for every new editing host
- Assume `Generate-SitecoreSite.mjs` created Partial Design placeholder-setting children — it creates the **folder only**; add `Header.yml` / `Footer.yml` when building partial designs ([partial-design-placeholder-settings/README.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/partial-design-placeholder-settings/README.md))

---

## Master checklist

```
Phase 0 — Inputs
- [ ] Reference URL(s): ___
- [ ] Site item path: ___
- [ ] Editing host name: ___
- [ ] Project brief documented

Phase 1 — Scaffold ([scaffold-rendering-host] + [sitecore-env-local])
- [ ] editing-hosts/{folder}/ with package.json
- [ ] xmcloud.build.json renderingHosts entry
- [ ] .env.local created from .env.remote.example (site name, rendering host name, Edge + secret)

Phase 2 — Serialization ([sitecore-new-collection-yaml] + [sitecore-new-site-yaml])
- [ ] Collection YAML generated (`Generate-SitecoreCollection.mjs`)
- [ ] Site YAML generated (`Generate-SitecoreSite.mjs`)
- [ ] validate --fix passed (`-i {collection}-scs`)
- [ ] push completed (tenant + site in CM)

Phase 3 — Screenshots ([url-screenshots])
- [ ] desktop / tablet / mobile PNGs
- [ ] page.html + main.html (unless skipped)
- [ ] manifest or paths communicated

Phase 4 — Page ([sitecore-page-from-design] + [component-manifest-review])
- [ ] 4a: Manifest with evidence (page, URL, band, screenshot/HTML ref) per component
- [ ] 4b: Manifest presented; user explicitly approved (or revised + re-approved)
- [ ] 4c: Renames / splits / merges / adds applied
- [ ] 4d: Reuse audit complete
- [ ] 4e: Components + YAML created (approved rows only); npm run build passes (errors fixed)
- [ ] 4f: Page YAML assembled per route; `__Renderings` XML valid ([renderings-xml.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/renderings-xml.md)); Partial Design placeholder-setting **children** (`Header.yml`, `Footer.yml` with `sxa-*` keys) exist when using page designs ([partial-design-placeholder-settings/README.md](../../sitecore-rendering-host-skills/sitecore-page-from-design/references/partial-design-placeholder-settings/README.md))
- [ ] 4g: Media via sitecore-content-hub-images (DAM) **or** sitecore-media-from-url-yaml; relative URLs resolved; no hotlinks; no `{MEDIA:…}` leftovers; dam-id or mediaid wired
- [ ] 4g (hero / promos): **General Link** fields use full internal link XML with target item `id` ([datasource-field-values.md](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/references/datasource-field-values.md)); hero images via **CH DAM** (preferred) or tenant media — not reference-site CDN URLs
- [ ] 4h: validate + push succeeded; final npm run build passes

Phase 5 — Env ([sitecore-env-local])
- [ ] Developer settings values collected (Edge Context ID, site name, editing secret)
- [ ] .env.local written under industry-verticals/{folder}/ (or editing-hosts/{folder}/ when that is the host root)
- [ ] Auth0 block added (if login in manifest)
- [ ] npm run dev verified

Phase 6 — Inventory ([new-site-inventory])
- [ ] SITE-REGISTRY.md row matches folder, renderingHosts key, and module
- [ ] project-context Available Sites + docs/README.md table updated
- [ ] docs/{SITE}.md written; AGENTS.md skill row added when a site skill exists
```
