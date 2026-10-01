# Sitecore build contract

## Component TSX

```txt
src/components/{namespace}/{ComponentName}.tsx
```

Every component should export at least `Default`. Add other variants only when required by screenshot or standard reusable behavior.

## Required YAML per rendering

- Template folder/item
- Template fields
- Rendering item
- Headless variant item
- Datasource folder
- Example datasource item
- Available renderings entry when needed
- Placeholder settings when component exposes placeholders

## Fields

Map visual/content evidence to editable fields:

| Visual/content | Field type |
|---|---|
| Plain heading | Single-Line Text |
| Body with formatting | Rich Text |
| Image/logo/icon | Image |
| Button/CTA/nav item | General Link |
| Repeating child cards | Placeholder + child rendering |
| Boolean UI option | Checkbox or rendering parameter |
| Layout choice | Rendering parameter / variant |

## Naming

- TSX file, rendering item, and component-map key should match `cmsName`.
- Datasource template may use `{ComponentName}`.
- Rendering parameters template may use `{ComponentName} Parameters`.
