---
name: sitecore-auth0-authentication
description: Adds Auth0 authentication to Sitecore Content SDK Next.js apps — login, register, profile edit, header auth state, Management API, env config, and Sitecore components. Use when a design shows Login/Sign in/Join/Register/Profile, when gated content needs auth, or when the user asks for Auth0 login functionality.
paths:
  - "**/src/lib/auth0*.ts"
  - "**/src/components/**/*.tsx"
  - "**/src/app/api/**/register/**"
  - "**/src/app/api/**/profile/**"
  - "**/.env*.example"
---

# Sitecore Auth0 authentication

Add **end-to-end Auth0 authentication** to a Sitecore Content SDK Next.js rendering host: SDK wiring, server libs, API routes, and Sitecore components (Login, Register, Edit Profile, authenticated Header).

**Component + YAML rules:** [`sitecore-content-sdk-component`](../sitecore-content-sdk-component/SKILL.md)

**Serialization:** [`sitecore-new-collection-yaml`](../../sitecore-serialization-skills/sitecore-new-collection-yaml/SKILL.md) · [`sitecore-new-site-yaml`](../../sitecore-serialization-skills/sitecore-new-site-yaml/SKILL.md)

**SitecoreAI identity (required after Auth0):** [`sitecore-cloudsdk-identity-events`](../../sitecore-cloud-sdk-skills/sitecore-cloudsdk-identity-events/SKILL.md)

**References:**

