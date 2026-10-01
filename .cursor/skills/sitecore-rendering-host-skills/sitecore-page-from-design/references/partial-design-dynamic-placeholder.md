# PartialDesignDynamicPlaceholder

Required infrastructure component for **Partial Designs** and **Page Designs** (Header/Footer chrome on every page). Without it, partial-design placeholders from Sitecore layout do not render in the editing host.

**Canonical examples in repo:**

| App type | Path |
|----------|------|
| Industry vertical | `industry-verticals/kpmg/src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx` |
| Editing host | `editing-hosts/johnson-matthey/src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx` |

**Skill reference copy:** [PartialDesignDynamicPlaceholder.tsx](partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx)

---

## When required

Add this component when the site uses any of:

- Partial Designs under `{siteContentPath}/Presentation/Partial Designs/` (e.g. Header, Footer)
- Page Designs that reference partial designs via `PartialDesigns` field
- Layout chrome (Header/Footer) applied site-wide rather than per-page renderings only

`create-content-sdk-app` does **not** scaffold this file — copy it in after host setup.

---

## Setup checklist

1. **Site placeholder settings** — under `{siteContentPath}/Presentation/Placeholder Settings/Partial Design/`:
   - Ensure the `Partial Design` folder exists (template `52288e39-7830-4694-b62d-32a54c6ef7ba`) — created by site scaffold
   - **Add child YAML for each partial design** (template `d2a6884c-04d5-4089-a64e-d27ca9d68d4c`) with **Placeholder Key** = `sxa-{signature}` — e.g. `Header.yml` → `sxa-header`, `Footer.yml` → `sxa-footer`. **The folder alone is not enough** — missing children cause `Placeholder 'sxa-footer' was not found` and Pages **500** on `sxa-jss`.
   - Templates: [partial-design-placeholder-settings/](partial-design-placeholder-settings/README.md)
   - Examples: use the current project's `Presentation/Placeholder Settings/Partial Design/` tree.

2. **Copy TSX** to `editing-hosts/{app}/src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx` (or `industry-verticals/{app}/…` for vertical apps)
   - Use the [reference copy](partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx) or KPMG — **do not** wrap in extra `<div>` or add `'use client'` unless required
   - Ensure `src/lib/component-props/index.ts` exists (see `sitecore-content-sdk-component`)

3. **Register in component map** — `.sitecore/component-map.ts` (and `.sitecore/component-map.client.ts` if the app uses split maps):

```typescript
import * as PartialDesignDynamicPlaceholder from 'src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  // ... built-in entries ...
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  // ... site components ...
]);
```

- Map key **must** be `PartialDesignDynamicPlaceholder` (matches Sitecore rendering `componentName`)
- Register **without** `componentType: 'client'` (server component)
- Register **before** page-specific components; keep even if not imported elsewhere in TSX

4. **Component placeholder settings** — for section/header/footer components using `<Placeholder>`, also create project-level placeholder YAML and link renderings via **Placeholders** field. See [placeholder-settings.md](../../sitecore-content-sdk-component/references/placeholder-settings.md).

5. **Run `npm run build`** — fix import path (`@/lib/component-props` vs `lib/component-props`) to match project `tsconfig.json`

6. **`__Renderings` XML** on partial designs **and** pages — see [renderings-xml.md](renderings-xml.md): escape `&amp;` in `s:par`; uppercase `uid` + `p:after` GUIDs. Invalid XML breaks Content Editor when opening the item.

---

## How it works

Sitecore injects a rendering with `params.sig` set to the partial design **Signature** (e.g. `header`, `default-header`). This component passes that value to `<Placeholder name={sig} />`, which resolves child renderings from the matching Partial Design item's `__Renderings` layout.

Partial Design YAML example (`Signature: header`):

```yaml
SharedFields:
- ID: "55faae90-3bba-4f7f-96fe-13c3f40055ff"
  Hint: Signature
  Value: header
```

Page Design wires partial designs (on the **Default** page design item, not on individual pages):

```yaml
SharedFields:
- ID: "0966b999-0d0e-4278-acc9-9da69d461fe6"
  Hint: PartialDesigns
  Value: "{HEADER-PARTIAL-DESIGN-GUID}|{FOOTER-PARTIAL-DESIGN-GUID}"
```

---

## Verify

- [ ] TSX at `editing-hosts/{app}/src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder.tsx`
- [ ] `PartialDesignDynamicPlaceholder` entry in `.sitecore/component-map.ts` (no `componentType: 'client'`)
- [ ] `Partial Design` placeholder settings folder + Header/Footer children with `sxa-*` keys
- [ ] Project placeholder settings for nested components + parent rendering **Placeholders** field ([placeholder-settings.md](../../sitecore-content-sdk-component/references/placeholder-settings.md))
- [ ] `npm run build` passes
- [ ] Header/Footer partial designs render in Pages editor / preview
