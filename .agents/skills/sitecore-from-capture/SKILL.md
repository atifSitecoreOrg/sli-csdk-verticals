---
name: sitecore-from-capture
description: Build Sitecore Content SDK Next.js components and pages from approved screenshot capture manifests. Creates TSX, variants, placeholders, component-map registration, page composition, downloads component images into Sitecore media YAML, and calls sitecore-yaml for serialization and push.
paths:
  - "**/src/components/**/*.tsx"
  - "**/.sitecore/component-map*.ts"
  - "**/design-screenshots/**/component-review.json"
  - "**/*.module.json"
---

# Sitecore from Capture

Use this skill after `component-review.json` is approved.

## Inputs

- `design-screenshots/{project}/component-review.json`
- `sections/manifest.json`
- per-section PNGs and `section.html`
- target rendering host path
- target serialization module path

## Build order

1. Resolve current rendering host and module. Do not write into another project.
2. Read approved `component-review.json`.
3. For each row:
   - `create`: build TSX + YAML.
   - `reuse`: wire existing rendering only.
   - `skip`: do nothing.
   - `unclear`: ask or leave unresolved.
4. Build child card/item components before parent sections that use placeholders.
5. Register components in `.sitecore/component-map.ts` and `.sitecore/component-map.client.ts` when present.
6. Call `sitecore-yaml` for collection/site/rendering items.
7. **Media (mandatory):** collect unique image URLs from each approved component’s `section.html` (and page HTML for chrome). Prefer [`sitecore-content-hub-images`](../sitecore-serialization-skills/sitecore-content-hub-images/SKILL.md) (DAM XML) when CH credentials are loaded; otherwise [`sitecore-media-from-url-yaml`](../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md) with `-BaseUrl` from `source-url.txt` and `<image mediaid="{MediaId}" />`. See [media-from-mimic.md](../sitecore-yaml/references/media-from-mimic.md).
8. Run `npm run build` and fix errors before serialization **push** (media-library include must be pushed so images exist in Sitecore).

## TSX rules

- Use Content SDK field components: `Text`, `RichText`, `Image`, `Link`, `Placeholder`.
- No hardcoded marketing copy in JSX.
- Define a typed `Fields` interface for every component.
- Add editable image/link/text fields based on screenshot + HTML evidence. Image fields must resolve to Sitecore media items created in the media step — not remote URLs.
- Root element must have a stable React `key` from `params.RenderingIdentifier` or `rendering.uid`.
- Use one file per rendering: `src/components/{namespace}/{ComponentName}.tsx`.
- Add variants when visually useful: `Default`, `Animated`, `Inversed`, `ImageTop`, `ImageBottom`, `Carousel`.
- If the component has repeatable children, use a named dynamic placeholder.

## Placeholder rules

For every TSX `<Placeholder>`:

- create project placeholder YAML;
- create site placeholder settings if needed;
- set the parent rendering `Placeholders` field;
- use dynamic placeholder keys:

```tsx
const phKey = `teaser-cards-${props.params.DynamicPlaceholderId}`;
<Placeholder name={phKey} rendering={props.rendering} />
```

## Page/partial design rules

- Header and Footer belong in partial designs when the target site uses them.
- Page content belongs in page item renderings.
- Internal links discovered from header/footer/nav should have stub page items before YAML push.
- Renderings XML must use valid GUIDs and escaped XML attributes.

## Evidence priority

1. Section PNGs across desktop/tablet/mobile.
2. Full-page clean PNGs for page flow.
3. `section.html` for text, links, alt text, assets, and selectors.
4. Existing project components as style/reference patterns only.

The screenshot wins when HTML or old patterns conflict with the design.

## Done gate

Before marking complete:

- all approved `create` components exist as TSX;
- component map is updated;
- rendering/template/datasource YAML exists;
- placeholder YAML exists for every placeholder;
- media YAML exists for downloaded assets and every Image field uses `mediaid` (no hotlinked CDN);
- `dotnet sitecore serialization push` has uploaded `media-library` (or the user declined push — report that media is YAML-only until they push);
- page YAML wires approved renderings in the correct order;
- `npm run build` passes or failures are reported exactly;
- `dotnet sitecore serialization validate --fix` is run when available.

See `references/sitecore-build-contract.md`.
