---
name: sitecore-serializing-roles-json
description: Configure Sitecore Content Serialization role predicates in *.module.json. Use when adding roles arrays, reviewing orphan-deletion risk, or custom security domains. Does not cover pull or push — configure JSON only.
paths:
  - "**/*.module.json"
  - "sitecore.json"
---

# Sitecore role serialization (module.json)

Configure **which roles** are included in Sitecore Content Serialization via `roles` predicates in `*.module.json`. This skill covers **JSON configuration only** .

Official reference: [Configure role serialization](https://doc.sitecore.com/xp/en/developers/104/developer-tools/configure-role-serialization.html)

Related: [sitecore-new-collection-yaml](../sitecore-new-collection-yaml/SKILL.md) · [sitecore-new-site-yaml](../sitecore-new-site-yaml/SKILL.md) · [sitecore-new-rendering-yaml](../sitecore-new-rendering-yaml/SKILL.md) · [sitecore-serializing-users-json](../sitecore-serializing-users-json/SKILL.md)

## When to use

- Add or review `roles` predicates in a module's `*.module.json`
- Document project-specific roles (e.g. `sitecore\Developer`, `extranet\MySite.Editor`)
- Plan custom security domains before deployment
- Set `removeOrphansForRoles` in `sitecore.json` (understand risk before enabling)

---

## Configure in `*.module.json`

Add a top-level **`roles`** array (sibling to `items`, not inside it):

```json
{
  "namespace": "MyProject",
  "items": {
    "includes": [ ... ]
  },
  "roles": [
    {
      "domain": "sitecore",
      "pattern": "Developer"
    },
    {
      "domain": "sitecore",
      "pattern": "MyProject\\.*"
    },
    {
      "domain": "extranet",
      "pattern": "^MySite\\..*$"
    }
  ]
}
```

### Properties

| Property  | Required | Description                                                                          |
| --------- | -------- | ------------------------------------------------------------------------------------ |
| `domain`  | Yes      | Sitecore role domain (`sitecore`, `extranet`, custom domain name)                    |
| `pattern` | Yes      | Regex matching role names **within that domain** (not the full `domain\role` string) |

### Pattern examples

| Goal         | domain     | pattern         |
| ------------ | ---------- | --------------- |
| Single role  | `sitecore` | `Developer`     |
| Prefix match | `custom`   | `Role.*`        |
| Full control | `extranet` | `^MySite\\..*$` |

Escape backslashes in JSON: `"MyProject\\Editor"`.

Use **narrow** patterns. Never use `^.*$` on `sitecore` without understanding orphan deletion.

---

## Orphan deletion (critical)

When `removeOrphansForRoles` is `true` in `sitecore.json`, **roles in CM that match the predicate but are not on disk are deleted on push.**

Default safe posture: keep `"removeOrphansForRoles": false` unless your team explicitly owns role sync.

Before changing predicates:

1. Run `dotnet sitecore serialization info -t` and confirm matched roles
2. Add or narrow `roles` patterns deliberately
3. Only then let your DevOps process run sync (outside this skill)

---

## Custom security domains

The CLI can serialize roles in a **custom domain**, but sync does **not** create the domain. Create the security domain manually in the target CM instance before roles in that domain can work.

---

## CLI-side configuration (`sitecore.json`)

Orphan handling example:

```json
{
  "removeOrphansForRoles": false
}
```

---

## Verify configuration (info only)

Use **`info`** to inspect predicates — **not pull or push**:

```powershell
dotnet sitecore serialization info
dotnet sitecore serialization info -t
```

Summary:

```
MyModule
  Subtrees:
    Templates: /sitecore/templates/Project/my-site
  Roles: 3
```

Detail (`-t`):

```
    Roles:
        domain :extranet
        pattern:^MySite\\..*$
```

---

## Do not

- Add `"pattern": "^.*$"` on `sitecore` domain without understanding orphan deletion
- Assume custom domains exist on target — create them first
- Store passwords or secrets in role definitions

---

## Example for a new site module

```json
{
  "$schema": "../.sitecore/schemas/ModuleFile.schema.json",
  "namespace": "AcmeProject",
  "items": {
    "path": "acme",
    "includes": [
      {
        "name": "templatesProject",
        "path": "/sitecore/templates/Project/acme",
        "scope": "ItemAndDescendants",
        "allowedPushOperations": "CreateUpdateAndDelete"
      }
    ]
  },
  "roles": [
    {
      "domain": "sitecore",
      "pattern": "Acme Author"
    },
    {
      "domain": "sitecore",
      "pattern": "Acme Developer"
    }
  ]
}
```

After editing predicates, run `dotnet sitecore serialization info -t` to verify scope — commit `*.module.json` changes; sync is a separate DevOps step.
