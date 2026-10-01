# Cursor agents — rules and skills

This repository configures the Cursor AI agent with **rules** (always-on or file-scoped constraints) and **skills** (on-demand workflows for website-to-Sitecore work). Together they keep codegen safe, consistent with XM Cloud patterns, and aligned with the industry-verticals monorepo.

| Mechanism | Location | When it applies |
|-----------|----------|-----------------|
| **Rules** | `.cursor/rules/*.mdc` | Injected into every agent turn (always) or when matching files are open/edited (globs) |
| **Skills** | `.cursor/skills/**/SKILL.md` | Loaded when the agent decides a task matches the skill `description`, or when you @-mention a skill |

Runtime scripts (Playwright, generators) live under `.cursor/skills/`; dependencies install in **`.cursor/node_modules/`** — see [RUNTIME-DEPENDENCIES.md](./RUNTIME-DEPENDENCIES.md).

## Secrets stay off git

Never create, copy, or commit a file that holds real environment values. That includes `.env`, `.env.local`, `.env copy`, `.env.bak`, `copy.env`, and any duplicate saved so a key is handy. Variable names with placeholders belong only in `.env.example`, `.env.remote.example`, `.env.remote.site`, and `.env.container.example`.

`.gitignore` already ignores `.env`, `.env.*` except those templates, and `.env copy`. If a tracked file still contains an Edge context ID, editing secret, Search key, CDP token, or Content Hub secret, remove it and do not print the values. A delete on the latest commit does not erase history; the keys need to be rotated. See [safety.mdc](./rules/safety.mdc).

---

## Rules (`.cursor/rules/`)

Rules are Markdown with YAML frontmatter. `alwaysApply: true` rules are included in every conversation. Others attach when you work on files matching their `globs`.

### Always applied

| Rule | Purpose |
|------|---------|
| **[safety.mdc](./rules/safety.mdc)** | Do not edit compiled artifacts (`node_modules`, `.next/`, lock files), secrets (`.env`, `.env.local`, `.env copy`, `.sitecore/user.json`), Docker/CI configs, or binary packages. Focus edits on source under `src/`, authoring YAML, and safe config. |
| **[project-context.mdc](./rules/project-context.mdc)** | Repo map: `industry-verticals/`, `authoring/`, `xmcloud.build.json`, available sites (see [SITE-REGISTRY.md](./SITE-REGISTRY.md)), tech stack (Next.js 15+, Content SDK, Tailwind), local dev env vars, planned git flow. |
| **[general.mdc](./rules/general.mdc)** | DRY, SOLID, modular design, testing expectations, code review and CI norms. |
| **[code-style.mdc](./rules/code-style.mdc)** | TypeScript-first components, safe XM Cloud field destructuring, editing vs delivery rendering, Tailwind/Shadcn patterns, error handling, performance notes. |
| **[new-site-inventory.mdc](./rules/new-site-inventory.mdc)** | When a site is created, cloned, or renamed, update [SITE-REGISTRY.md](./SITE-REGISTRY.md), project context, `docs/README.md`, and this file in the same change. |

### Applied when matching files

| Rule | Globs (summary) | Purpose |
|------|-----------------|--------|
| **[sitecore.mdc](./rules/sitecore.mdc)** | `src/components/**`, `sitecore.config.ts`, middleware | XM Cloud env vars, Content SDK component patterns, GraphQL/layout data, editing mode, placeholder conventions. |
| **[nextjs.mdc](./rules/nextjs.mdc)** | `src/app/**`, `src/pages/**`, `next.config.js`, layouts | App/Pages router patterns, i18n, ISR, image domains, middleware for XM Cloud. |
| **[javascript.mdc](./rules/javascript.mdc)** | `**/*.{ts,tsx,js,mjs}` | Naming (camelCase, `handle*`), imports, file layout, TS strictness. |
| **[linting-formatting.mdc](./rules/linting-formatting.mdc)** | `**/*.{ts,tsx,js,jsx}` | Run ESLint + Prettier after React/TS edits; fix before completing tasks. |
| **[testing.mdc](./rules/testing.mdc)** | `**/*.{test,spec}.{ts,tsx}`, jest/vitest config | Component tests with mocked XM Cloud APIs, field edge cases, integration guidance. |

**Rules vs skills:** Rules constrain *how* code is written everywhere in the repo. Skills describe *multi-step workflows* (capture a site, generate YAML, scaffold a host) that the agent runs only when relevant.

---

