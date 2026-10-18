# Tenant Dashboard Core API Wiring Status

This document tracks page-to-API wiring for `app.pesaguard.co.ke`. A route mapping is not proof of production readiness.

## Safety and integration rules

- Authenticated tenant requests use the current bearer-token session.
- Tenant scoping, authorization, response contracts, and deployed migrations must be verified with tests and staging before a page is called production-ready.
- API failures never fall back to fixture/sample records.
- Record-detail pages require an identifier before requesting the resource.
- Read-only pages stay read-only. No page may initiate payments, move funds, execute settlements/refunds, or claim that privacy deletion/export occurred unless a separately approved execution service actually performs it.
- Supported provider scope remains M-Pesa/Daraja ingestion and reconciliation against the internal ledger. Other providers are not represented as live integrations.

## Workflow API resources wired in the dashboard

| Dashboard area | Core API resource | What the UI can do | Explicit boundary |
|---|---|---|---|
| Reconciliation runs | `/api/v1/reconciliation-runs` | List, create request records, inspect details, update allowed statuses | Persisting a run request does not execute reconciliation without the worker |
| Matching rules | `/api/v1/matching-rules` | List, create, inspect, edit, soft-disable | The authoritative matcher must consume rule definitions before they affect production matching |
| Data-quality findings | `/api/v1/data-quality-findings` | List, create review records, inspect and update statuses | Findings are not automatically produced by every ingestion/profiling pipeline |
| Scheduled reconciliation | `/api/v1/reconciliation-schedules` | Manage schedule metadata and status | A deployed scheduler/worker must trigger runs |
| Settlement review | `/api/v1/settlement-reviews` | Track and review settlement-related cases | No settlement initiation, confirmation, or funds movement |
| Refund/reversal review | `/api/v1/refund-reversal-requests` | Track and review requests | No provider refund/reversal command or ledger posting |
| Report definitions | `/api/v1/report-definitions` | Create and maintain supported report definitions and schedule metadata | Recurring execution/delivery requires a worker |
| Report runs / export history | `/api/v1/report-runs` | Request and inspect bounded persisted-data JSON summaries | Not downloadable CSV/PDF artifact generation or email delivery |
| Fraud investigations | `/api/v1/fraud-investigations` | Track case status and append evidence metadata | Risk signals are not proof of fraud; sensitive raw payloads/credentials must not be attached |
| Privacy requests | `/api/v1/privacy-requests` | Register and review access/export/correction/deletion requests | Does not execute destructive deletion or claim an export file exists |
| Support cases | `/api/v1/support-cases` | Create and track tenant support cases | External support notifications/delivery are separate integrations |

The shared workflow view sends the record version for optimistic concurrency checks. It displays API errors instead of silently replacing data. Matching-rule deletion is a soft-disable operation.

## Other mapped read routes

- Dashboard KPIs: `GET /api/v1/dashboard/overview`
- Transactions and lifecycle filters: `GET /api/v1/transactions/search`
- Import history: `GET /api/v1/imports`
- Reconciliation outcomes: `GET /api/v1/reconciliation/results` (including matched, unmatched, partial and duplicate result views)
- Risk summaries: `GET /api/v1/fraud/assessments`
- Discrepancies: `GET /discrepancies`
- Transaction detail/status and lineage: transaction-specific Core API routes
- Dataset catalog/metadata: `GET /api/v1/catalog/datasets`
- Provider detail and webhook delivery history: existing provider/webhook read routes
- Public service status: `GET /public/status`

## Still unavailable or intentionally limited

Pages that do not have a semantically suitable API remain unavailable instead of being wired to unrelated data. This includes payment origination, full customer/team/role administration, branch management, standalone risk-rule CRUD/simulation, alert-detail workflows, actual import column-mapping/validation mutation, settlement statement uploads/comparisons, downloadable report artifacts, notification preferences/delivery history, account closure, and destructive privacy execution.

The `duplicate-detection` page reads persisted reconciliation outcomes filtered to `DUPLICATE`. The `flagged-transactions` page reads persisted risk assessments with risk-level filtering. Neither action automatically suppresses a transaction or blocks a payment.

## Release gate

1. Apply and verify the workflow-record schema migration in the target environment.
2. Pass API and dashboard CI, typecheck and production build.
3. Pass PostgreSQL tenant-isolation, permission, status-transition, concurrency and audit tests.
4. Verify all mapped routes against the deployed API contract in staging.
5. Test loading, empty, 401, 403, timeout and 5xx states.
6. Deploy the reconciliation/scheduler/report workers before describing scheduled execution as operational.

Current status: **workflow APIs are mapped in the dashboard branch, but end-to-end production readiness is not established until migrations, CI and staging verification pass.**
