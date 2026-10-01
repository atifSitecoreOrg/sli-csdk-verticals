---
name: sitecore-serializing-users-json
description: Configure Sitecore Content Serialization user predicates in *.module.json and CM GraphQL settings. Use when adding users arrays, reviewing orphan-deletion risk, or server-side sync settings. Does not cover pull or push — configure JSON only.
paths:
  - "**/*.module.json"
  - "sitecore.json"
---

# Sitecore user serialization (module.json)

Configure **which users** are included in Sitecore Content Serialization via `users` predicates in `*.module.json` and related settings. This skill covers **JSON configuration only** — not item YAML workflows.

Official reference: [User serialization](https://doc.sitecore.com/xp/en/developers/104/developer-tools/user-serialization.html) · [Server-side user synchronization configuration](https://doc.sitecore.com/xp/en/developers/104/developer-tools/user-serialization.html#server-side-user-synchronization-configuration)

Related: [sitecore-new-collection-yaml](../sitecore-new-collection-yaml/SKILL.md) · [sitecore-new-site-yaml](../sitecore-new-site-yaml/SKILL.md) · [sitecore-new-rendering-yaml](../sitecore-new-rendering-yaml/SKILL.md) · [sitecore-serializing-roles-json](../sitecore-serializing-roles-json/SKILL.md)

---

## When to use

- Add or review `users` predicates in a module's `*.module.json`
- Document which test/service accounts are intentionally in scope
- Configure CM GraphQL user-sync settings (`AllowUserSynchronization`, `DefaultPassword`)
- Set `removeOrphansForUsers` in `sitecore.json` (understand risk before enabling)

**Avoid** broad patterns that match production accounts. Prefer roles for permissions; use user predicates sparingly.

---

## Configure in `*.module.json`

Add a top-level **`users`** array (sibling to `items`):

```json
{
  "namespace": "MyProject",
  "items": {
    "includes": [ ... ]
  },
  "users": [
    {
      "domain": "sitecore",
      "pattern": "Developer"
    },
    {
      "domain": "sitecore",
      "pattern": "TestUser.*"
    },
    {
      "domain": "extranet",
      "pattern": "^MySite\\..*$"
    }
  ]
}
```

### Properties

| Property  | Required | Description                                |
| --------- | -------- | ------------------------------------------ |
| `domain`  | Yes      | Sitecore user domain                       |
| `pattern` | Yes      | Regex for usernames **within that domain** |

Use **narrow** patterns. Never use `^.*$` on `sitecore` without understanding orphan deletion (see below).

---

## Orphan deletion (critical)

When `removeOrphansForUsers` is `true` in `sitecore.json`, **users in CM that match the predicate but are not on disk are deleted on push.**

Default safe posture: keep `"removeOrphansForUsers": false` unless your team explicitly owns user sync.

Before changing predicates:

1. Run `dotnet sitecore serialization info -t` and confirm matched users
2. Review patterns with a human — exclude production admin and customer accounts
3. Only then let your DevOps process run sync (outside this skill)

---

## CM server configuration

User deserialize requires CM settings. Configuration file:

`<cm_instance_path>\App_Config\Sitecore\Services.GraphQL\Sitecore.Services.GraphQL.Serialization.Users.config`

```xml
<setting name="Sitecore.DevEx.GraphQL.Serialization.Users.AllowUserSynchronization" value="true" />
<setting name="Sitecore.DevEx.GraphQL.Serialization.Users.DefaultPassword" value="sitecore" />
<setting name="Sitecore.DevEx.GraphQL.Serialization.Users.MinPasswordLength" value="8" />
```

| Setting                    | Purpose                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `AllowUserSynchronization` | Must be `true` for user sync operations                                                                          |
| `DefaultPassword`          | Password for **new** users on deserialize. Use `random` for a long random value (admin must reset before login). |
| `MinPasswordLength`        | Minimum length when default password is not `random` (default 8)                                                 |

On SitecoreAI / XM Cloud, confirm how these settings are applied in your deployment model.

---

## CLI-side configuration (`sitecore.json`)

Orphan handling example:

```json
{
  "removeOrphansForUsers": false
}
```

User predicates are independent of `items.excludedFields`.

---

## Verify configuration (info only)

Use **`info`** to inspect predicates — **not pull or push**:

```powershell
dotnet sitecore serialization info -t
```

Summary:

```
MyModule
  Subtrees:
    ...
  Users: 2
```

Detail (`-t`):

```
    Users:
        domain :sitecore
        pattern:TestUser.*
```

---

## Do not

- Serialize broad user sets from production
- Commit password hashes or plaintext passwords
- Enable `AllowUserSynchronization` on production without a security review
- Use `^.*$` patterns without understanding orphan deletion

---

## Example for a dev-only test user

```json
{
  "namespace": "AcmeProject",
  "items": { "includes": [ ... ] },
  "users": [
    {
      "domain": "sitecore",
      "pattern": "^Acme Test$"
    }
  ]
}
```

Pair with CM config `DefaultPassword: random` for new accounts when your team runs user sync.
