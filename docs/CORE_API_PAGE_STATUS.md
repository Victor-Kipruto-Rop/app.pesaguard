# Tenant dashboard page integration status

Generated from the current `DashboardPage` union and the resource registry. This is a conservative inventory, not a claim that route mapping alone makes a page production-ready.

## Guarantees

- Authenticated dashboard pages render only the live transactions view or the shared Core API resource view.
- No authenticated page falls back to preview fixtures.
- A mapped route may return an authorization or contract error; those errors are displayed rather than replaced with demo records.
- Pages that need IDs, filters, mutations, or domain-specific contracts remain unavailable until the required API exists.
- The generic resource view is read-only. It does not implement financial writes, reconciliation runs, settlements, refunds, or payment initiation.

## Status legend

- **Connected — existing**: existing transaction integration; still requires staging and security verification.
- **Route mapped — verification required**: an existing route is called, but tenant isolation, permission and response-contract verification remain release gates.
- **Unavailable**: no suitable route is mapped; the UI intentionally displays an unavailable state.

## Page inventory

| Dashboard page ID | Status | Route | Limitations |
|---|---|---|---|
| `home` | Route mapped — verification required | `/analytics/reconciliation-report` | Reconciliation report returned by the Core API; not synthetic executive KPIs. |
| `executive-overview` | Route mapped — verification required | `/analytics/reconciliation-report` | Reconciliation report only; this route does not supply unrelated executive metrics. |
| `operational-activity` | Route mapped — verification required | `/activity-feed` | Activity feed returned by the Core API. |
| `transactions` | Connected — existing tenant transaction API | `GET /api/v1/transactions/search` | Read-only; tenant isolation and staging verification remain release gates. |
| `reconciliation` | Route mapped — verification required | `/analytics/reconciliation-report` | Reconciliation report only; run execution/history requires a dedicated API. |
| `exceptions` | Route mapped — verification required | `/discrepancies` | Discrepancy records returned by the Core API. |
| `payments` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `settlements` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `reports` | Route mapped — verification required | `/api/v1/customers/{tenant}/reports` | Tenant reports; the legacy route's tenant enforcement must be verified before release. |
| `data-imports` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `integrations` | Route mapped — verification required | `/providers` | Provider registry. Only backend-configured, supported provider types should be shown. |
| `webhooks` | Route mapped — verification required | `/webhooks` | Webhook destination records; signing secrets are never rendered. |
| `import-sync-activity` | Route mapped — verification required | `/api/v1/operations/outbox` | Operational outbox records; not a complete import-job history. |
| `activity-log` | Route mapped — verification required | `/activity-feed` | Activity feed; not a compliance-complete immutable audit log. |
| `security` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `system-health` | Route mapped — verification required | `/health` | Service dependency health, not tenant business data. |
| `customers` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `team-members` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `roles-permissions` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `tenant-profile` | Route mapped — verification required | `/tenant/current` | Authenticated tenant profile. |
| `settings` | Route mapped — verification required | `/v1/settings` | Settings response; unsupported settings mutations remain unavailable. |
| `notifications` | Route mapped — verification required | `/api/v1/communications/messages` | Communication messages; not notification preferences. |
| `account-authentication` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `preferences` | Route mapped — verification required | `/tenant/current/locale` | Locale preference only; not a full preference service. |
| `help-support` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `api-developer-resources` | Route mapped — verification required | `/api/v1/iam/api-clients` | API client metadata. Secret material must never be exposed. |
| `data-quality` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `data-sources` | Route mapped — verification required | `/providers` | Provider registry only; this is not a data-quality result. |
| `validation-results` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `duplicate-detection` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `schema-mapping` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `data-lineage` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `processing-jobs` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `freshness-monitoring` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `risk-overview` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `fraud-detection` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `risk-events` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `suspicious-transactions` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `alerts` | Route mapped — verification required | `/incidents/search` | Operational incident search only; not a dedicated financial-alert service. |
| `investigations` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `risk-rules` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `reconciliation-runs` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `matching-rules` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `matching-history` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `settlement-batches` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `scheduled-reconciliation` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `report-builder` | Route mapped — verification required | `/api/v1/catalog/datasets` | Dataset catalog only; report execution is not implemented by this route. |
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
| `failed-transactions` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `pending-transactions` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `refunds-reversals` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `transaction-import-results` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `reconciliation-run-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `matched-transactions` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `unmatched-transactions` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `partial-matches` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
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
| `service-status` | Route mapped — verification required | `/health` | Service dependency health, not a public uptime history. |
| `security-settings` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `active-sessions` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `access-history` | Route mapped — verification required | `/api/v1/customers/{tenant}/audit` | Tenant audit route; verify tenant authorization and audit coverage before relying on it. |
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
| `notification-delivery-history` | Route mapped — verification required | `/api/v1/communications/messages` | Communication message history; delivery detail requires a message ID. |
| `support-case-detail` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |
| `diagnostic-attachments` | Unavailable — no suitable route mapped | — | No sample data or local-only mutations are displayed. Implement a dedicated tenant-scoped API contract first. |

## Release gates

1. Add a contract test for every mapped route and response shape.
2. Prove tenant A cannot read or mutate tenant B's records.
3. Verify route-level permissions and safe error responses.
4. Implement missing endpoints with persistence, validation, audit logging and idempotency for mutations.
5. Pass frontend typecheck/build and backend CI, then verify staging with a real tenant.
6. Do not label any mapped page production-ready before these checks pass.
