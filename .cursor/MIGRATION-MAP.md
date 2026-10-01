# Migration map: detailed skills → compact skills

All skills live under `.cursor/skills/`. Use **compact** skills by default; open **detailed** skills only when the compact dispatcher is not enough.

When a new host or module is created, finish with `new-site-inventory` so [SITE-REGISTRY.md](./SITE-REGISTRY.md) stays the list of sites that actually exist in this clone.

## Compact replacements

| Detailed skill (still in repo) | Compact replacement | Notes |
|---|---|---|
| `mimic-website-skills/mimic-url` | `website-to-sitecore` | **mimic-url** kept for full bootstrap (scaffold + collection + site YAML). **website-to-sitecore** for mimic-on-existing-host. |
| `mimic-website-skills/url-screenshots` | `capture-website` | Same outcome; compact scripts + shared `.cursor/node_modules`. |
| `mimic-website-skills/url-page-html` | `capture-website` | HTML-only → `fetch-html.mjs` in capture-website. |
| `mimic-website-skills/visual-cms-component-detection` | `visual-cms-map` | Visual rules condensed into taxonomy + output contract. |
| `sitecore-rendering-host-skills/sitecore-page-from-design` | `sitecore-from-capture` | Page assembly in one build skill. |
| `sitecore-rendering-host-skills/sitecore-component-from-design` | `sitecore-from-capture` | TSX, placeholders, variants, build gate. |
| `sitecore-rendering-host-skills/sitecore-section-decomposition` | `sitecore-from-capture` | Section → component blueprint. |
| `sitecore-rendering-host-skills/sitecore-content-sdk-component` | `sitecore-from-capture` | Content SDK conventions summarized. |
| `sitecore-serialization-skills/sitecore-new-*` | `sitecore-yaml` | Dispatcher; media script in `sitecore-serialization-skills/sitecore-media-from-url-yaml`. |
| `sitecore-serialization-skills/isolated-collection-site` | (keep detailed) | Playbook for wizard/isolated tenants (Legal / Brother / Bristan). Not a compact replacement. |
| `search-experience`, `sitecore-rendering-host-skills/search-experience` | `sitecore-search-experience` | Single App Router search skill. Redirect stubs remain. |
| `sitecore-auth0-authentication`, `sitecore-env-local`, `header-navigation`, `scaffold-rendering-host`, `sitecore-cloudsdk-*` | `sitecore-utilities` | Index → links to detailed skills. |

## Folder cleanup (2026-06)

Previously, compact skills lived at `.cursor/` root while detailed skills were under `.cursor/skills/`. **All skills are now under `.cursor/skills/`** — internal paths in scripts already used that layout.

Removed duplicate trees:

- `skills/search-experience/references/` → use `sitecore-search-experience/references/`
- `skills/sitecore-rendering-host-skills/search-experience/references/` → same
- `mimic-website-skills/url-screenshots/node_modules/` → use `.cursor/node_modules/`

## Suggested prompt (compact workflow)

```txt
Use the optimized website-to-sitecore workflow. Capture this URL, create the CMS component manifest, wait for my approval, then generate the Sitecore TSX and YAML only for approved components.
```
