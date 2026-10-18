# Tenant dashboard page integration status

Generated from the current `DashboardPage` union and resource registry. Route mapping alone does not make a page production-ready.

## Guarantees

- Authenticated dashboard pages render only the live transactions view or the shared Core API resource view.
- No authenticated page falls back to preview fixtures.
- Failed API calls and permission denials are displayed rather than replaced with demo records.
- Pages requiring record IDs use explicit user-entered identifiers and do not fetch until an identifier is supplied. Pages requiring unsupported mutations or domain-specific contracts remain unavailable until the required API exists.
- The generic resource view supports authenticated reads and narrowly scoped workflow-record create/update/evidence actions when a dedicated Core API workflow route is mapped. It never initiates payments, executes settlements/refunds, or performs destructive privacy actions.

## Status legend

- **Connected — existing**: transaction API integration exists; tenant-isolation and staging verification remain release gates.
- **Route mapped — verification required**: a route appears in the route audit, but tenant isolation, permissions, response contracts and deployed availability must be verified.
- **Unavailable**: no suitable route is mapped; the UI intentionally displays an unavailable state.

## Page inventory

Recent wiring adds provider detail and governed dataset metadata lookup. The generic resource loader now reloads when a record identifier changes and preserves that identifier when retrying after session renewal. These additions are still route-mapped, not staging-verified.