## Skills (`.cursor/skills/`)

Skills are procedural playbooks: inputs, outputs, scripts, references, and stop gates (e.g. user approval before TSX). Use the **compact** tier by default; open **detailed** skills for full bootstrap or edge cases. See [MIGRATION-MAP.md](./MIGRATION-MAP.md).

### Compact workflow (default)

End-to-end “mimic this website” on an **existing** rendering host:

```mermaid
flowchart LR
  A[website-to-sitecore] --> B[capture-website]
  B --> C[visual-cms-map]
  C --> D[User approves manifest]
  D --> E[sitecore-from-capture]
  E --> F[sitecore-yaml]
  F --> G[download media YAML]
  G --> H[push media-library to CM]
```

| Skill | What it does |
|-------|----------------|
| **[website-to-sitecore](./skills/website-to-sitecore/SKILL.md)** | Orchestrator only. Defines outcome paths (`design-screenshots/`, `src/components/`, `authoring/items/`), review manifest shape, Bristan + Brother + **Legal** as reference implementations. Delegates to skills below; stops for approval before TSX/YAML. |
| **[capture-website](./skills/capture-website/SKILL.md)** | Playwright capture: desktop/tablet/mobile PNGs, clean shots (no sticky chrome), `page.html`, section crops, manifests, design tokens. No TSX/YAML here. |
| **[visual-cms-map](./skills/visual-cms-map/SKILL.md)** | Reads screenshots + `sections/manifest.json` → writes `component-review.json` (CMS names, fields, placeholders, reuse vs create). Visual-first, not one-div-per-component. |
| **[sitecore-from-capture](./skills/sitecore-from-capture/SKILL.md)** | After manifest approval: TSX, placeholders, component-map, page wiring, **harvest images → media YAML + push**. |
| **[sitecore-yaml](./skills/sitecore-yaml/SKILL.md)** | Serialization dispatcher: collection/site/rendering generators, **mandatory media download** on mimic ([media-from-mimic.md](./skills/sitecore-yaml/references/media-from-mimic.md)), `validate --fix`, **push** so media exists in Sitecore. |

### Full new-site bootstrap (detailed)

| Skill | What it does |
|-------|----------------|
| **[mimic-url](./skills/mimic-website-skills/mimic-url/SKILL.md)** | Full greenfield: scaffold host → collection + site YAML → url-screenshots → component manifest + user review → page/components + media → env local. Use when creating a **new** client site from URLs, not only mimicking on an existing host. Finish with **new-site-inventory**. |
| **[new-site-inventory](./skills/new-site-inventory/SKILL.md)** | After any new, cloned, or renamed host: update [SITE-REGISTRY.md](./SITE-REGISTRY.md), project-context, `docs/README.md`, this file, and `docs/{SITE}.md`. |

### Capture and analysis (detailed)

| Skill | What it does |
|-------|----------------|
| **[url-screenshots](./skills/mimic-website-skills/url-screenshots/SKILL.md)** | Detailed Playwright capture (breakpoints, section-capture, domain merge, site-summary, color palette). Superset of compact `capture-website`. |
| **[url-page-html](./skills/mimic-website-skills/url-page-html/SKILL.md)** | HTML-only fetch (`fetch-html.mjs`) without PNGs. |
| **[visual-cms-component-detection](./skills/mimic-website-skills/visual-cms-component-detection/SKILL.md)** | Visual component taxonomy before DOM validation; used during section discovery. |

### Rendering host (detailed)

