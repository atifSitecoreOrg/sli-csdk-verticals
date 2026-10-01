# Media from captured pages (mandatory)

When the user asks to **mimic a page or site**, do **not** hotlink the reference CDN in datasource Image fields. Every component image must land in **Content Hub (preferred)** or the **tenant media library**, then YAML must be patched and **pushed**.

## Choose delivery

| Preference | Skill | Image field shape |
|------------|-------|-------------------|
| **1 — Content Hub** (credentials available) | [`sitecore-content-hub-images`](../../sitecore-serialization-skills/sitecore-content-hub-images/SKILL.md) | `<Image src="…" dam-id="…" … />` |
| **2 — Media library** (no CH) | [`sitecore-media-from-url-yaml`](../../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md) | `<image mediaid="{MediaId}" />` |

Ask once whether Content Hub env is loaded. Prefer path 1 for demos that already use DAM.

## Harvest

From `design-screenshots/{project}/**/section.html` and `page.html`:

- `<img src>` / `srcset`
- `<picture>` sources
- CSS `background-image: url(...)`
- SVG `<image href>`

Resolve relative / root-relative / protocol-relative URLs with capture `source-url.txt` (or the mimic URL) as `-BaseUrl`. Deduplicate by canonical URL.

## Path 1 — Content Hub

Follow [`sitecore-content-hub-images`](../../sitecore-serialization-skills/sitecore-content-hub-images/SKILL.md): stage locally → upload + public links → metadata → patch DAM XML → sync map → validate/push.

Reference scripts: `authoring/items/brother/scripts/` (adapt per collection).

## Path 2 — Media library YAML

Use [`sitecore-media-from-url-yaml`](../../sitecore-serialization-skills/sitecore-media-from-url-yaml/SKILL.md) (`create-media-from-urls.ps1`):

```txt
.cursor/skills/sitecore-serialization-skills/sitecore-media-from-url-yaml/scripts/create-media-from-urls.ps1
```

Wire each Image field as `<image mediaid="{MediaId}" />`. Never leave `{MEDIA:…}` placeholders or external `src` URLs in serialized YAML.

## Upload to Sitecore

```bash
dotnet sitecore serialization validate --fix -i {namespace}
dotnet sitecore serialization push -n {environment} -i {namespace}
```

Do **not** mark mimic complete if:

- images still point at the reference website;
- Image fields lack DAM XML **and** lack mediaid;
- push was skipped.
