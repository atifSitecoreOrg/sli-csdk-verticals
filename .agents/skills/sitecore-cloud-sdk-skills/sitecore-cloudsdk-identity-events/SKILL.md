---
name: sitecore-cloudsdk-identity-events
description: Sends Sitecore Cloud SDK IDENTITY events from Next.js App Router apps to resolve anonymous visitors in SitecoreAI. Use after Auth0 login/register, email subscribe forms, or when identity resolution is required. Automatically paired with sitecore-auth0-authentication.
paths:
  - "**/src/lib/**/cdp*.ts"
  - "**/src/lib/**/*identity*.ts"
  - "**/src/components/**/*Identity*.tsx"
  - "**/src/Bootstrap.tsx"
---

# Sitecore Cloud SDK — IDENTITY events

Send **`identity()`** events from a **Next.js App Router** Sitecore Content SDK rendering host so SitecoreAI can link anonymous browser sessions (`sc_cid` cookie) to known users.

**Official docs:** [Set up IDENTITY events](https://doc.sitecore.com/sdk/en/developers/006/cloud-sdk/set-up-identity-events.html)

**Required after Auth0:** When [`sitecore-auth0-authentication`](../../sitecore-rendering-host-skills/sitecore-auth0-authentication/SKILL.md) is applied, **always run this skill** in the same change set.

**References:**

- [references/cloud-sdk-init.md](references/cloud-sdk-init.md) — browser initialization (App Router)
- [references/identity-patterns.md](references/identity-patterns.md) — `identity()` payloads and tracker components

---

## When to apply

| Trigger | Send IDENTITY when |
|---------|-------------------|
| Auth0 session becomes available | User logs in (Universal Login callback) |
| Register form succeeds | Optional immediate identify if email known before first login |
| Email subscribe / newsletter form | User submits verified email |
| User explicitly asks for CDP / SitecoreAI identity | Any agreed identify moment |

**Do not** send IDENTITY in Sitecore Pages **edit** or **preview** mode, or when Edge context ID is missing.

---

## Prerequisites

### npm packages

```bash
npm install @sitecore-cloudsdk/core @sitecore-cloudsdk/events
```

Import the browser events side-effect once where Cloud SDK initializes:

```typescript
import '@sitecore-cloudsdk/events/browser';
```

### Environment / config

| Source | Purpose |
|--------|---------|
| `SITECORE_EDGE_CONTEXT_ID` / `config.api.edge.clientContextId` | Cloud SDK init |
| `config.api.edge.edgeUrl` | Edge platform URL |
| `config.defaultSite` or `page.siteName` | Site name passed to Cloud SDK |

SitecoreAI site must have **analytics identifiers** configured in the portal.

---

## Phase 1 — Cloud SDK browser init

App Router apps initialize the Events package **in the browser** before calling `identity()`.

**Option A — `Bootstrap.tsx`** (layout-level, production normal mode):

See [cloud-sdk-init.md](references/cloud-sdk-init.md). Pattern used across industry verticals: `CloudSDK({ ... }).addEvents().initialize()`.

**Option B — lazy init helper** (`ensureCloudSdkInitialized(siteName)`):

Call before every `identity()` if Bootstrap is not guaranteed on all routes. Cache the init promise — init only once per page load.

Skip init when:

- `process.env.NODE_ENV === 'development'` (team choice — document if you enable dev tracking)
- `page.mode.isEditing` or `page.mode.isPreview`

---

## Phase 2 — Identity lib

Create `src/lib/cdp/cdp-cloud-sdk-init.ts` and `src/lib/cdp/cdp-identity.ts` (generic names — adjust path to project conventions).

### Core functions

| Function | Use |
|----------|-----|
| `identifyVisitorByEmail(email)` | Forms without Auth0 |
| `identifyAuth0User(user)` | After Auth0 `useUser()` returns authenticated user |
| `clearAuth0IdentityMarker()` | On logout — clear dedupe marker |

### `identity()` payload (minimum)

Per [Sitecore documentation](https://doc.sitecore.com/sdk/en/developers/006/cloud-sdk/set-up-identity-events.html):

```typescript
import { identity } from '@sitecore-cloudsdk/events/browser';

await ensureCloudSdkInitialized(siteName);
await identity({
  channel: 'WEB',
  identifiers: [
    { id: email, provider: 'email' },
  ],
  email,
  firstName,
  lastName,
});
```

**Rich payloads (recommended for Auth0):**

- Second identifier: `{ id: auth0SubOrDisplayName, provider: 'auth0' }`
- `language`, `currency` when known
- `extensionData: { AuthenticationProvider: 'Auth0' }`

Use a valid email whenever possible — email is the primary resolution key for most identity rules.

---

## Phase 3 — Auth0 identity tracker (required with Auth0 skill)

Create a null-render client component, e.g. `Auth0IdentityTracker.tsx`:

1. Mount inside `Auth0Provider` in `Providers.tsx` (sibling to `SitecoreProvider`).
2. `useUser()` from `@auth0/nextjs-auth0/client`.
3. When `user.sub` is present and not yet sent this session → `identifyAuth0User(user)`.
4. When user logs out → `clearAuth0IdentityMarker()`.
5. Guard with `inFlightRef` to prevent duplicate concurrent calls.

**Dedupe:** Store sent `user.sub` in `sessionStorage` so refresh does not spam events.

Do **not** call `identity()` on every render — only on auth state transition to authenticated.

---

## Phase 4 — Register / subscribe hooks

| Flow | When to identify |
|------|------------------|
| Auth0 login | Tracker in Phase 3 (primary) |
| Register API success | Optional — user may not have session yet; rely on post-login tracker unless product requires immediate identify |
| Email capture CTA | Call `identifyVisitorByEmail` on successful validation |

Place event calls on **buttons / form submit**, not on wrapper `<div>` clicks (per Sitecore docs).

---

## Phase 5 — Verification

1. Run app in **production mode** or staging where Edge context ID is set (`npm run build && npm start`).
2. Open browser DevTools → Network → filter `edge-platform.sitecorecloud.io`.
3. Log in (or submit identify form).
4. Confirm `POST` to events endpoint with status **201 Created**.
5. Copy `browser_id` from payload or `sc_cid` cookie value.
6. Locate profile/event in SitecoreAI using that browser ID.
7. Create or confirm an **identity rule** in SitecoreAI if resolution does not merge profiles.

Checklist:

- [ ] Cloud SDK initializes before `identity()`
- [ ] No IDENTITY events in edit/preview mode
- [ ] Auth0 tracker mounted in Providers
- [ ] Logout clears dedupe marker
- [ ] Email format validated before send
- [ ] Import map updated if components use shared lib paths

---

## Integration with Auth0 skill

After completing [`sitecore-auth0-authentication`](../../sitecore-rendering-host-skills/sitecore-auth0-authentication/SKILL.md):

1. Add Phase 3 tracker to `Providers.tsx`.
2. Reuse Auth0 profile helpers for `firstName`, `lastName`, `email`.
3. Do not duplicate identity logic inside Header — keep it in the tracker.

---

## Do not

- Send IDENTITY without initializing Cloud SDK first
- Put PII in custom event types — use IDENTITY for identity resolution
- Use server-side `identity(request, …)` unless you have a defined server trigger (App Router auth flows are usually client-side after hydration)
- Hardcode tenant-specific namespace or site names — read from `sitecore.config`

---

## Server-side identity (edge case)

For server-only flows (rare in App Router auth), use `@sitecore-cloudsdk/events/server` inside middleware **after** `CloudSDK(...).addEvents().initialize()`. See [Set up IDENTITY events — Server side](https://doc.sitecore.com/sdk/en/developers/006/cloud-sdk/set-up-identity-events.html). Default Auth0 + App Router path is **browser-side** via Phase 3 tracker.