| Dashboard page ID | Status | Route | Limitations |
|---|---|---|---|
| `home` | Route mapped — verification required | `/api/v1/dashboard/overview` | Tenant-scoped persisted transaction and discrepancy KPIs; endpoint test and staging verification remain required. |
| `executive-overview` | Route mapped — verification required | `/api/v1/dashboard/overview` | Tenant-scoped persisted transaction and discrepancy KPIs; no fabricated risk or revenue KPIs. |
| `operational-activity` | Route mapped — verification required | `/activity-feed?limit=50` | Tenant-scoped latest discrepancy timeline events; not a complete platform audit log. |
| `transactions` | Connected — existing tenant transaction API | `GET /api/v1/transactions/search` | Read-only; server-side pagination, text search and lifecycle status filters are wired. Live statuses reflect transaction processing lifecycle, not reconciliation outcomes. Date/amount filters and column sorting remain page-local. |
| `reconciliation` | Route mapped — verification required | `/analytics/reconciliation-report?days=30` | Tenant-scoped discrepancy operations summary; not reconciliation-run history or a settlement report. |
| `exceptions` | Route mapped — verification required | `/discrepancies` | Tenant-scoped discrepancy records with server-side pagination and supported status filters; API contract and staging verification remain required. |
| `payments` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `settlements` | Workflow mapped — verification required | `/api/v1/settlement-reviews` | Review records only; no settlement execution or movement of funds. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
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
| `data-quality` | Workflow mapped — verification required | `/api/v1/data-quality-findings` | Persisted tenant-scoped findings and status transitions; no fabricated findings. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `data-sources` | Route mapped — verification required | `/providers` | Provider registry only; this is not a data-quality result. |
| `validation-results` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `duplicate-detection` | Route mapped — verification required | `/api/v1/reconciliation/results?status=DUPLICATE` | Persisted reconciliation outcomes marked duplicate; not a standalone fraud or global duplicate-detection service. |
| `schema-mapping` | Route mapped — verification required | `/api/v1/catalog/datasets/{dataset_name}` | Read-only governed dataset metadata; does not edit mappings. |
| `data-lineage` | Route mapped — verification required | `/api/v1/lineage/transactions/{transaction_id}` | Transaction-level lineage only; requires an identifier and staging verification. |
| `processing-jobs` | Route mapped — verification required | `/api/v1/imports` | Import jobs only, not all background processing tasks. |
| `freshness-monitoring` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `risk-overview` | Route mapped — verification required | `/analytics/incident-trends` | Tenant-scoped weekly/monthly discrepancy trends; not a fraud probability model or financial loss forecast. |
| `fraud-detection` | Route mapped — verification required | `/api/v1/fraud/assessments` | Existing persisted risk assessments only; not model execution or an investigation workflow. API PR #95 and staging verification required. |
| `risk-events` | Route mapped — verification required | `/api/v1/fraud/assessments` | Persisted risk assessment records; API PR #95 and staging verification required. |
| `suspicious-transactions` | Route mapped — verification required | `/api/v1/fraud/assessments?status=HIGH,CRITICAL` | High/critical risk flags only; flags are not proof of fraud. API PR #95 and staging verification required. |
| `alerts` | Route mapped — verification required | `/incidents/search` | Operational incident search; verify its tenant scoping before treating results as tenant-specific alerts. |
| `investigations` | Workflow mapped — verification required | `/api/v1/fraud-investigations` | Case metadata and append-only evidence only; does not prove fraud or block payments. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `risk-rules` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `reconciliation-runs` | Workflow mapped — verification required | `/api/v1/reconciliation-runs` | Persists run requests; execution requires the reconciliation worker. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `matching-rules` | Workflow mapped — verification required | `/api/v1/matching-rules` | Rule configuration CRUD and soft-disable; authoritative matching does not automatically consume these definitions yet. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `matching-history` | Route mapped — verification required | `/api/v1/reconciliation/results` | Tenant-scoped paginated reconciliation match history; API PR #95 must merge and staging verification is required. |
| `settlement-batches` | Workflow mapped — verification required | `/api/v1/settlement-reviews` | Review records only; not provider settlement batches or settlement execution. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `scheduled-reconciliation` | Workflow mapped — verification required | `/api/v1/reconciliation-schedules` | Schedule definitions persist; scheduler/worker deployment is required to trigger runs. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `report-builder` | Workflow mapped — verification required | `/api/v1/report-definitions` | Supported report definitions persist; report execution is a separate summary-run endpoint. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `scheduled-reports` | Workflow mapped — verification required | `/api/v1/report-definitions` | Scheduling metadata persists; periodic execution and delivery require a scheduler/worker. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `export-center` | Workflow mapped — verification required | `/api/v1/report-runs` | Bounded JSON summaries only; downloadable CSV/PDF artifacts are not generated. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `approvals` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `webhook-deliveries` | Route mapped — verification required | `/webhooks/{webhook_id}/deliveries` | Requires webhook ID and `manage:webhooks` permission; staging verification required. |
| `support-requests` | Workflow mapped — verification required | `/api/v1/support-cases` | Tenant-scoped support case records and lifecycle status. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `retention-privacy` | Workflow mapped — verification required | `/api/v1/privacy-requests` | Privacy requests are tracked and reviewed; data deletion/export is not executed by this API. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `organization-profile` | Route mapped — verification required | `/tenant/current` | Authenticated tenant context; not organization CRUD. |
| `branches` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `user-profile` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `notification-center` | Route mapped — verification required | `/api/v1/communications/messages` | Communication messages; not notification preferences. |
| `failed-transactions` | Route mapped — verification required | `/api/v1/transactions/search` | Server-side pagination and failed/rejected lifecycle filters; does not represent refunds or settlement failures. |
| `pending-transactions` | Route mapped — verification required | `/api/v1/transactions/search` | Server-side pagination and received/validated/processing/reconciling lifecycle filters; not a reconciliation outcome. |
| `refunds-reversals` | Workflow mapped — verification required | `/api/v1/refund-reversal-requests` | Review requests only; no refund/reversal command or ledger posting is executed. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `transaction-import-results` | Route mapped — verification required | `/api/v1/imports/{import_id}` | Requires an import job ID; staging verification required. |
| `reconciliation-run-detail` | Route mapped — API PR pending verification | `/api/v1/reconciliation-runs/{record}` | New tenant workflow endpoint is defined in API PR #96; mapping is not live until that PR merges, migration is applied, and staging verification passes. |
| `matched-transactions` | Route mapped — verification required | `/api/v1/reconciliation/results?status=MATCHED` | Tenant-scoped reconciliation outcomes; API PR #95 must merge and staging verification is required. |
| `unmatched-transactions` | Route mapped — verification required | `/api/v1/reconciliation/results?status=UNMATCHED,MISMATCH,DUPLICATE` | Tenant-scoped unmatched/mismatch/duplicate outcomes; API PR #95 must merge and staging verification is required. |
| `partial-matches` | Route mapped — verification required | `/api/v1/reconciliation/results?status=PARTIAL` | Tenant-scoped partial-match outcomes; API PR #95 must merge and staging verification is required. |
| `manual-matching` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `match-approvals` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `exception-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `matching-rule-detail` | Route mapped — API PR pending verification | `/api/v1/matching-rules/{record}` | New tenant workflow endpoint is defined in API PR #96; mapping is not live until that PR merges, migration is applied, and staging verification passes. |
| `settlement-detail` | Route mapped — API PR pending verification | `/api/v1/settlement-reviews/{record}` | Review records only; no settlement execution or movement of funds. API PR #96 pending merge and staging verification. |
| `settlement-discrepancies` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `financial-summaries` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `data-quality-issues` | Route mapped — API PR pending verification | `/api/v1/data-quality-findings` | New tenant workflow endpoint is defined in API PR #96; mapping is not live until that PR merges, migration is applied, and staging verification passes. |
| `data-quality-issue-detail` | Route mapped — API PR pending verification | `/api/v1/data-quality-findings/{record}` | New tenant workflow endpoint is defined in API PR #96; mapping is not live until that PR merges, migration is applied, and staging verification passes. |
| `data-source-health` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `data-quality-trends` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `risk-alert-detail` | Route mapped — verification required | `/api/v1/fraud/{transaction_id}` | Transaction-level risk assessment only; no investigation workflow. |
| `flagged-transactions` | Route mapped — verification required | `/api/v1/fraud/assessments?status=HIGH,CRITICAL` | High/critical persisted risk assessments for review; flags are not proof of fraud. |
| `fraud-investigation` | Route mapped — API PR pending verification | `/api/v1/fraud-investigations/{record}` | Case metadata/evidence workflow only; does not prove fraud or block payments. API PR #96 pending merge and staging verification. |
| `risk-rule-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `report-detail` | Route mapped — API PR pending verification | `/api/v1/report-definitions/{record}` | Report definitions and bounded summary runs only; no downloadable artifacts or scheduled delivery yet. API PR #96 pending merge and staging verification. |
| `scheduled-report-detail` | Route mapped — API PR pending verification | `/api/v1/report-definitions/{record}` | Report definitions and bounded summary runs only; no downloadable artifacts or scheduled delivery yet. API PR #96 pending merge and staging verification. |
| `integration-detail` | Route mapped — verification required | `/providers/{provider_id}` | Provider details; verify tenant ownership and supported-provider status in staging. |
| `webhook-delivery-detail` | Unavailable — no suitable route mapped | — | API exposes delivery history by webhook, not a verified single-delivery detail endpoint. |
| `alert-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `service-status` | Route mapped — verification required | `/public/status` | Current API status only; not a historical uptime report. |
| `security-settings` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `active-sessions` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `access-history` | Route mapped — verification required | `/v1/customers/{tenant}/audit` | Tenant audit events; verify tenant authorization and audit coverage before relying on it. |
| `account-closure` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `onboarding-resume` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `first-login-checklist` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `transaction-detail` | Route mapped — verification required | `/api/v1/transactions/{transaction_id}` | Requires internal transaction ID; route uses tenant-filtered lookup. Staging verification required. |
| `transaction-lifecycle` | Route mapped — verification required | `/api/v1/transactions/{transaction_id}/status` | Requires internal transaction ID; route uses tenant-filtered lookup. Staging verification required. |
| `provider-callback-history` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `create-reconciliation-run` | Route mapped — API PR pending verification | `/api/v1/reconciliation-runs` | New tenant workflow endpoint is defined in API PR #96; mapping is not live until that PR merges, migration is applied, and staging verification passes. |
| `reconciliation-results` | Route mapped — verification required | `/api/v1/reconciliation/results` | Tenant-scoped paginated reconciliation outcome collection; API PR #95 must merge and staging verification is required. |
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
| `report-create` | Workflow mapped — verification required | `/api/v1/report-definitions` | Persisted report definitions; report summary runs are separate and do not create downloadable artifacts. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `report-schedule-config` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `report-recipients` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `export-history` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `branch-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `validation-rule-editor` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `pipeline-failure-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `lineage-record-detail` | Route mapped — verification required | `/api/v1/lineage/transactions/{transaction_id}` | Transaction-level lineage only; requires an identifier and staging verification. |
| `investigation-evidence` | Workflow mapped — verification required | `/api/v1/fraud-investigations/{record}` | Case metadata and append-only evidence only; sensitive raw payloads/credentials are rejected. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `investigation-notes` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `risk-rule-simulation` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `audit-event-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `data-export-request` | Workflow mapped — verification required | `/api/v1/privacy-requests` | Access/export request records only; no export artifact is generated by this endpoint. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `deletion-request-status` | Workflow mapped — verification required | `/api/v1/privacy-requests/{record}` | Request status only; deletion/export execution is not performed by this API. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
| `notification-preferences` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `notification-delivery-history` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `support-case-detail` | Workflow mapped — verification required | `/api/v1/support-cases/{record}` | Tenant-scoped support case details and lifecycle status. Apply the migration and pass CI/staging tenant-isolation checks before production use. |
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