- [Auth0 Next.js quickstart](https://auth0.com/docs/quickstart/webapp/nextjs) — official `@auth0/nextjs-auth0` v4 setup, `.env.local` vars, callback URLs, proxy/middleware
- [`sitecore-env-local`](../sitecore-env-local/SKILL.md) — write Sitecore + Auth0 blocks into `.env.local` from portal / user input
- [references/env-vars.md](references/env-vars.md) — required environment variables
- [references/metadata-questionnaire.md](references/metadata-questionnaire.md) — `user_metadata` / `app_metadata` proposals by site type
- [references/lib-patterns.md](references/lib-patterns.md) — server/client lib templates
- [references/component-checklist.md](references/component-checklist.md) — components, pages, and wiring

---

## When to apply

Apply this skill when **any** of the following is true:

| Trigger | Action |
|---------|--------|
| Screenshot/HTML shows **Login**, **Sign in**, **Join**, **Register**, **Create account**, or **Profile** in header or hero | Full auth stack + all auth UI components |
| User asks for login, registration, or member-only areas | Full auth stack |
| Page design skill marks Header with auth controls | Run this skill **before** finalizing Header TSX |
| Gated routes or API routes need session | Lib + middleware only (skip UI if no login button in design) |

**Default profile route:** `/profile` — profile name/button in header navigates here after login unless the user specifies another path.

---

## Phase 0 — Metadata questionnaire (required before coding)

Before implementing register/profile forms, define what Auth0 stores.

1. Read site context (industry, page types, join flows, communities, subscriptions, B2B vs B2C).
2. Propose fields using [metadata-questionnaire.md](references/metadata-questionnaire.md).
3. **Ask the user** to confirm, add, or remove fields when anything beyond standard identity (name, email) is needed.

| Store in | Examples | Who edits |
|----------|----------|-----------|
| **Standard Auth0 profile** | `given_name`, `family_name`, `email`, `picture` | Register + profile forms |
| **`user_metadata`** | company, preferences, notification toggles, marketing opt-in | User via profile form |
| **`app_metadata`** | roles, entitlements, membership flags, admin grants | Server / Auth0 Actions only — never from client forms |

Document the agreed schema in a typed `{Project}AccountProfile` (or similar) in `src/lib/`.

---

## Phase 1 — Package and Auth0 tenant setup

### npm

```bash
npm install @auth0/nextjs-auth0 jose
```

Use the project's existing major version if already present.

### Auth0 Dashboard (Regular Web Application)

Configure for the rendering host base URL (`APP_BASE_URL`):

| Setting | Value |
|---------|--------|
| Allowed Callback URLs | `{APP_BASE_URL}/auth/callback` |
| Allowed Logout URLs | `{APP_BASE_URL}` |
| Application type | Regular Web Application |

### Machine-to-Machine app (register + profile updates)

Create an M2M application authorized for **Auth0 Management API** with scopes:

- `create:users` (registration)
- `read:users`, `update:users` (profile read/patch)
- `read:roles` (optional — custom claims enrichment)

Document all vars in `.env.local` and `.env.remote.example` — see [env-vars.md](references/env-vars.md) and the [Auth0 Next.js quickstart](https://auth0.com/docs/quickstart/webapp/nextjs) (Step 4 — `.env.local` template). Use [`sitecore-env-local`](../sitecore-env-local/SKILL.md) to merge Auth0 keys into the editing host env file. **Never commit secrets.**

### Database connection

Enable **Username-Password-Authentication** (or note custom connection name in `AUTH0_DB_CONNECTION`).

### Post-Login Action (when using custom claims)

If the site needs roles, entitlements, or namespaced claims on the session:

1. Create a Post-Login Action with a `namespace` variable matching `AUTH0_CLAIM_NAMESPACE`.
2. Add claims to the ID token (roles, `app_metadata` slices, etc.).
3. Implement `beforeSessionSaved` enrichment in `src/lib/auth0.ts` to merge token + Management API data into the session user.

Skip Post-Login Actions for simple sites that only need name/email from the IdP.

---

## Phase 2 — Server infrastructure

Create generic libs under `src/lib/` (rename `{Project}` to match the app — **do not** hardcode client names):

| File | Purpose |
|------|---------|
| `auth0.ts` | `Auth0Client` with optional `beforeSessionSaved` |
| `auth0-management.ts` | M2M token cache, `createAuth0User`, `patchAuth0ManagementUser`, `getAuth0ManagementUser` |
| `auth0-enrich-user.ts` | Merge ID token claims + Management API into session (optional) |
| `auth0-session.ts` | `getAuth0Session()`, `isAuth0AuthenticatedUser(user)` — true when `user.sub` is non-empty |
| `auth0-profile.ts` | `buildLoginUrl(returnTo)`, `buildLogoutUrl(returnTo)`, claim namespace helpers |
| `auth0-account.ts` | Typed profile DTO, defaults, `buildAccountProfile(user)`, `resolveDisplayName(user)` |

Patterns: [references/lib-patterns.md](references/lib-patterns.md)

### Proxy / middleware

Integrate Auth0 **only on `/auth/*`** paths inside the Sitecore proxy (or Next.js middleware) to avoid OIDC discovery on every page view:

```typescript
function shouldRunAuth0Middleware(req: NextRequest): boolean {
  if (isSitecorePagesEditorRequest(req)) return false;
  return req.nextUrl.pathname.startsWith('/auth');
}
```

Skip Auth0 middleware for Sitecore Pages editor requests (`mode=edit`, `itemId` + `site`, etc.).

### Root layout / page

1. Server: `const session = await getAuth0Session()` in the catch-all page (or layout).
2. Pass `user={session?.user}` into `Auth0Provider`.
3. Set `profileRoute="/api/{project}/profile"` on `Auth0Provider` so `useUser()` stays fresh after profile PATCH.

### API routes

| Route | Methods | Auth |
|-------|---------|------|
| `src/app/api/{project}/register/route.ts` | POST | Public — creates Auth0 user via Management API |
| `src/app/api/{project}/profile/route.ts` | GET, PATCH | Session required — read/update `user_metadata` |

Validate input server-side; map form fields to agreed metadata schema from Phase 0.

---

## Phase 3 — Client provider

In `src/Providers.tsx`:

```tsx
import { Auth0Provider } from '@auth0/nextjs-auth0/client';

<Auth0Provider user={user ?? undefined} profileRoute="/api/{project}/profile">
  <Auth0IdentityTracker />
  <SitecoreProvider ...>{children}</SitecoreProvider>
</Auth0Provider>
```

See Phase 3b and [`sitecore-cloudsdk-identity-events`](../../sitecore-cloud-sdk-skills/sitecore-cloudsdk-identity-events/SKILL.md) for `Auth0IdentityTracker`.

---

## Phase 3b — SitecoreAI IDENTITY events (required)

After Auth0 wiring, **always** apply [`sitecore-cloudsdk-identity-events`](../../sitecore-cloud-sdk-skills/sitecore-cloudsdk-identity-events/SKILL.md):

1. Ensure Cloud SDK browser init (`Bootstrap.tsx` or `ensureCloudSdkInitialized`).
2. Add `Auth0IdentityTracker` inside `Auth0Provider` in `Providers.tsx`.
3. On authenticated session → `identity()` with email + Auth0 identifiers.
4. On logout → clear identity dedupe marker.

Do not consider Auth0 implementation complete without IDENTITY event integration.

---

## Phase 4 — Auth UI components (when login appears in design)

When a **Login** (or equivalent) control appears in the screenshot, create **all four** UI pieces — not only the visible button.

### 4a — `{Name}LoginSection` (optional dedicated page)

Use when design shows a standalone sign-in page or modal content.

- Primary CTA → `buildLoginUrl('/profile')` or `returnTo` from Sitecore Link field
- Link to register page (`/register` or `/join`)
- `'use client'` not required if only links; use client hook if showing inline errors

### 4b — `{Name}RegisterSection` (required)

- Form fields from Phase 0 schema + password, confirm password, terms checkbox
- POST to `/api/{project}/register`
- On success → redirect to `buildLoginUrl('/profile')` or show “check email” message
- Link to login (`buildLoginUrl(...)`)
- Sitecore fields for labels, option lists (sector, topics), legal links — follow [component-checklist.md](references/component-checklist.md)

### 4c — `{Name}ProfileSection` (required)

- Route: Sitecore page at **`/profile`** (unless user specified otherwise)
- Tabs or sections: profile details, preferences, notifications, marketing — match Phase 0 schema
- GET `/api/{project}/profile` on mount; PATCH on save
- `'use client'` with `useUser()`; redirect unauthenticated users via `buildLoginUrl('/profile')`
- Logout control → `/auth/logout`

### 4d — Header auth state (required when header has login)

Extend the existing `Header` component (do not duplicate headers):

**Logged out** (matches screenshot):

- Show Login link → `buildLoginUrl(currentPath)` or Sitecore `LoginLink` field default `/auth/login`
- Show Join/Register link if present in design

**Logged in** (must differ clearly from logged-out state):

- Replace Login with **display name** and/or **avatar** (`user.picture`)
- Clicking name/avatar → `/profile` (use `useProfileNavigation` hook — see lib patterns)
- Optional dropdown: Profile, Logout (`/auth/logout`)
- Visual cues: filled avatar circle, chevron, “Welcome, {name}”, hide Join CTA

```typescript
// src/components/{project}/profile-nav.ts
export function useProfileNavigation(profilePath = '/profile') {
  const { user, isLoading } = useUser();
  // unauthenticated → window.location.assign(buildLoginUrl(profilePath))
  // authenticated → router.push(profilePath)
}
```

In Sitecore editing mode, show design defaults (Login visible) — do not call Auth0 hooks in ways that break editor hydration; use existing editing hydration patterns from the app.

### Sitecore YAML

For each component: template, rendering, parameters, datasource, sample content, module registration — per [sitecore-content-sdk-component](../sitecore-content-sdk-component/SKILL.md).

Suggested routes:

| Page | Path | Components |
|------|------|------------|
| Register / Join | `/register` or `/join` | `{Name}RegisterSection` |
| Profile | `/profile` | `{Name}ProfileSection` |
| Login | Usually Auth0 Universal Login — optional `{Name}LoginSection` at `/login` if design shows custom page |

---

## Phase 5 — Protected content (optional)

When pages or APIs require authentication:

1. **Server redirect** in catch-all page: if path is in `PROTECTED_PATHS` and no session → `redirect(buildLoginUrl(path))`.
2. **API routes**: `getAuth0Session()` → 401 if missing.
3. **Client-gated UI**: `useUser()` + `isAuth0AuthenticatedUser` — show login prompt instead of action buttons.

Keep protected path lists in `src/lib/auth0-routing.ts` (generic name), not scattered in components.

---

## Phase 6 — Verification checklist

- [ ] `npm run build` passes in the rendering host after auth TSX / API route changes (fix all errors)
- [ ] `.env.example` documents all Auth0 vars (no secrets committed)
- [ ] `/auth/login`, `/auth/callback`, `/auth/logout` work via proxy middleware
- [ ] Register POST creates user in Auth0 with agreed `user_metadata`
- [ ] Profile GET/PATCH updates session (refresh via `profileRoute`)
- [ ] Header shows Login when logged out; name/avatar + profile link when logged in
- [ ] Click profile → `/profile` (unless overridden)
- [ ] Sitecore editor still renders Header and auth components
- [ ] Register, Profile, Header auth wired in component map + import map
- [ ] Page YAML exists for `/profile` and register route
- [ ] `dotnet sitecore serialization validate --fix` passes
- [ ] IDENTITY event fires after login (see [`sitecore-cloudsdk-identity-events`](../../sitecore-cloud-sdk-skills/sitecore-cloudsdk-identity-events/SKILL.md))

---

## Integration with design skills

When [`sitecore-page-from-design`](../sitecore-page-from-design/SKILL.md) detects auth UI in the Header or a Form/signup band:

1. Mark **Auth** rows in the manifest (LoginHeader, RegisterSection, ProfileSection).
2. Run **this skill** during Phase 3 before shipping Header-only login links.
3. Do not leave Login as a static `/auth/login` link without logged-in header state.

---

## Do not

- Store secrets in TSX, YAML, or git
- Put `app_metadata` fields on register forms (server/Actions only)
- Run Auth0 middleware on every request (only `/auth/*`)
- Break Sitecore Pages editor with forced login redirects
- Use client-specific prefixes in generic lib names when starting greenfield (use `{project}` consistently)
- Skip Register + Profile components when the design shows Login

---

## Scope control

For auth-only tasks (no new design), implement Phases 0–3 + API routes first, then minimal Header auth state. Add full Register/Profile UI when designs or explicit user request require them.
