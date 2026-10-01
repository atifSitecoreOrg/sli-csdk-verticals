---
name: sitecore-content-sdk-component
description: Create Sitecore Content SDK Next.js components (TSX) with matching serialization YAML — templates, renderings, placeholders, variants, datasource content. Run npm run build after TSX changes and fix all errors before push. Use when scaffolding Header, Footer, Section, Card, Breadcrumb, or registering components in the component map.
paths:
  - "**/src/components/**/*.tsx"
  - "**/.sitecore/component-map*.ts"
  - "**/sitecore.cli.config.ts"
  - "**/*.module.json"
---

# Sitecore Content SDK component (TSX + YAML)

End-to-end workflow for a **new Sitecore-rendered component** in a Content SDK Next.js App Router app: TypeScript component, variants, component-map registration, and serialized Sitecore items.

**Serialization:** [`sitecore-new-collection-yaml`](../../sitecore-serialization-skills/sitecore-new-collection-yaml/SKILL.md) (validate/push) · [`sitecore-new-rendering-yaml`](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md) (templates/renderings) · [`sitecore-new-site-yaml`](../../sitecore-serialization-skills/sitecore-new-site-yaml/SKILL.md) (site content)

**Related skills:**

- [`sitecore-component-from-design`](../sitecore-component-from-design/SKILL.md) — build from screenshot/HTML upload
- [`sitecore-page-from-design`](../sitecore-page-from-design/SKILL.md) — decompose full page designs

**References (load on demand):**

