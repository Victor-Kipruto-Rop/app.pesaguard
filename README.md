# PesaGuard tenant dashboard

A responsive React and TypeScript workspace for tenant payment operations, reconciliation review, customer profiles, executive reporting concepts, and operational activity. The interface uses PesaGuard's forest-green, mint, and white-surface design system.

## Run locally

```powershell
npm ci
npm run dev
```

Open the local URL printed by Vite. Validate and build a production bundle with:

```powershell
npm run typecheck
npm run build
```

## Dashboard areas

- **Dashboard overview** — sample transaction summaries, status-based payment value distribution, and recent transaction records.
- **Executive overview** — management-oriented summary, reconciliation exposure, sample status distribution, and priority review paths.
- **Operational activity** — sample event timeline and workflow investigation routes.
- **Transactions and reconciliation** — interactive local preview workflows for filtering, review, and matching.
- **Customers, organization, and settings** — local preview forms and profile/settings screens.
- **Operational workspaces** — exceptions, payments, settlements, reports, data imports, integrations, webhooks, pipeline activity, audit history, security, system health, team access, role permissions, notifications, account security, preferences, support, and developer resources.
- **Organization settings** — tenant profile, locale and reporting preferences, notification controls, and explicit local-preview save feedback.
- **Authentication and onboarding** — `/login`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password`, `/mfa-challenge`, `/accept-invite`, `/invite-expired`, `/onboarding`, `/session-expired`, `/account-locked`, `/access-denied`, `/404`, and `/500`.
- **Accessible interface states** — responsive layouts, keyboard focus indicators, reduced-motion support, explicit empty states, and preview-only status messaging.

## Preview-only behavior and limitations

This repository is a frontend preview. Authentication and onboarding pages are designed UI flows only: they do not authenticate users, create accounts, send verification or recovery emails, verify MFA codes, accept invitations, or persist workspace settings. The dashboard uses in-memory sample data and does not connect to a backend, enforce tenant permissions, or read or write real customer/payment data. Preview interactions do not initiate, refund, or settle payments. Any numbers or records on the executive and operational screens are calculated from the illustrative dataset, not from production services. Live connection and system-health states are intentionally shown as unavailable when no verified health check is connected.

Before production use, connect and verify the identity/session layer, tenant authorization, API contracts, server-side validation and audit enforcement, real service health checks, and end-to-end/accessibility tests. Confirm that every displayed metric maps to a documented API contract and carries an accurate freshness timestamp. Do not use this preview with production records or payment credentials.
