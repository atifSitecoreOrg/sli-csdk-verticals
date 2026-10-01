# DAM Image field XML

## Preferred serialization shape

Sitecore Image fields that resolve through Content Hub public delivery:

```yaml
- ID: "{image-field-guid}"
  Hint: Image
  Value: |
    <Image src="https://{tenant}.sitecoresandbox.cloud/api/public/content/{publicContentId}" dam-id="{entityIdentifier}" alt="{alt-slug}" dam-content-type="Image" />
```

| Attribute | Source |
|-----------|--------|
| `src` | Content Hub **public link** URL (`/api/public/content/…`) |
| `dam-id` | Asset identifier from CH (not the numeric entity id alone) |
| `alt` | Stable slug from LocalFile / product name |
| `dam-content-type` | `Image` for bitmaps |

## Do not use for CH path

```xml
<!-- Media library (fallback skill only) -->
<image mediaid="{GUID}" />

<!-- Hotlink — forbidden in mimic -->
<image src="https://www.example.com/-/media/hero.jpg" />
```

## Field map row (CSV)

Typical columns produced by upload scripts:

`DataItemPath`, `FieldName`, `Purpose`, `LocalFile`, `ContentHubAssetId`, `DamId`, `PublicUrl`, `ImageFieldXml`, `SerializationStatus`

Patch YAML from `ImageFieldXml`. After patch, sync should report `InSync` when `dam-id` matches registry.

## Item prerequisites

| Target | Requirement |
|--------|-------------|
| Datasource Image field | Template defines Image (type Image) |
| Page Image / Image2 | Page template section fields exist |
| Header Logo | Header template + Site Header datasource |
| Promo strip Image | PromoStrip **item** under folder — not the folder itself |

Assign **new unique** item IDs — see [`unique-serialization-ids`](../../unique-serialization-ids/SKILL.md).