- [component-types.md](references/component-types.md) — Header / Footer / Section / Card naming
- [tsx-pattern.md](references/tsx-pattern.md) — **full TSX examples** for [Card](references/tsx-pattern.md#card-component), [Section](references/tsx-pattern.md#section-component), [Header](references/tsx-pattern.md#header-component), [Footer](references/tsx-pattern.md#footer-component)
- [references/component-props/index.ts](references/component-props/index.ts) — `ComponentProps` type; create in app if missing
- [yaml-artifacts.md](references/yaml-artifacts.md) — rendering, placeholder, variant, datasource checklist
- [placeholder-settings.md](references/placeholder-settings.md) — **mandatory** project + site placeholder YAML, rendering `Placeholders` field, `PartialDesignDynamicPlaceholder`
- [placeholder-layout.md](references/placeholder-layout.md) — **grid/flex wrapper** for `<Placeholder>` children (`render` prop pattern)
- [component-variants.md](references/component-variants.md) — **Inversed / ImageTop / ImageBottom / Animated / Carousel** rules
- [partial-design-dynamic-placeholder.md](../sitecore-page-from-design/references/partial-design-dynamic-placeholder.md) — required TSX for Partial/Page Designs; copy to `editing-hosts/{app}/src/components/partial-design-dynamic-placeholder/`

**Documentation:** use MCP `search_sitecore_knowledge_sources` (`user-documentation`) for Content SDK APIs, variants, AppPlaceholder, and component-map rules.

---

## Before you start

1. Identify the **rendering host app** (`editing-hosts/{app}/` or `industry-verticals/{app}/`) — all TSX lives there.
2. Ensure **`src/lib/component-props/index.ts`** exists — copy from [references/component-props/index.ts](references/component-props/index.ts) if missing.
3. Ensure **`tsconfig.json`** has the `@/*` path alias so `@/lib/component-props` resolves:

```json
"paths": {
  "@/*": ["src/*"],
  "lib/*": ["src/lib/*"]
}
```

4. Open the site's **`*.module.json`** — note `namespace`, template/rendering/media/site content paths.
5. Scan existing components in `src/components/` for naming prefix, `'use client'` usage, and styling (Tailwind tokens).
6. Run `dotnet sitecore serialization info -t` to confirm module subtrees.
7. **Always** ensure `PartialDesignDynamicPlaceholder` exists in the editing host — `create-content-sdk-app` does not scaffold it. Copy to `editing-hosts/{app}/src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx` and register in component-map ([guide](../sitecore-page-from-design/references/partial-design-dynamic-placeholder.md), [placeholder-settings.md](references/placeholder-settings.md)).
8. Confirm `*.module.json` includes `placeholder-settings` at `/sitecore/Layout/Placeholder Settings/Project/{project}` ([placeholder-settings.md](references/placeholder-settings.md)).

---

## Component classification

Pick a type before naming files:

| Class | Name | Placeholders |
|-------|------|--------------|
| Chrome | `Header`, `Footer`, `Breadcrumb` | Header → nav; Footer → link columns |
| Section | `{Name}Section` | When children repeat (cards, tiles) — **requires Carousel variant** |
| Card | `{Name}Card` | Rare; lives inside Section placeholder |
| Layout shell | `{Name}SectionWrapper` | `main-{*}`, `sidebar-{*}` when two-column + sidebar |

See [component-types.md](references/component-types.md).

---

## Implementation order

### 1. Model fields from content

- List every author-editable value in the design (headings, body, links, images, button labels, aria text).
- Define `{ComponentName}Fields` interface with Content SDK field types (`TextField`, `RichText`, `ImageField`, `LinkField`, …).
- Add `defaultFields` for dev fallbacks only.

**Rule:** no marketing copy hardcoded in JSX — use `<Text field={…}>` / `<RichText field={…}>` / `<Image field={…}>` etc. **Rich Text** template fields must use `<RichText>` — splitting body into multiple `<Text tag="p">` nodes breaks Pages inline editing ([component-types.md](references/component-types.md)).

**Image fields:** classify each Image field with a display mode (`cover`, `contain`, `fill-width`, `column-cover`) per [`image-display-modes.md`](../sitecore-component-from-design/references/image-display-modes.md). Never depend on the uploaded file's intrinsic dimensions.

**Image helper (required for new editing hosts):** add `src/lib/field-image.tsx` and project-scoped `.img--*` CSS **inside this editing host** (you may read another host only as a structural pattern — do not import across hosts). Use `<FieldImage field={…} mode="cover|contain|fill-width|column-cover" />` instead of bare `<Image>` for every authored image so any upload matches the screenshot frame. See [project-isolation.md](../sitecore-component-from-design/references/project-isolation.md).

### 2. Create TSX + variants

**File structure:** create `src/components/{namespace}/{ComponentName}.tsx` — one file per rendering, containing fields interface, layout, and all variant exports. See [tsx-pattern.md — one file per component](references/tsx-pattern.md#one-file-per-component-required).

**React `key`:** set `key={params.RenderingIdentifier ?? rendering?.uid}` on every component's **root HTML element** — Sitecore renders components as placeholder siblings. See [tsx-pattern.md — React key](references/tsx-pattern.md#react-key-on-root-element-required).

Required named exports — see **[component-variants.md](references/component-variants.md)**:

**All components:** `Default`, `Animated` (viewport-once `AnimateIn` on inner elements).

**When layout mirrors:** `Inversed` (left ↔ right only — omit if nothing to reverse).

**When template has Image field:** `ImageTop`, `ImageBottom` (stacked media).

**Section + `<Placeholder>` (not already a carousel component):** also `Carousel`.

**Do not** export `InversedAnimated`. Add extra variants only when the screenshot requires a distinct layout not covered by the standard variant matrix.

**Animated:** use `src/lib/animate-in.tsx` (`<AnimateIn motion="slide-in-left" delay={80}>`). Different elements get different motions with per-instance variation so repeated sibling components do not animate identically. Keep durations slightly slower (roughly ~0.85s-1.1s), run once in viewport, and avoid animate.css dependency.

**Carousel:** use `src/lib/placeholder-carousel.tsx` for grid sections.

**Placeholder layout:** when `Default` is a grid, apply CSS grid/flex on the element returned from `<Placeholder render={(components) => …} />` — [placeholder-layout.md](references/placeholder-layout.md). When using **`renderEach`**, or **two+ sibling `<Placeholder>`** under one parent, prefix wrapper keys per placeholder — [tsx-pattern.md — React keys](references/tsx-pattern.md#react-key-on-root-element-required).

Reuse shared layout functions between variants; **each export must pass different layout flags or BEM modifier classes** so the rendered output is visually distinct. Never alias all three exports to the same layout call.

If using `<Placeholder>`:

```tsx
const phKey = `{semantic-key}-${props.params.DynamicPlaceholderId}`;
<Placeholder name={phKey} rendering={props.rendering} />
```

Mark `'use client'` when using state, effects, or browser APIs.

**Start from the matching example in [tsx-pattern.md](references/tsx-pattern.md):**

| Component type | Example section |
|----------------|-----------------|
| Card | [Card component](references/tsx-pattern.md#card-component) |
| Section | [Section component](references/tsx-pattern.md#section-component) |
| Section + child cards | [Section with placeholder + Carousel](references/tsx-pattern.md#section-with-placeholder--default-grid--carousel-variant) |
| Header | [Header component](references/tsx-pattern.md#header-component) |
| Footer | [Footer component](references/tsx-pattern.md#footer-component) |

Pattern details: [tsx-pattern.md](references/tsx-pattern.md).

### 3. Register component map

- Import in `.sitecore/component-map.ts` and `.sitecore/component-map.client.ts` when App Router uses split maps.
- Map key = rendering item `componentName` field = TSX file base name.
- Set `componentType: 'client'` on server map entry when the file is a Client Component.

Regenerate maps if the project uses CLI generation (`sitecore-tools:generate-map`).

Confirm with MCP docs: *Register a component in the component map*, *Manage component maps for client and server components*.

### 4. Build and fix TypeScript errors

From the **rendering host app root** (e.g. `editing-hosts/{app}/`):

```powershell
cd {rendering-host-path}
npm run build
```

**Required after every new or updated component** (TSX + component-map). **Fix all build errors** before creating YAML or pushing serialization — do not proceed with a failing build.

| Failure type | Action |
|--------------|--------|
| TypeScript (`tsc` / Next compile) | Fix types, imports, missing exports |
| ESLint (if run in build) | Fix lint errors in changed files |
| `component-map` / missing module | Register component; run `sitecore-tools:generate-map` if the project uses it |
| Next.js page/layout errors | Fix in the same pass — often caused by new component imports |

Re-run `npm run build` until exit code is **0**. Repeat after each component or after a batch before marking work complete.

### 5. Create Sitecore YAML (use rendering-yaml skill)

Run [`Generate-SitecoreRendering.mjs`](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md) or follow [rendering-structure.md](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/references/rendering-structure.md). Add fields via `--fields` or [field-item.template.yml](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/references/field-item.template.yml).

**Datasource template guard:** every content datasource YAML `Template:` field must reference the **`{Component} Template` item ID** (from `{Component} Template.yml`). Never use the branch folder ID. After authoring, verify each referenced template GUID exists under `serialized-content/templates/` before push — see [yaml-artifacts.md — Default datasource](references/yaml-artifacts.md#default-datasource).

| Component type | Approach |
|----------------|----------|
| Card / tile | `Generate-SitecoreRendering.mjs` + small field set (e.g. Label, Value) |
| Section | Generator + title, body, CTA fields via `--fields` |
| Header / Footer | Generator + logo, link, nav fields via `--fields` |

Create in order: [yaml-artifacts.md](references/yaml-artifacts.md), [placeholder-settings.md](references/placeholder-settings.md)

1. Template branch + field items (**fresh random UUIDs** per item — see [GUID rules](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md#item-guids-critical))
2. Json rendering item — include **Placeholders** shared field (`069a8361-b1cd-437c-8c32-a3be78941446`) when TSX uses `<Placeholder>`, pointing to placeholder-setting GUID(s)
3. Placeholder setting(s) at `/sitecore/layout/Placeholder Settings/Project/{project}/{key}` — **one YAML per placeholder prefix** used in TSX (`{key}-{*}` pattern + Allowed Controls)
4. Headless Variants folder + one variant YAML **per TSX export**
5. Site `Data/{Component}s/` folder + default datasource with **all field values**
6. Add rendering to Available Renderings presentation item
7. Media library items for Image fields (binary + YAML, or pull after CM upload)
8. When building Partial/Page Designs: create **both** partial design items **and** site `Presentation/Placeholder Settings/Partial Design/{Header,Footer}.yml` children with Placeholder Key `sxa-{signature}` — the site scaffold folder alone is not enough ([partial-design-placeholder-settings/README.md](../../sitecore-page-from-design/references/partial-design-placeholder-settings/README.md))

### 6. Validate and push

```powershell
dotnet sitecore serialization validate --fix -i MODULE_NAMESPACE
dotnet sitecore serialization push -n ENVIRONMENT_NAME
```

### 7. Verify

- [ ] `npm run build` passes with zero errors (re-run after YAML push if TSX changed)
- Component appears in Pages/Experience Editor picker (correct Available Renderings group)
- Variants listed match TSX export names
- Placeholder accepts configured child renderings
- Layout renders with datasource fields, not empty `$name` fallbacks

---

## Placeholder YAML (mandatory when using Placeholder)

Full checklist: [placeholder-settings.md](references/placeholder-settings.md)

For each distinct placeholder prefix in TSX, create **both**:

1. **Placeholder setting** at `/sitecore/layout/Placeholder Settings/Project/{project}/{key}` (template `5c547d4e-7111-4995-95b0-6b561751bf2e`)
2. **Placeholders** field on the parent Json rendering → placeholder-setting GUID

| TSX | Placeholder Key in YAML |
|-----|-------------------------|
| `` `header-nav-${DynamicPlaceholderId}` `` | `header-nav-{*}` |
| `` `teaser-cards-${DynamicPlaceholderId}` `` | `teaser-cards-{*}` |
| `` `link-cards-${DynamicPlaceholderId}` `` | `link-cards-{*}` |
| `` `stats-items-${DynamicPlaceholderId}` `` | `stats-items-{*}` |
| `` `footer-links-${DynamicPlaceholderId}` `` | `footer-links-{*}` |

Set **Allowed Controls** to rendering GUIDs of permitted child components (e.g. `VerticalTeaserCard`, `LinkList`, `Navigation`).

**Do not** only create placeholder settings without linking them on the parent rendering — Pages will not resolve nested placeholders.

---

## Variant YAML (mandatory)

For each `export const VariantName` in TSX, create:

`{siteContentPath}/Presentation/Headless Variants/{Component Display Name}/{VariantName}.yml`

Variant item name must equal export name (`Default`, `Inversed`, `Animated`, `Carousel`, …).

**Headless variant YAML sort order:** add `__Sortorder` SharedField on every variant definition — `Default: 100`, `Inversed: 200`, `ImageTop: 300`, `ImageBottom: 350`, `Animated: 400`, `Carousel: 500` — so Default is always first in Pages. See [yaml-artifacts.md — Headless variant definition](references/yaml-artifacts.md#headless-variant-definition).

For Section components with placeholders, **always** create Headless Variant YAML for `Carousel` alongside `Default`.

---

## Content datasource YAML

Default datasource items seed authoring content:

- Path: `{siteContentPath}/Data/{ComponentName}s/Default {ComponentName}.yml`
- Every template field → `Hint` + `Value` using template field GUIDs
- Copy text/images from design source when building from mockups
- For Image fields, point to media item ID or serialized media path

Create additional datasource YAML files when variants need different default content (e.g. `Default FeatureSection - Inversed.yml`).

---

## Do not

- Aggregate component render logic in a shared barrel file (`lib/all-components.tsx`) with thin re-export wrappers — each component must be self-contained in its own TSX file
- Skip placeholder YAML when TSX uses `<Placeholder>`
- Omit **Placeholders** shared field on parent renderings that use nested placeholders
- Use double braces `{{GUID}}` in rendering **Placeholders** or placeholder-setting **Allowed Controls** — must be single `{GUID}` on CM ([placeholder-settings.md](references/placeholder-settings.md))
- Forget `placeholder-settings` include in `*.module.json`
- Skip `PartialDesignDynamicPlaceholder` in `editing-hosts/{app}/` (required for Partial/Page Designs)
- Use bare `&` in `__Renderings` `s:par` — escape as `&amp;`
- Use **`uid="{GUID}}"`** in `__Renderings` layout `<r>` entries — must be `uid="{GUID}"`; extra `}` zeros edit-layout UIDs and causes duplicate React key `00000000-…` ([renderings-xml.md](../sitecore-page-from-design/references/renderings-xml.md))
- Use lowercase GUIDs in `p:after` — must match uppercase `uid` on referenced rendering ([renderings-xml.md](../sitecore-page-from-design/references/renderings-xml.md))
- Create Partial Designs without matching `Placeholder Settings/Partial Design/{Name}.yml` children (`sxa-{signature}` keys) — causes Pages `sxa-footer` / `sxa-jss` errors ([partial-design-placeholder-settings/README.md](../sitecore-page-from-design/references/partial-design-placeholder-settings/README.md))
- Skip variant YAML for any TSX export intended for authors
- Hardcode visible strings in TSX (except `defaultFields` dev fallbacks)
- Push YAML without `validate --fix`
- Skip `npm run build` or leave TypeScript/Next build errors unfixed
- Regenerate field GUIDs after datasource items exist
- Use site- or client-specific folder names in this skill — resolve paths from `*.module.json`

---

## Quick type → reference map

| Building | TSX reference | YAML reference |
|----------|---------------|----------------|
| Stat / feature tile | [Card component](references/tsx-pattern.md#card-component) | [`sitecore-new-rendering-yaml`](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md) + `--fields` |
| Full-width band | [Section component](references/tsx-pattern.md#section-component) | [`sitecore-new-rendering-yaml`](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md) |
| Grid/carousel band | [Section + Carousel](references/tsx-pattern.md#section-with-placeholder--default-grid--carousel-variant) | [`sitecore-new-rendering-yaml`](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md) |
| Site header | [Header component](references/tsx-pattern.md#header-component) | [`sitecore-new-rendering-yaml`](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md) |
| Site footer | [Footer component](references/tsx-pattern.md#footer-component) | [`sitecore-new-rendering-yaml`](../../sitecore-serialization-skills/sitecore-new-rendering-yaml/SKILL.md) |
