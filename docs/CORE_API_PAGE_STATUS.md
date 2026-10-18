# Tenant dashboard page integration status

Generated from the current `DashboardPage` union and resource registry. Route mapping alone does not make a page production-ready.

## Guarantees

- Authenticated dashboard pages render only the live transactions view or the shared Core API resource view.
- No authenticated page falls back to preview fixtures.
- Failed API calls and permission denials are displayed rather than replaced with demo records.
- Pages requiring record IDs, filters, mutations, or domain-specific contracts remain unavailable until the required API exists.
- The generic resource view is read-only. It does not implement financial writes, reconciliation runs, settlements, refunds, or payment initiation.

## Status legend

- **Connected — existing**: transaction API integration exists; tenant-isolation and staging verification remain release gates.
- **Route mapped — verification required**: a route appears in the route audit, but tenant isolation, permissions, response contracts and deployed availability must be verified.
- **Unavailable**: no suitable route is mapped; the UI intentionally displays an unavailable state.

## Page inventory

| Dashboard page ID | Status | Route | Limitations |
|---|---|---|---|
| `home` | Route mapped — verification required | `/api/v1/dashboard/overview` | Tenant-scoped persisted transaction and discrepancy KPIs; endpoint test and staging verification remain required. |
| `executive-overview` | Route mapped — verification required | `/api/v1/dashboard/overview` | Tenant-scoped persisted transaction and discrepancy KPIs; no fabricated risk or revenue KPIs. |
| `operational-activity` | Route mapped — verification required | `/activity-feed?limit=50` | Tenant-scoped latest discrepancy timeline events; not a complete platform audit log. |
| `transactions` | Connected — existing tenant transaction API | `GET /api/v1/transactions/search` | Read-only; server-side pagination, text search and lifecycle status filters are wired. Live statuses reflect transaction processing lifecycle, not reconciliation outcomes. Date/amount filters and column sorting remain page-local. |
| `reconciliation` | Route mapped — verification required | `/analytics/reconciliation-report?days=30` | Tenant-scoped discrepancy operations summary; not reconciliation-run history or a settlement report. |
| `exceptions` | Route mapped — verification required | `/discrepancies` | Tenant-scoped discrepancy records with server-side pagination and supported status filters; API contract and staging verification remain required. |
| `payments` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `settlements` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `reports` | Route mapped — verification required | `/v1/customers/{tenant}/reports` | Tenant report listing; verify tenant authorization and deployed response contract before release. |
| `data-imports` | Route mapped — verification required | `/api/v1/imports` | Server-side pagination and queued/running/completed/failed filters; upload and processing workflow verification remain separate. |
| `integrations` | Route mapped — verification required | `/providers` | Provider registry. Only backend-configured, supported provider types should be shown. |
| `webhooks` | Route mapped — verification required | `/webhooks` | Webhook destination records; signing secrets are never rendered. |
| `import-sync-activity` | Route mapped — verification required | `/api/v1/operations/outbox` | Operational outbox records; not a complete import-job history. |
| `activity-log` | Route mapped — verification required | `/v1/customers/{tenant}/audit` | Tenant audit events; verify tenant authorization, event coverage and pagination. |
| `security` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `system-health` | Route mapped — verification required | `/public/status` | Public API status only; not a full dependency-health dashboard. |
| `customers` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `team-members` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `roles-permissions` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `tenant-profile` | Route mapped — verification required | `/tenant/current` | Authenticated tenant profile. |
| `settings` | Route mapped — verification required | `/v1/settings` | Settings response; unsupported settings mutations remain unavailable. |
| `notifications` | Route mapped — verification required | `/api/v1/communications/messages` | Communication messages; not notification preferences. |
| `account-authentication` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `preferences` | Route mapped — verification required | `/tenant/current/locale` | Locale preference only; not a full preference service. |
| `help-support` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `api-developer-resources` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `data-quality` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `data-sources` | Route mapped — verification required | `/providers` | Provider registry only; this is not a data-quality result. |
| `validation-results` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `duplicate-detection` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `schema-mapping` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `data-lineage` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `processing-jobs` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `freshness-monitoring` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `risk-overview` | Route mapped — verification required | `/analytics/incident-trends` | Tenant-scoped weekly/monthly discrepancy trends; not a fraud probability model or financial loss forecast. |
| `fraud-detection` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `risk-events` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `suspicious-transactions` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `alerts` | Route mapped — verification required | `/incidents/search` | Operational incident search; verify its tenant scoping before treating results as tenant-specific alerts. |
| `investigations` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `risk-rules` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `reconciliation-runs` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `matching-rules` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `matching-history` | Route mapped — verification required | `/api/v1/reconciliation/results` | Tenant-scoped paginated reconciliation match history; API PR #95 must merge and staging verification is required. |
| `settlement-batches` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `scheduled-reconciliation` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `report-builder` | Unavailable — no suitable route mapped | — | A dataset catalog is not a report builder; report definition and execution APIs are required. |
| `scheduled-reports` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `export-center` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `approvals` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `webhook-deliveries` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `support-requests` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `retention-privacy` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `organization-profile` | Route mapped — verification required | `/tenant/current` | Authenticated tenant context; not organization CRUD. |
| `branches` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `user-profile` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `notification-center` | Route mapped — verification required | `/api/v1/communications/messages` | Communication messages; not notification preferences. |
| `failed-transactions` | Route mapped — verification required | `/api/v1/transactions/search` | Server-side pagination and failed/rejected lifecycle filters; does not represent refunds or settlement failures. |
| `pending-transactions` | Route mapped — verification required | `/api/v1/transactions/search` | Server-side pagination and received/validated/processing/reconciling lifecycle filters; not a reconciliation outcome. |
| `refunds-reversals` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `transaction-import-results` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `reconciliation-run-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `matched-transactions` | Route mapped — verification required | `/api/v1/reconciliation/results?status=MATCHED` | Tenant-scoped reconciliation outcomes; API PR #95 must merge and staging verification is required. |
| `unmatched-transactions` | Route mapped — verification required | `/api/v1/reconciliation/results?status=UNMATCHED,MISMATCH,DUPLICATE` | Tenant-scoped unmatched/mismatch/duplicate outcomes; API PR #95 must merge and staging verification is required. |
| `partial-matches` | Route mapped — verification required | `/api/v1/reconciliation/results?status=PARTIAL` | Tenant-scoped partial-match outcomes; API PR #95 must merge and staging verification is required. |
| `manual-matching` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `match-approvals` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `exception-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `matching-rule-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `settlement-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `settlement-discrepancies` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `financial-summaries` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `data-quality-issues` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `data-quality-issue-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `data-source-health` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `data-quality-trends` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `risk-alert-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `flagged-transactions` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `fraud-investigation` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `risk-rule-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `report-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `scheduled-report-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `integration-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `webhook-delivery-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `alert-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `service-status` | Route mapped — verification required | `/public/status` | Current API status only; not a historical uptime report. |
| `security-settings` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `active-sessions` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `access-history` | Route mapped — verification required | `/v1/customers/{tenant}/audit` | Tenant audit events; verify tenant authorization and audit coverage before relying on it. |
| `account-closure` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `onboarding-resume` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `first-login-checklist` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `transaction-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `transaction-lifecycle` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `provider-callback-history` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `create-reconciliation-run` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `reconciliation-results` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `rematch-confirmation` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `exception-resolution` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `import-wizard` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `column-mapping` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `validation-review` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `mpesa-setup` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `callback-configuration` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `credential-rotation` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `settlement-statement-upload` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `settlement-comparison` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `settlement-variance-review` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `customer-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `team-invitations` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `member-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `role-editor` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `webhook-endpoint-editor` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `webhook-signing-secret` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `webhook-retry` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `report-create` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `report-schedule-config` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `report-recipients` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `export-history` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `branch-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `validation-rule-editor` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `pipeline-failure-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `lineage-record-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `investigation-evidence` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `investigation-notes` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `risk-rule-simulation` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `audit-event-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `data-export-request` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `deletion-request-status` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `notification-preferences` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `notification-delivery-history` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `support-case-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `diagnostic-attachments` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |

