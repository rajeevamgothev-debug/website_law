# Lexevo

Lexevo is a greenfield monorepo for a legal identity and client-acquisition platform. The current scaffold focuses on **Phase 1 MVP** from the product spec in `test.txt`: a premium public profile experience for lawyers, lightweight onboarding, and an API shape that can grow into discovery, leads, and communication.

## What's included

- `apps/web`: Next.js App Router frontend with a bold legal-tech landing page, onboarding screen, and public lawyer profile route.
- `apps/api`: Express + TypeScript API skeleton with health, auth, profile, and search modules.
- `packages/contracts`: Shared domain contracts for profiles, onboarding, and discovery.
- `docs/architecture.md`: MVP boundaries, data model direction, security posture, and next milestones.

## Recommended environment

- Node.js `18.10+` for this scaffold, `20.x` LTS preferred for later upgrades
- npm `8+`
- MongoDB `7+`

The workspace currently reports Node `18.10.0`, so the frontend stack is pinned to a Node-compatible Next.js App Router release rather than a Next 14 baseline.

## Install and run

```bash
npm install
npm run dev:web
npm run dev:api
```

## Initial product surface

- `/`: product landing page for lawyers and clients
- `/lawyers/[handle]`: custom-domain style public lawyer identity page
- `/onboarding`: 3-step signup and profile bootstrap flow
- `/api/health`: health check
- `/api/profiles/:handle`: profile read endpoint
- `/api/search/lawyers`: filtered lawyer discovery endpoint
- `/api/auth/request-otp`: OTP bootstrap contract

## Suggested next steps

1. Add MongoDB models for lawyers, reviews, availability, and leads.
2. Replace API mock repositories with persistent storage and validation middleware.
3. Implement OTP provider integration and session issuance.
4. Connect the web app to the API and add dashboard/authenticated routes.
5. Add RBAC, audit logging, and file/document handling before Phase 2 leads.
