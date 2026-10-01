---
name: sitecore-env-local
description: Configures .env.local for a Sitecore Content SDK 2.x editing host from Deploy portal Developer Settings. Always ask the user for Edge Context ID, site name, and editing secret — never assume or copy from other apps without confirmation. Use when connecting a local editing host to SitecoreAI, setting environment variables, or after scaffolding a new website.
paths:
  - "editing-hosts/**/.env*"
  - "industry-verticals/**/.env*"
  - "**/sitecore.config.ts"
---

# Sitecore `.env.local` for editing hosts

Configure a **Content SDK 2.x** Next.js app to connect to a **remote SitecoreAI / XM Cloud environment** by writing `.env.local` from values in the **Sitecore Deploy portal → Developer settings** tab.

**Template reference:** [references/env-template.md](references/env-template.md)

**Portal guide:** [references/developer-settings.md](references/developer-settings.md)

**Auth0 (when login detected):** [`sitecore-auth0-authentication`](../sitecore-auth0-authentication/SKILL.md) + [Auth0 Next.js quickstart](https://auth0.com/docs/quickstart/webapp/nextjs)

---

## When to apply

- User asks to **connect** the editing host to SitecoreAI / XM Cloud
- After [`scaffold-rendering-host`](../scaffold-rendering-host/SKILL.md) or [`mimic-url`](../../mimic-website-skills/mimic-url/SKILL.md) Phase 1
- User wants to **preview locally** (`npm run dev`) against a pushed site
- Local `npm run dev` fails with missing Edge / site / editing secret errors

---

## Required agent behavior — always ask

**Never assume** Developer Settings values. **Always ask the user** to provide them before writing or updating `.env.local`.

| Do | Don't |
|----|-------|
| Ask user to paste Developer settings from Deploy portal | Copy Edge Context ID / editing secret from another app's `.env.local` without asking |
| **Propose** a value when you can infer it (e.g. `NEXT_PUBLIC_DEFAULT_SITE_NAME` from site YAML path) and ask user to confirm | Invent or guess Edge Context ID or editing secret |
| Wait for user confirmation before overwriting existing `.env.local` | Store real secrets in skill files, commit messages, or skill examples |
| Write `.env.local` only after user provides the required keys | Skip asking because "another host in the repo probably uses the same environment" |

**Proposing vs assuming:** You may suggest `NEXT_PUBLIC_DEFAULT_SITE_NAME={sitename}` or `SITECORE_RENDERINGHOST_NAME={folder}` from project context, but **Edge Context ID** and **SITECORE_EDITING_SECRET** must always come from the user (Deploy portal paste).

---

## Step 1 — Locate the editing host app

| Input | Example |
|-------|---------|
| App path | `editing-hosts/{app-name}/` |
| Env file | `{app-path}/.env.local` |
| Example template | `{app-path}/.env.remote.example` |

Copy `.env.remote.example` → `.env.local` when `.env.local` does not exist. **Do not overwrite** an existing `.env.local` without confirmation — merge or update only the keys the user provides.

---

## Step 2 — Ask user for Developer settings (Content SDK 2.x)

Prompt the user:

> Please paste your **Sitecore Deploy portal → Developer settings** values for this environment (Content SDK 2.x preview).  
> Open: Deploy portal → **project** → **environment** (e.g. production) → **Developer settings** tab.

**Minimum required** — user must provide (paste as a block or one-by-one):

| Portal / user label | `.env.local` key(s) |
|---------------------|---------------------|
| Edge Context ID | `SITECORE_EDGE_CONTEXT_ID` **and** `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` (same value) |
| Site name | `NEXT_PUBLIC_DEFAULT_SITE_NAME` |
| Editing secret | `SITECORE_EDITING_SECRET` |

**Shape of what you need** (placeholders only — never commit real values to skills):

```env
SITECORE_EDGE_CONTEXT_ID=<from-user>
NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID=<from-user>
NEXT_PUBLIC_DEFAULT_SITE_NAME=<from-user-or-confirmed-proposal>
SITECORE_EDITING_SECRET=<from-user>
```

You may **propose** `NEXT_PUBLIC_DEFAULT_SITE_NAME` from the Sitecore site item path (`{sitename}` segment) or `*.module.json`, then ask: *"Confirm site name is `{sitename}`?"*

### Optional Sitecore keys

Ask only when needed; copy from Developer settings or `.env.remote.example` when the user provides them:

| Variable | When needed |
|----------|-------------|
| `NEXT_PUBLIC_DEFAULT_LANGUAGE` | Non-default language |
| `NEXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME` | Custom Edge hostname |
| `SITECORE_EXPERIENCE_EDGE_HOSTNAME` | Media URL rewriting / staging |
| `NEXT_PUBLIC_PERSONALIZE_SCOPE` | Personalize enabled |
| `SITECORE_AUTH_CLIENT_ID` / `SITECORE_AUTH_CLIENT_SECRET` | Design Library |
| `SITECORE_RENDERINGHOST_NAME` | Must match `xmcloud.build.json` rendering host key — safe to propose from folder name, confirm with user |
| `SITECORE_AUTHORING_GRAPHQL_URL` | Authoring GraphQL (Design Library) |
| `SITECORE_AUTH_TOKEN_URL` / `SITECORE_AUTH_AUDIENCE` | Sitecore Cloud OAuth |

See [developer-settings.md](references/developer-settings.md) for portal navigation.

---

## Step 3 — Write `.env.local`

1. Read `{app-path}/.env.remote.example` for structure and comments.
2. Set the four **required** keys from user-provided values (Step 2).
3. Fill optional keys only when the user supplied them.
4. Preserve unrelated existing keys when merging (e.g. `DEBUG`, AI keys).
5. Leave unknown optional keys empty or commented.

**File path:** `{app-path}/.env.local` (Next.js convention — not `.local.env`).

---

## Step 4 — Auth0 block (when login detected)

Add Auth0 variables **only when**:

- [`sitecore-page-from-design`](../sitecore-page-from-design/SKILL.md) / component manifest includes Header auth, Login, Register, or Profile, **and** user approved Auth0 setup, **or**
- User explicitly requests Auth0 / login functionality

Follow [`sitecore-auth0-authentication`](../sitecore-auth0-authentication/SKILL.md) Phase 1. **Ask the user** for Auth0 Dashboard values — same rule: never assume.

---

## Step 5 — Verify

```powershell
cd {app-path}
npm run dev
```

| Check | Expected |
|-------|----------|
| Home page loads | Content from Edge / CM |
| No missing env errors | Console clean of `SITECORE_*` / `NEXT_PUBLIC_*` warnings |
| Editing mode | Pages editor connects when `SITECORE_EDITING_SECRET` matches portal |

Restart the dev server after changing `.env.local`.

---

## Agent behavior (summary)

- **Always ask** for Developer settings before first `.env.local` write
- **Propose** site name / rendering host name from project context; **confirm** with user
- **Execute** create/update `.env.local` only after user provides Edge Context ID, site name, and editing secret
- **Never commit** `.env`, `.env.local`, `.env copy`, `.env.bak`, `copy.env`, or any other file that contains real keys. Write secrets only to `.env.local`
- **Never** store real Edge Context IDs, editing secrets, or API keys in skill files, examples, or a second env file "for reference"

---

## Integration with mimic-url

After Phase 1 scaffold:

1. **Ask user** for Deploy portal Developer settings (do not defer, do not copy from sibling hosts silently).
2. Write `.env.local` before first `npm run dev` / local preview.
3. If Auth0 rows are approved in Phase 4 manifest, ask for Auth0 values in a follow-up step.

---

## Checklist

```
- [ ] App path: editing-hosts/___/
- [ ] User asked for Developer settings (Edge Context ID, site name, editing secret)
- [ ] User values received — not assumed from another app
- [ ] .env.local created or merged from .env.remote.example
- [ ] SITECORE_EDGE_CONTEXT_ID + NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID
- [ ] NEXT_PUBLIC_DEFAULT_SITE_NAME
- [ ] SITECORE_EDITING_SECRET
- [ ] Optional Sitecore vars (only if user provided)
- [ ] Auth0 block (if login detected / requested — ask user)
- [ ] npm run dev verified
```

---

## Do not

- Assume or copy Edge Context ID / editing secret from another editing host without asking the user
- Commit `.env`, `.env.local`, `.env copy`, `.env.bak`, `copy.env`, or any duplicate that contains real secrets
- Overwrite `.env.local` without user confirmation when it already has values
- Add Auth0 vars when the site has no login requirement and user did not ask
- Use `.local.env` — Next.js expects `.env.local`
- Put real environment values in skill markdown, examples, or comments