## Release gates

1. Diagnose and fix the failing GitHub Actions typecheck/build jobs.
2. Add a contract test for every mapped route and response shape.
3. Prove tenant A cannot read or mutate tenant B's records.
4. Verify route-level permissions and safe error responses.
5. Implement missing endpoints with persistence, validation, audit logging and idempotency for mutations.
6. Verify server-side transaction pagination/text search/status filters against the deployed API; promote date/amount filters and sorting to server-side parameters if required for large datasets.
7. Verify staging with a real tenant. Do not label any mapped page production-ready before these checks pass.


## Expanded record-level integrations

The dashboard resource layer now supports identifier-driven loading for existing Core API routes:

- Transaction detail: `GET /api/v1/customers/{tenant_id}/transactions/{trans_id}`
- Import job detail: `GET /api/v1/imports/{import_id}`
- Transaction lineage: `GET /api/v1/lineage/transactions/{transaction_id}`
- Webhook delivery history: `GET /webhooks/{webhook_id}/deliveries`

These views require an identifier before making a request. They remain read-only, use the authenticated bearer token, avoid sample-data fallback, and show API errors directly. Tenant access, permissions, deployed response shapes, and staging behavior still require verification before production readiness can be claimed. A Daraja transaction reference and an internal transaction ID may not be interchangeable.
- Transaction detail: `GET /api/v1/transactions/{transaction_id}` (internal transaction ID).
- Transaction lifecycle: `GET /api/v1/transactions/{transaction_id}/status`.
- Transaction reconciliation result/history: `GET /api/v1/reconciliation/{transaction_id}`.
- Per-transaction risk assessment: `GET /api/v1/fraud/{transaction_id}`.

- Reconciliation result collections: `GET /api/v1/reconciliation/results` supports tenant-scoped pagination, validated outcome filters, and exact transaction ID filtering. The response deliberately omits raw matched-record payloads.
