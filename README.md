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

## Additional operational workflows

The tenant workspace includes dedicated preview routes for:
- Transaction detail and lifecycle, provider callback history, reconciliation-run creation and results, rematch review, and exception resolution.
- Statement import, column mapping and validation review; M-Pesa setup, callback configuration and safe credential-rotation preparation.
- Settlement statement upload, settlement comparison and variance review.
- Customer detail, invitations, member detail and role editing.
- Webhook endpoint setup, signing-secret rotation and delivery retry review.
- Report creation, scheduling, recipient management and export history.
- Branch details, validation-rule editing, pipeline-failure details and record lineage.
- Investigation evidence and notes, risk-rule simulation, audit-event details, personal-data export and deletion-request status.
- Notification preferences and delivery history, support-case details and diagnostic-attachment preparation.

These screens use clearly labelled synthetic sample rows where appropriate. They do not contact M-Pesa, send invitations, rotate real credentials, trigger retries, process payments, delete data, or persist backend settings. The UI includes subtle entrance/hover/focus feedback and respects reduced-motion preferences.

## Preview-only behavior and limitations

The sign-in page now calls the existing PesaGuard identity API, keeps access and refresh tokens in memory only, and supports session refresh and sign-out. A successful sign-in loads tenant-scoped transactions from the API. Other authentication and onboarding routes remain incomplete shells: account registration, email verification/recovery, MFA challenge completion, invitations, SSO, and tenant provisioning are not fully wired. No fake secrets or QR codes are shown.

The dashboard only uses live transaction records after authenticated sign-in. Customer records and several operational modules remain preview or empty, and the current transaction/reconciliation views are read-only because matching/review write APIs have not been connected. Preview interactions never initiate, refund, or settle payments. Do not treat the current integration as a complete production dashboard.


## Live API connectivity

The dashboard now checks the deployed API's public status endpoint (`GET /public/status`) on initial load and every 60 seconds, and displays the HTTP result, latest check time, and a manual refresh control. Configure `VITE_PESAGUARD_API_BASE_URL` in the dashboard hosting environment if the API base URL differs from `https://api.pesaguard.co.ke`.

This connection indicator verifies service status only. After sign-in, transaction rows are fetched from `GET /api/v1/transactions/search` with the short-lived bearer access token and the server-derived tenant context. The API contract currently returns up to 100 records per request; client-side filters operate on those loaded records. The dashboard refreshes the transaction list every 60 seconds and attempts refresh-token rotation after an HTTP 401. Access and refresh tokens are held in memory only, so a page reload requires signing in again. Do not add API secrets or bearer tokens to `VITE_*` build variables; Vite exposes them to browsers.

For browser requests, ensure the API runtime `PESAGUARD_CORS_ALLOWED_ORIGINS` includes `https://app.pesaguard.co.ke` if the variable is explicitly set. Run `npm run typecheck` and `npm run build` before deployment, then verify sign-in, tenant isolation, refresh, sign-out revocation, empty states, and CORS in the deployed environment.
