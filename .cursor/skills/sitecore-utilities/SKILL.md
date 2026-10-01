---
name: sitecore-utilities
description: Compact support skill for Sitecore rendering-host scaffolding, local env setup, Auth0 authentication, header/navigation patterns, and Sitecore Cloud SDK custom/identity events. Use only when one of those support tasks is explicitly requested.
paths:
  - "**/.env*"
  - "**/auth0*.ts"
  - "**/middleware.ts"
  - "**/src/components/**/Header*.tsx"
  - "**/src/components/**/Navigation*.tsx"
---

# Sitecore Utilities

Use this skill only for explicit support tasks outside the main website-to-Sitecore capture flow.

## Supported tasks

| Task | Skill |
|------|--------|
| Rendering host scaffold | [scaffold-rendering-host](../sitecore-rendering-host-skills/scaffold-rendering-host/SKILL.md) |
| Local env / edge context | [sitecore-env-local](../sitecore-rendering-host-skills/sitecore-env-local/SKILL.md) |
| Auth0 login/register/profile | [sitecore-auth0-authentication](../sitecore-rendering-host-skills/sitecore-auth0-authentication/SKILL.md) |
| Header / navigation patterns | [header-navigation](../sitecore-rendering-host-skills/header-navigation/SKILL.md) |
| Isolated collection + site playbook | [isolated-collection-site](../sitecore-serialization-skills/isolated-collection-site/SKILL.md) |
| Legal / Pinsent day-to-day | [legal-pinsent](../legal-pinsent/SKILL.md) |
| Cloud SDK custom events | [sitecore-cloudsdk-custom-events](../sitecore-cloud-sdk-skills/sitecore-cloudsdk-custom-events/SKILL.md) |
| Cloud SDK identity events | [sitecore-cloudsdk-identity-events](../sitecore-cloud-sdk-skills/sitecore-cloudsdk-identity-events/SKILL.md) |

## Rules

- Do not trigger this skill during ordinary screenshot capture.
- Do not modify auth/env files unless the user asked for auth/env work.
- Keep generated files inside the current rendering host.
- Open the linked skill only for the task requested.

## Legacy reference copies

Thin copies under `references/` mirror the detailed skills above. Prefer the linked `SKILL.md` files in `sitecore-rendering-host-skills/` and `sitecore-cloud-sdk-skills/`.
