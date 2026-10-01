# Project isolation — one site, one module, one editing host

Each mimic/bootstrap project is **self-contained**. Do not import runtime or serialization artifacts from sibling projects in this repository.

---

## Scope per project

| Asset | Must live under |
|-------|-------------------|
| TSX components, CSS, component-map | `editing-hosts/{this-host}/` only |
| Templates, renderings, placeholders, variants | `authoring/items/{this-module}/` only |
| Page / partial-design / datasource YAML | Same module’s `serialized-content/{sitename}/` tree |
| Component IDs registry (if used) | `{this-module}/scripts/*-component-ids.json` or project-specific path — **never** reuse another module’s JSON |
| Media library items | Same module’s media-library YAML |

**This host ↔ this module ↔ this site** — all three names come from the current project brief (Phase 0 in [`mimic-url`](../../../mimic-website-skills/mimic-url/SKILL.md)).

---

## Forbidden (hard rule)

Do **not**:

- Copy or import TSX from another editing host into the current host (except `PartialDesignDynamicPlaceholder` scaffold pattern — still **copy into** the current host folder, do not reference across hosts)
- Register components in `component-map.ts` that only exist in another editing host
- Point page `__Renderings` at rendering GUIDs from another collection/module
- Reuse datasource item IDs, template IDs, or media IDs from another module’s YAML
- Wire datasource paths like `query:$sharedSites/...` to pull content from another tenant unless the **current** project explicitly shares that site by design
- Copy `.env.local` Edge Context ID, editing secret, or rendering host name from a sibling app without user confirmation
- Run authoring generators for one module against another module’s folder

**If a component “already exists” on another site:** treat it as a **pattern reference** only — regenerate templates, renderings, TSX, and content under the **current** module with **new GUIDs** from that project’s generator scripts. **Do not copy the sibling TSX file as the starting point** — open **this** section PNGs and `section.html` first ([screenshot-done-gate.md](screenshot-done-gate.md)).

---

## Allowed

- Read another project’s files to understand **XML shape**, placeholder wiring, or TSX structure — then **reimplement** under the current paths
- Reuse **generic** skills, scripts, and design-screenshots — not their serialized Sitecore items
- Share **naming taxonomy** (`TitleDescriptionCtaSection`, `HorizontalLinkCard`) — not their YAML instances

---

## Verification checklist

```
- [ ] Every rendering GUID in page YAML exists under authoring/items/{this-module}/
- [ ] Every datasource ID in page YAML exists under the same site’s Data/ folder in that module
- [ ] component-map.ts imports only from src/components/ inside this editing host
- [ ] .env.local NEXT_PUBLIC_DEFAULT_SITE_NAME and SITECORE_RENDERINGHOST_NAME match this project
- [ ] After YAML changes, serialization push targets {this-module}-scs (not a sibling module)
```

---

## Common failure

| Symptom | Cause |
|---------|--------|
| Old component still on live page after local YAML fix | Home/page YAML updated on disk but **not pushed** to CM / Edge cache |
| Wrong component renders but TSX is correct | `.env.local` points at wrong site or rendering host |
| Build passes, EE shows missing component | Rendering exists in another module, not registered in **this** host’s component-map |
| Duplicate GUID conflicts on push | Copied YAML from another module instead of generating fresh IDs for the current one, or reused the wrong `stableGuid` prefix |
| Component “works” but looks nothing like PNG | Copied sibling-host TSX/CSS without screenshot done gate — reimplement from section PNGs |

**Pre-push:** run `node authoring/scripts/Check-SerializationUniqueIds.mjs` then `dotnet sitecore serialization validate --fix -i {module}-scs`. See [`unique-serialization-ids`](../../../sitecore-serialization-skills/unique-serialization-ids/SKILL.md).