- Risk assessment collection: `GET /api/v1/fraud/assessments` supports tenant-scoped pagination, risk-level filtering, and exact transaction ID filtering. It returns persisted assessments only and does not trigger model inference.
\n## Additional wiring in this branch\n\nThe resource registry now maps transaction detail/status, import job detail, transaction lineage, dataset metadata, webhook deliveries, reconciliation outcome collections (matched/unmatched/partial/duplicate), persisted risk-assessment collections (including high/critical flags), and provider detail to read-only Core API routes. Record-specific pages require an identifier before making a request. These routes remain **verification required** until contract tests and staging smoke tests pass. Unsupported reconciliation-run CRUD, data-quality findings, fraud investigation workflows, settlements, refund/reversal operations, report execution, privacy requests, and support cases remain unavailable rather than being backed by unrelated endpoints.\n
## Tenant workflow API integration

The workflow API implementation and Alembic migration are present in the Core API repository; see [Core API PR #96](https://github.com/Victor-Kipruto-Rop/api.pesaguard/pull/96) and `docs/dashboard/WORKFLOW_API_CONTRACT.md`. The dashboard maps the affected pages to tenant-scoped workflow endpoints and exposes authenticated create/update/evidence controls where applicable. This is implementation-level wiring, not proof of deployment: apply the Alembic migration, run backend and frontend CI, and complete tenant-isolation and staging smoke tests before marking pages production-ready.

Explicitly out of scope: scheduler execution without a deployed worker, automatic matching-engine consumption of saved rules, downloadable report artifacts or scheduled delivery, settlement/refund execution, and actual privacy deletion/export. These APIs persist requests, configurations, and review records only.