| Skill | What it does |
|-------|----------------|
| **[scaffold-rendering-host](./skills/sitecore-rendering-host-skills/scaffold-rendering-host/SKILL.md)** | New Content SDK app under `industry-verticals/` (this repo’s host root), `xmcloud.build.json` entry, Deploy-ready host. Then **new-site-inventory**. |
| **[sitecore-env-local](./skills/sitecore-rendering-host-skills/sitecore-env-local/SKILL.md)** | `.env.local` from Deploy portal (edge context, site name, editing secret). Always confirm values with user. |
| **[sitecore-page-from-design](./skills/sitecore-rendering-host-skills/sitecore-page-from-design/SKILL.md)** | Full-page decomposition: header, hero, sections, footer → placeholders and page assembly from screenshots/URLs. |
| **[sitecore-component-from-design](./skills/sitecore-rendering-host-skills/sitecore-component-from-design/SKILL.md)** | Single component from section PNGs + `section.html`; pixel-faithful TSX + YAML. |
| **[sitecore-section-decomposition](./skills/sitecore-rendering-host-skills/sitecore-section-decomposition/SKILL.md)** | Section crops → `component-blueprint.json` / `page-decomposition.json` before build. |
| **[sitecore-content-sdk-component](./skills/sitecore-rendering-host-skills/sitecore-content-sdk-component/SKILL.md)** | Generic Content SDK component + matching serialization (templates, renderings, variants). |
| **[header-navigation](./skills/sitecore-rendering-host-skills/header-navigation/SKILL.md)** | Header, nav, utility links, breadcrumb patterns (single placeholder mount, responsive CSS). Reference TSX vendored in skill. |
| **[sitecore-auth0-authentication](./skills/sitecore-rendering-host-skills/sitecore-auth0-authentication/SKILL.md)** | Auth0 login/register/profile, Management API, header auth UI. |
| **[sitecore-search-experience](./skills/sitecore-search-experience/SKILL.md)** | App Router search results: `useSearch`, next-intl, TSX + YAML. **App Router only.** |

Redirects: `search-experience/` and `sitecore-rendering-host-skills/search-experience/` → `sitecore-search-experience`.

### Serialization (detailed)

| Skill | What it does |
|-------|----------------|
| **[sitecore-new-collection-yaml](./skills/sitecore-serialization-skills/sitecore-new-collection-yaml/SKILL.md)** | New headless collection module (tenant, templates, branches, renderings). |
| **[sitecore-new-site-yaml](./skills/sitecore-serialization-skills/sitecore-new-site-yaml/SKILL.md)** | New site under existing collection (Home, Presentation, Settings). |
| **[isolated-collection-site](./skills/sitecore-serialization-skills/isolated-collection-site/SKILL.md)** | Repeatable isolated collection playbook (wizard IDs, dual placeholder trees, DAM, Edge path). Lessons: [lessons-from-legal.md](./skills/sitecore-serialization-skills/isolated-collection-site/references/lessons-from-legal.md). |
| **[headless-site-shell](./skills/sitecore-serialization-skills/headless-site-shell/SKILL.md)** | Correct site shell templates + Page Designs mapping; fix JSS Data misuse on Dictionary/Media/Presentation/Settings. |
| **[sitecore-new-rendering-yaml](./skills/sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md)** | New JSON rendering + datasource/parameters templates for one component. |
| **Datasource field values** | [datasource-field-values.md](./skills/sitecore-serialization-skills/sitecore-new-rendering-yaml/references/datasource-field-values.md) — General Link `id`, CH DAM images, Edge verify; prevents `[object Object]`. Human summary: [docs/SITECORE-DATASOURCE-FIELDS.md](../docs/SITECORE-DATASOURCE-FIELDS.md). |
| **[sitecore-media-from-url-yaml](./skills/sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md)** | Download URLs → media library YAML (base64 blobs, path dedup). |
| **[unique-serialization-ids](./skills/sitecore-serialization-skills/unique-serialization-ids/SKILL.md)** | Fix duplicate GUIDs across YAML before push. |
| **[sitecore-serializing-roles-json](./skills/sitecore-serialization-skills/sitecore-serializing-roles-json/SKILL.md)** | `*.module.json` role predicates only. |
| **[sitecore-serializing-users-json](./skills/sitecore-serialization-skills/sitecore-serializing-users-json/SKILL.md)** | `*.module.json` user predicates + GraphQL settings. |

### Site-specific

These skills are playbooks. A site is in this clone only when [SITE-REGISTRY.md](./SITE-REGISTRY.md) lists a host folder. Add a row here when you add the skill.

| Skill | What it does |
|-------|----------------|
| **[legal-pinsent](./skills/legal-pinsent/SKILL.md)** | Pinsent people / Out-Law / events / header search / DAM / Pages `headless-main`. Use when editing `industry-verticals/legal` or `authoring/items/legal`. |
| **[nonprofit-openhand](./skills/nonprofit-openhand/SKILL.md)** | Openhand isolated collection — advice AEO, partners, appeals, fundraise A/B, storyboard. |
| **[capco-consulting](./skills/capco-consulting/SKILL.md)** | Capco isolated collection — FS + Energy, Perspectives AEO, T+1 story, storyboard. |
| **[brother-commerce](./skills/brother-commerce/SKILL.md)** | Brother demo cart, PDP add-to-cart, CtaBanner on page layout (not ProductContent partial). |
| **[asos-fashion](./skills/asos-fashion/SKILL.md)** | ASOS isolated collection — wide-leg jeans, denim catalogue, search, fit profile, Content Hub brand 95911. |
| **[recruitment-aspire](./skills/recruitment-aspire/SKILL.md)** | Aspire recruitment — jobs, consultants, articles, branches, header search. Use when editing `industry-verticals/recruitment` or `authoring/items/Recruitment`. |

