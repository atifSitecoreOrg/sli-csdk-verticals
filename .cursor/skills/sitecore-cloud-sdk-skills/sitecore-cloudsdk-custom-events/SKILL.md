---
name: sitecore-cloudsdk-custom-events
description: Sends Sitecore Cloud SDK custom events from Next.js App Router apps for analytics, segmentation, and personalization. Use only when the user explicitly specifies which actions to track and event names to send — not for login identity (use sitecore-cloudsdk-identity-events).
paths:
  - "**/src/lib/**/*event*.ts"
  - "**/src/lib/**/cdp*.ts"
  - "**/src/components/**/*.tsx"
---

# Sitecore Cloud SDK — custom events

Send **`event()`** custom events from a **Next.js App Router** Sitecore Content SDK app to track specific user actions in SitecoreAI.

**Official docs:** [Set up custom events](https://doc.sitecore.com/sdk/en/developers/006/cloud-sdk/set-up-custom-events.html)

**Identity vs custom:** Login and profile resolution → [`sitecore-cloudsdk-identity-events`](../sitecore-cloudsdk-identity-events/SKILL.md). This skill is for **explicitly requested** behavioral tracking only.

**References:**

- [references/custom-event-patterns.md](references/custom-event-patterns.md) — naming, payloads, helper lib

---

## When to apply

Apply **only when the user explicitly states**:

- Which user action to track (e.g. “event registration”, “add to wishlist”, “download PDF”)
- The event name or naming convention to use

**Do not** auto-add custom events when implementing Auth0, search, or page components unless the user lists them.

---

## Prerequisites

Same Cloud SDK setup as identity events:

```bash
npm install @sitecore-cloudsdk/core @sitecore-cloudsdk/events
```

Initialize browser Events package before sending — reuse `ensureCloudSdkInitialized()` from [identity skill init](../sitecore-cloudsdk-identity-events/references/cloud-sdk-init.md) or `Bootstrap.tsx`.

| Requirement | Notes |
|-------------|-------|
| Edge context ID | `config.api.edge.clientContextId` |
| Production / staging | Skip edit, preview, and usually development |
| Event naming | User-provided; recommend `{site}:{ACTION}` format |

---

## Phase 1 — Confirm event catalog with user

Before coding, capture a table:

| User action | Event `type` | Trigger element | `extensionData` fields |
|-------------|--------------|-----------------|------------------------|
| Register for event | `mysite:EVENT_REGISTER` | Submit on event detail | `eventId`, `eventName` |
| Cancel registration | `mysite:EVENT_CANCEL` | Cancel button | `eventId`, `eventName` |

Ask for missing columns. Do not invent event names.

---

## Phase 2 — Tracking helper lib

Create `src/lib/cdp/cdp-custom-events.ts` (or domain-specific file, e.g. `cdp-event-tracking.ts`):

```typescript
import { event } from '@sitecore-cloudsdk/events/browser';
import config from 'sitecore.config';
import { ensureCloudSdkInitialized } from '@/lib/cdp/cdp-cloud-sdk-init';

export async function trackCustomEvent(
  type: string,
  extensionData?: Record<string, string | number | boolean>
): Promise<void> {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV === 'development') return;

  const page = window.location.pathname;

  await ensureCloudSdkInitialized(config.defaultSite);
  await event({
    type,
    channel: 'WEB',
    language: 'EN',
    page,
    extensionData,
  });
}
```

Export **one typed function per agreed event** — e.g. `trackEventRegistration({ eventId, eventName })` — so call sites stay readable and payloads stay consistent.

---

## Phase 3 — Wire triggers (browser)

Per [Sitecore documentation](https://doc.sitecore.com/sdk/en/developers/006/cloud-sdk/set-up-custom-events.html):

```typescript
import { event } from '@sitecore-cloudsdk/events/browser';

// On button click handler:
await event({ type: 'mysite:CLICKED_CTA' });
```

Rules:

- Attach to **clickable controls** (`button`, `a`, submit) — not wrapper divs
- `'use client'` components only for browser-side tracking
- Skip when `page.mode.isEditing` or `page.mode.isPreview`
- `.catch((e) => console.debug(e))` optional — do not block UX on tracking failure

### Rich payloads

```typescript
await event({
  type: 'mysite:EVENT_REGISTER',
  channel: 'WEB',
  currency: 'EUR',
  language: 'EN',
  page: window.location.pathname,
  extensionData: {
    eventId: 'abc-123',
    eventName: 'Annual Summit',
  },
});
```

Pass structured data in `extensionData` for segmentation — not in the event `type` string.

---

## Phase 4 — Server-side custom events (optional)

Only when the user explicitly needs server-side tracking (e.g. after secure API mutation):

```typescript
import { event } from '@sitecore-cloudsdk/events/server';
// Inside middleware after CloudSDK(...).addEvents().initialize():
await event(request, { type: 'mysite:SERVER_ACTION' });
```

Default for App Router UI interactions: **browser-side** in Phase 3.

---

## Phase 5 — Verification

1. User confirms event catalog implemented completely
2. Production/staging build with Edge context ID
3. Network filter: `edge-platform.sitecorecloud.io`
4. Perform tracked action → `POST` events → **201 Created**
5. Validate payload `type` and `extensionData` match spec
6. Locate via `sc_cid` / `browser_id` in SitecoreAI

Checklist:

- [ ] Every event name matches user specification exactly
- [ ] No tracking in edit/preview/dev (unless user overrides)
- [ ] Helpers are typed; no stringly-typed duplicates
- [ ] Identity flows still use IDENTITY skill, not custom events

---

## Do not

- Send custom events for login/register identity — use `identity()`
- Auto-instrument every button on a page without user instruction
- Use generic types like `CLICK` without site prefix — collisions break analytics
- Block UI on `await event()` failures

---

## Related skills

| Skill | Relationship |
|-------|----------------|
| [`sitecore-cloudsdk-identity-events`](../sitecore-cloudsdk-identity-events/SKILL.md) | Identity resolution — always with Auth0 |
| [`sitecore-auth0-authentication`](../../sitecore-rendering-host-skills/sitecore-auth0-authentication/SKILL.md) | Does not imply custom events |
| [`sitecore-search-experience`](../../sitecore-search-experience/SKILL.md) | Search uses Content SDK search analytics event — separate from Cloud SDK custom events |
