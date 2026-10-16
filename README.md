# PesaGuard tenant dashboard

A responsive React and TypeScript workspace for tenant payment operations, reconciliation review, customer profiles, executive reporting concepts, and operational activity. The interface uses PesaGuard's forest-green, mint, and white-surface design system.

## Run locally

```powershell
npm ci
npm run dev
```

Validate and build a production bundle with:

```powershell
npm run typecheck
npm run build
```

## Authentication and onboarding routes

The frontend includes designed route states for:
- Account access: `/login`, `/signup`, `/verify-email`, `/verify-email/expired`, `/forgot-password`, `/reset-password`, and `/password-updated`.
- MFA and recovery: `/mfa-challenge`, `/mfa/setup`, `/mfa/verify-setup`, `/mfa/recovery-codes`, `/mfa/recovery`, and `/security/verify`.
- Invitations and membership: `/accept-invite`, `/invite-expired`, `/invite/accepted`, `/invite/invalid`, and `/account/pending`.
- Tenant onboarding: `/onboarding/organization`, `/onboarding/setup`, `/onboarding/status`, `/onboarding/complete`, and `/onboarding/problem`.
- Sessions, access and errors: `/session-expired`, `/account-locked`, `/access-denied`, `/signed-out`, `/404`, and `/500`.
- Enterprise identity: `/sso`, `/sso/callback`, `/settings/security/sso`, and `/reauthenticate`.

Authentication pages use a pale lime/mint radial-gradient background, dotted ambient texture, translucent form card, rounded mint submit controls, visible keyboard focus, responsive layouts, and reduced-motion support. Shared components keep typography, inputs, notices, and recovery states consistent while preserving route-specific copy and interactions.

## Tenant workspace pages

The dashboard now registers dedicated operational routes for organization profile and branches, personal profile, notification centre, failed and pending transactions, refunds and reversals, import results, reconciliation run detail, matched/unmatched/partial records, manual matching, match approvals, exception detail, matching rule detail, settlement batch detail and discrepancies, financial summaries, data-quality issues and trends, source health, risk alert details, flagged transactions, fraud investigations, risk rule detail, report details and schedules, integration configuration, webhook delivery detail, alert detail, service status, security settings, active sessions, access history, account closure, onboarding resume, and the first-login launch checklist.

The additional routes use a shared operational page system: route-specific titles and guidance, clear hierarchy, compact metric summaries, accessible search/filter controls, responsive tables or structured empty states, review/configuration forms, related-workspace navigation, and explicit preview-state messaging. Pages use the existing sample transaction/customer objects only where those record types are appropriate. Unknown backend states remain unknown rather than being filled with invented service metrics.

## UI/UX implementation principles

- Restrained PesaGuard mint and forest-green accents with high-contrast surfaces, thin borders, and deliberate spacing.
- Clear page purpose and operational context before metrics or actions.
- Keyboard-visible focus, labelled controls, responsive tables, and reduced-motion support.
- Safe preview actions: no fake payment/refund/settlement execution, no fabricated integration health, and no false claim that settings are persisted.
- Related workflows are linked so detail pages remain discoverable without turning the primary navigation into an unstructured list.

## Preview-only behavior and limitations

This repository is a frontend preview. Authentication and onboarding screens are design and interaction shells: they do not authenticate users, create accounts, send verification or recovery emails, verify MFA codes, accept invitations, validate SSO responses, create sessions, provision tenants, or persist workspace settings. Recovery-code and authenticator screens intentionally do not display fake secrets or QR codes. Form notices explicitly state when a backend action is not connected.

The dashboard uses in-memory sample data and does not connect to a backend, enforce tenant permissions, or read or write real customer/payment data. Preview interactions do not initiate, refund, or settle payments. Live connection and system-health states must not be inferred from sample content.

Before production use, connect and verify the identity/session layer, tenant authorization, API contracts, server-side validation and audit enforcement, email delivery, MFA enrollment and recovery, SSO callback validation, tenant provisioning, and end-to-end/accessibility tests. Confirm every displayed metric maps to a documented API contract and carries an accurate freshness timestamp. Do not use this preview with production records or payment credentials.