### Cloud SDK

| Skill | What it does |
|-------|----------------|
| **[sitecore-cloudsdk-identity-events](./skills/sitecore-cloud-sdk-skills/sitecore-cloudsdk-identity-events/SKILL.md)** | Identity resolution events after login/subscribe (pairs with Auth0 skill). |
| **[sitecore-cloudsdk-custom-events](./skills/sitecore-cloud-sdk-skills/sitecore-cloudsdk-custom-events/SKILL.md)** | Custom analytics events — only when user specifies event names/actions. |

### Support index

| Skill | What it does |
|-------|----------------|
| **[sitecore-utilities](./skills/sitecore-utilities/SKILL.md)** | Table of links to scaffold, env, Auth0, header-nav, Cloud SDK skills. Use when a support task is explicit, not during normal capture flow. |

---

## How rules and skills interact

```txt
User request
    │
    ├─ Rules (always): safety, project context, code style, general principles
    │
    ├─ Rules (file-scoped): sitecore / nextjs / linting when editing matching paths
    │
    └─ Skills (on demand): agent picks workflow skill by description
           │
           ├─ website-to-sitecore → capture → visual-cms-map → [approve] → from-capture → yaml → **download media → push CM**
           │
           └─ mimic-url → scaffold (industry-verticals/) + serialization + url-screenshots + page-from-design → new-site-inventory
```

**Example — FormaLux (retail):** Human index is [docs/README.md](../docs/README.md). Components live in `industry-verticals/retail`. Serialization is `authoring/items/industry-verticals/` (`Project.Retail-Content`, `Project.Retail-Media`). The deploy key is `nextjsstarter`.

**Example — new isolated collection:** Use `isolated-collection-site`, then `new-site-inventory`, and write `docs/{SITE}.md`. Do not copy GUIDs from another module.

---

## Related docs

| Doc | Contents |
|-----|----------|
| [SITE-REGISTRY.md](./SITE-REGISTRY.md) | Hosts that exist in this clone, and playbooks that do not yet have a host |
| [README.md](./README.md) | Install layout, Playwright setup, compact workflow summary |
| [MIGRATION-MAP.md](./MIGRATION-MAP.md) | Compact ↔ detailed skill mapping |
| [RUNTIME-DEPENDENCIES.md](./RUNTIME-DEPENDENCIES.md) | Where Playwright lives |
| [TOKEN-REDUCTION-NOTES.md](./TOKEN-REDUCTION-NOTES.md) | Why compact skills exist |
| [docs/README.md](../docs/README.md) | Documentation index for this clone |
| [docs/COMPONENTS.md](../docs/COMPONENTS.md) | Components on the six verticals |
| [docs/SITE-CLONING-GUIDE.md](../docs/SITE-CLONING-GUIDE.md) | Clone a vertical and register a host |
| [docs/SITECORE-SITE-SHELL.md](../docs/SITECORE-SITE-SHELL.md) | Site shell templates, Page Designs query tokens, generator checklist |

## Suggested prompts

**Compact (existing host):**

```txt
Use website-to-sitecore. Capture https://example.com, build the CMS component manifest, wait for my approval, then generate TSX, YAML, **download component images into the media library, and push to Sitecore**.
```

**Full bootstrap:**

```txt
Use mimic-url to create a new Sitecore site from https://example.com — scaffold host, collection, site YAML, screenshots, component review, **download images into media library, and push**.
```

**Support only:**

```txt
Use sitecore-env-local to configure .env.local for industry-verticals/bristan against SitecoreSilverProd.
```

**New site in this repo (clone a vertical):**

```txt
Clone a new site from retail into industry-verticals/{folder}. Follow the site cloning guide, then run new-site-inventory so SITE-REGISTRY, project-context, docs/README, and AGENTS.md match the new host.
```

**New isolated collection (Legal pattern):**

```txt
Use isolated-collection-site. Create a new isolated collection like legal — unique GUID prefix, wizard or YAML tenant, project + site headless-main Allowed Controls, Content Hub DAM, docs and a site skill.
```
