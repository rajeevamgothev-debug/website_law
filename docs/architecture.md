# MVP Architecture

## Product scope

The first release should behave like a high-trust digital identity platform for lawyers:

- Create a public, premium profile that feels like a personal website.
- Support handle-based routing now and custom domains later.
- Capture onboarding data in a minimal 3-step flow.
- Prepare search and lead APIs without overbuilding the marketplace.

## Monorepo layout

- `apps/web`: marketing, onboarding, public profiles, later dashboard routes.
- `apps/api`: HTTP API, auth, search, profiles, later leads/payments/realtime.
- `packages/contracts`: cross-app DTOs and domain types.

## Frontend direction

- Next.js App Router for SEO, SSR, and profile pages.
- Tailwind CSS with custom tokens for a premium legal visual system.
- Motion is currently handled with CSS so the Phase 1 scaffold stays dependency-light and runtime-stable.
- Framer Motion can be added when interactive onboarding and feed behaviors actually require it.
- Public pages are server-rendered and can later hydrate selective interactive widgets.

## Backend direction

- Express is sufficient for the initial scaffold while keeping module boundaries clear.
- Each domain module owns its route registration and service logic.
- Shared contracts keep the API and frontend aligned while the system is still moving.
- Mock repositories can be replaced with Mongo-backed repositories without changing route shape.

## Core domain objects

- `LawyerProfileSummary`: discovery card and search response item.
- `LawyerProfile`: full public profile with achievements, articles, pricing, and visibility settings.
- `OnboardingPayload`: structured Phase 1 profile capture.
- `DirectorySearchFilters`: query parameters for discovery pages.

## Security baseline

- Validate all write payloads with schema validation before persistence.
- Sanitize user-authored content rendered on public pages.
- Limit auth and search endpoints aggressively.
- Encrypt secrets and PII at rest and use TLS in transit.
- Keep AI features isolated from privileged case data unless consent and policy controls are explicit.

## Phase sequencing

### Phase 1

- Public identity pages
- Onboarding
- Search-ready profile metadata
- Basic reviews and trust indicators

### Phase 2

- Lead allocation
- Consult booking
- Payments
- City and "near me" landing pages

### Phase 3+

- Feed and professional graph
- Chat and calls
- AI drafting and summarization
- Case management

## Immediate implementation note

This repository is intentionally scaffold-first. It establishes the information architecture, public UI language, and API contracts needed to start real product work without pretending the full nine-phase roadmap is already built.
