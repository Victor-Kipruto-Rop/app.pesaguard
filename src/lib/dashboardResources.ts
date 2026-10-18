import type { DashboardPage } from "../app/config/routes";
import { API_BASE_URL, PesaguardApiError, type LoginResult } from "./api";

export interface DashboardResourceResult {
  path: string;
  status: number;
  payload: unknown;
  fetchedAt: string;
}

type ResourceDefinition = { path: string; note: string; auth?: boolean; paginated?: boolean; statusFilter?: boolean; statusLabel?: string; defaultStatus?: string; statusOptions?: Array<{ value: string; label: string }>; searchParam?: string; searchLabel?: string; recordIdParam?: { label: string; help: string }; queryParams?: Record<string, string> };

// This registry deliberately includes only GET routes found in the Core API
// route audit. It does not claim that a legacy route is production-safe; every
// mapped route still needs tenant-isolation, permission and response-contract
// verification. Pages needing record IDs or unsupported APIs remain unavailable.
const resources: Partial<Record<DashboardPage, ResourceDefinition>> = {
  home: { path: "/api/v1/dashboard/overview", note: "Tenant-scoped persisted transaction and discrepancy metrics from the Core API." },
  "executive-overview": { path: "/api/v1/dashboard/overview", note: "Tenant-scoped persisted transaction and discrepancy metrics; no fabricated risk or revenue KPIs." },
  "risk-overview": { path: "/analytics/incident-trends", note: "Tenant-scoped weekly and monthly discrepancy incident trends; not a fraud probability model or financial loss forecast." },
  alerts: { path: "/incidents/search", note: "Operational incident search; verify its tenant scoping before treating results as tenant-specific alerts." },
  "operational-activity": { path: "/activity-feed", note: "Latest tenant-scoped discrepancy activity events. This feed reflects discrepancy timelines, not every platform audit event.", queryParams: { limit: "50" } },
  "activity-log": { path: "/v1/customers/{tenant}/audit", note: "Tenant audit events; verify tenant authorization, event coverage and pagination before relying on it." },
  exceptions: { path: "/discrepancies", note: "Tenant-scoped discrepancy records with server-side pagination and supported status filtering.", paginated: true, statusFilter: true, statusLabel: "Discrepancy status", searchParam: "q", searchLabel: "Search discrepancy reference or type", statusOptions: [{ value: "open", label: "Open" }, { value: "pending", label: "Pending" }, { value: "needs_review", label: "Needs review" }, { value: "assigned", label: "Assigned" }, { value: "resolved", label: "Resolved" }, { value: "closed", label: "Closed" }, { value: "missing_payment", label: "Missing payment" }, { value: "missing_transaction", label: "Missing transaction" }, { value: "amount_mismatch", label: "Amount mismatch" }, { value: "duplicate", label: "Duplicate" }] },
  reconciliation: { path: "/analytics/reconciliation-report", note: "Tenant-scoped discrepancy operations summary for the last 30 days; not reconciliation-run history or a settlement report.", queryParams: { days: "30" } },
  "processing-jobs": { path: "/api/v1/imports", note: "Tenant-scoped import jobs only, not every background processing task; server-side pagination and import lifecycle filters are available.", paginated: true, statusFilter: true, statusLabel: "Import status", statusOptions: [{ value: "queued", label: "Queued" }, { value: "running", label: "Running" }, { value: "completed", label: "Completed" }, { value: "failed", label: "Failed" }] },
  "data-imports": { path: "/api/v1/imports", note: "Paginated import job history for the authenticated tenant; upload and import execution are separate actions.", paginated: true, statusFilter: true, statusLabel: "Import status", statusOptions: [{ value: "queued", label: "Queued" }, { value: "running", label: "Running" }, { value: "completed", label: "Completed" }, { value: "failed", label: "Failed" }] },
  "transaction-detail": { path: "/api/v1/transactions/{record}", note: "Tenant-scoped transaction detail by internal transaction ID; phone numbers and raw payloads are redacted in the dashboard.", recordIdParam: { label: "Internal transaction ID", help: "Enter the transaction record ID returned by the Core API." } },
  "transaction-lifecycle": { path: "/api/v1/transactions/{record}/status", note: "Tenant-scoped lifecycle status for one transaction.", recordIdParam: { label: "Internal transaction ID", help: "Enter the transaction record ID returned by the Core API." } },
  "transaction-import-results": { path: "/api/v1/imports/{record}", note: "Tenant-scoped import job details. Enter an import job ID from Data Imports.", recordIdParam: { label: "Import job ID", help: "Use an import ID returned by Data Imports." } },
  "data-lineage": { path: "/api/v1/lineage/transactions/{record}", note: "Tenant-scoped lineage for one persisted transaction, not a dataset-wide lineage graph.", recordIdParam: { label: "Transaction identifier", help: "Enter the transaction identifier expected by the Core API lineage endpoint." } },
  "schema-mapping": { path: "/api/v1/catalog/datasets/{record}", note: "Governed dataset metadata from the Core API catalog. This does not create or edit column mappings.", recordIdParam: { label: "Dataset name", help: "Enter a dataset name registered in the Core API catalog." } },
  "lineage-record-detail": { path: "/api/v1/lineage/transactions/{record}", note: "Tenant-scoped lineage record for one transaction.", recordIdParam: { label: "Transaction identifier", help: "Enter a transaction identifier." } },
  "webhook-deliveries": { path: "/webhooks/{record}/deliveries", note: "Delivery history for one configured webhook. Signing secrets are never displayed.", recordIdParam: { label: "Webhook ID", help: "Enter a configured webhook ID from the Webhooks page." } },
  "reconciliation-results": { path: "/api/v1/reconciliation/results", paginated: true, statusFilter: true, statusLabel: "Match outcome", statusOptions: [{ value: "MATCHED", label: "Matched" }, { value: "UNMATCHED", label: "Unmatched" }, { value: "PARTIAL", label: "Partial" }, { value: "MISMATCH", label: "Mismatch" }, { value: "DUPLICATE", label: "Duplicate" }, { value: "PENDING", label: "Pending" }, { value: "EXCEPTION", label: "Exception" }], note: "Tenant-scoped reconciliation result and transaction event history for one transaction; not a reconciliation-run collection.", recordIdParam: { label: "Internal transaction ID", help: "Enter the transaction record ID returned by the Core API." } },
  "risk-alert-detail": { path: "/api/v1/fraud/{record}", note: "Tenant-scoped risk assessment for one transaction; this is not an investigation queue.", recordIdParam: { label: "Transaction ID or reference", help: "Enter an internal transaction ID or provider transaction reference supported by the Core API." } },
  "matched-transactions": { path: "/api/v1/reconciliation/results", note: "Tenant-scoped paginated reconciliation match records filtered to MATCHED outcomes; does not execute reconciliation.", paginated: true, statusFilter: true, defaultStatus: "MATCHED", statusLabel: "Match outcome", statusOptions: [{ value: "MATCHED", label: "Matched" }] },
  "unmatched-transactions": { path: "/api/v1/reconciliation/results", note: "Tenant-scoped paginated reconciliation outcomes filtered to unmatched, mismatched, and duplicate results.", paginated: true, statusFilter: true, defaultStatus: "UNMATCHED,MISMATCH,DUPLICATE", statusLabel: "Match outcome", statusOptions: [{ value: "UNMATCHED,MISMATCH,DUPLICATE", label: "All unmatched / mismatch / duplicate" }, { value: "UNMATCHED", label: "Unmatched" }, { value: "MISMATCH", label: "Mismatch" }, { value: "DUPLICATE", label: "Duplicate" }] },
  "partial-matches": { path: "/api/v1/reconciliation/results", note: "Tenant-scoped paginated reconciliation outcomes filtered to PARTIAL matches.", paginated: true, statusFilter: true, defaultStatus: "PARTIAL", statusLabel: "Match outcome", statusOptions: [{ value: "PARTIAL", label: "Partial" }] },
  "matching-history": { path: "/api/v1/reconciliation/results", note: "Tenant-scoped paginated reconciliation match history. Records are read-only; this endpoint does not create or rerun reconciliation jobs.", paginated: true, statusFilter: true, statusLabel: "Match outcome", searchParam: "transaction_id", searchLabel: "Search exact transaction ID", statusOptions: [{ value: "MATCHED", label: "Matched" }, { value: "UNMATCHED", label: "Unmatched" }, { value: "PARTIAL", label: "Partial" }, { value: "MISMATCH", label: "Mismatch" }, { value: "DUPLICATE", label: "Duplicate" }, { value: "PENDING", label: "Pending" }, { value: "EXCEPTION", label: "Exception" }] },
  "fraud-detection": { path: "/api/v1/fraud/assessments", note: "Persisted tenant-scoped transaction risk assessments only; this does not trigger model inference or guarantee fraud detection.", paginated: true, statusFilter: true, statusLabel: "Risk level", statusOptions: [{ value: "LOW", label: "Low" }, { value: "MEDIUM", label: "Medium" }, { value: "HIGH", label: "High" }, { value: "CRITICAL", label: "Critical" }] },
  "risk-events": { path: "/api/v1/fraud/assessments", note: "Persisted tenant-scoped transaction risk assessments. These are model/rule outputs, not a complete investigation or incident workflow.", paginated: true, statusFilter: true, statusLabel: "Risk level", statusOptions: [{ value: "LOW", label: "Low" }, { value: "MEDIUM", label: "Medium" }, { value: "HIGH", label: "High" }, { value: "CRITICAL", label: "Critical" }] },
  "suspicious-transactions": { path: "/api/v1/fraud/assessments", note: "Tenant-scoped high/critical persisted risk assessments; these are flags for review, not proof of fraud.", paginated: true, statusFilter: true, defaultStatus: "HIGH,CRITICAL", statusLabel: "Risk level", statusOptions: [{ value: "HIGH,CRITICAL", label: "High and critical" }, { value: "HIGH", label: "High" }, { value: "CRITICAL", label: "Critical" }] },
  "failed-transactions": { path: "/api/v1/transactions/search", note: "Tenant-scoped failed/rejected transaction lifecycle records; not refunds or settlement failures.", paginated: true, statusFilter: true, statusLabel: "Transaction status", searchParam: "filter", searchLabel: "Search transactions", defaultStatus: "FAILED,REJECTED", statusOptions: [{ value: "FAILED,REJECTED", label: "Failed and rejected" }, { value: "FAILED", label: "Failed" }, { value: "REJECTED", label: "Rejected" }] },
  "pending-transactions": { path: "/api/v1/transactions/search", note: "Tenant-scoped in-progress transaction lifecycle records; these states are not reconciliation match outcomes.", paginated: true, statusFilter: true, statusLabel: "Transaction status", searchParam: "filter", searchLabel: "Search transactions", defaultStatus: "RECEIVED,VALIDATED,PROCESSING,RECONCILING", statusOptions: [{ value: "RECEIVED,VALIDATED,PROCESSING,RECONCILING", label: "All in-progress states" }, { value: "RECEIVED", label: "Received" }, { value: "VALIDATED", label: "Validated" }, { value: "PROCESSING", label: "Processing" }, { value: "RECONCILING", label: "Reconciling" }] },
  "system-health": { path: "/public/status", note: "Public API status only; not a full dependency-health dashboard.", auth: false },
  "service-status": { path: "/public/status", note: "Current API status only; not a historical uptime report.", auth: false },
  integrations: { path: "/providers", note: "Provider registry. Only backend-configured, supported provider types should be shown." },
  "data-sources": { path: "/providers", note: "Provider registry only; this is not a data-quality result." },
  "duplicate-detection": { path: "/api/v1/reconciliation/results", paginated: true, statusFilter: true, defaultStatus: "DUPLICATE", statusLabel: "Match outcome", statusOptions: [{ value: "DUPLICATE", label: "Duplicate" }], note: "Persisted reconciliation outcomes marked duplicate; not a separate fraud or global duplicate-detection service." },
  "flagged-transactions": { path: "/api/v1/fraud/assessments", paginated: true, statusFilter: true, defaultStatus: "HIGH,CRITICAL", statusLabel: "Risk level", statusOptions: [{ value: "HIGH,CRITICAL", label: "High and critical" }, { value: "HIGH", label: "High" }, { value: "CRITICAL", label: "Critical" }], note: "Persisted high/critical risk assessments for review; flags are not proof of fraud." },
  "integration-detail": { path: "/providers/{record}", note: "Provider detail from the Core API; verify provider tenant ownership and supported-provider status before relying on this page.", recordIdParam: { label: "Provider ID", help: "Enter a provider ID returned by the Integrations page." } },
  webhooks: { path: "/webhooks", note: "Webhook destination records; signing secrets are never rendered." },
  "import-sync-activity": { path: "/api/v1/operations/outbox", note: "Operational outbox records; not a complete import-job history." },
  reports: { path: "/v1/customers/{tenant}/reports", note: "Tenant report listing; verify tenant authorization and deployed response contract before release." },
  "access-history": { path: "/v1/customers/{tenant}/audit", note: "Tenant audit events; verify tenant authorization and audit coverage before relying on it." },
  "tenant-profile": { path: "/tenant/current", note: "Authenticated tenant profile." },
  "organization-profile": { path: "/tenant/current", note: "Authenticated tenant context; not organization CRUD." },
  settings: { path: "/v1/settings", note: "Settings response; unsupported settings mutations remain unavailable." },
  preferences: { path: "/tenant/current/locale", note: "Locale preference only; not a full preference service." },
  notifications: { path: "/api/v1/communications/messages", note: "Communication messages; not notification preferences." },
  "notification-center": { path: "/api/v1/communications/messages", note: "Communication messages; not notification preferences." },
};

export function dashboardResourceDefinition(page: DashboardPage, tenantId?: string): ResourceDefinition | null {
  const definition = resources[page];
  if (!definition) return null;
  if (definition.path.includes("{tenant}")) {
    if (!tenantId) return null;
    return { ...definition, path: definition.path.replace("{tenant}", encodeURIComponent(tenantId)) };
  }
  return definition;
}

export interface DashboardResourceOptions { page?: number; perPage?: number; status?: string; search?: string; recordId?: string; }

export async function fetchDashboardResource(
  page: DashboardPage,
  session: LoginResult,
  signal?: AbortSignal,
  options: DashboardResourceOptions = {},
): Promise<DashboardResourceResult> {
  const definition = dashboardResourceDefinition(page, session.tenantId);
  if (!definition) {
    throw new PesaguardApiError("This page has no dedicated, verified Core API resource. It remains unavailable rather than displaying sample data.", 501, "endpoint_not_implemented");
  }

  const recordId = options.recordId?.trim();
  if (definition.recordIdParam && !recordId) {
    throw new PesaguardApiError(`Enter ${definition.recordIdParam.label.toLowerCase()} to load this resource.`, 400, "record_id_required");
  }
  const resolvedPath = definition.path.includes("{record}")
    ? definition.path.replace("{record}", encodeURIComponent(recordId ?? ""))
    : definition.path;
  let response: Response;
  try {
    const url = new URL(`${API_BASE_URL}${resolvedPath}`);
    for (const [key, value] of Object.entries(definition.queryParams ?? {})) url.searchParams.set(key, value);
    if (definition.searchParam && options.search) url.searchParams.set(definition.searchParam, options.search.slice(0, 200));
    if (definition.paginated) {
      url.searchParams.set("page", String(Math.max(1, Math.floor(options.page ?? 1))));
      url.searchParams.set("per_page", String(Math.min(100, Math.max(1, Math.floor(options.perPage ?? 25)))));
    }
    if (definition.statusFilter) {
      const status = options.status === undefined ? definition.defaultStatus : options.status;
      if (status) url.searchParams.set("status", status);
      else url.searchParams.delete("status");
    }
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(definition.auth === false ? {} : { Authorization: `Bearer ${session.accessToken}` }),
      },
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new PesaguardApiError("Could not reach the Core API. No sample data was substituted.", 0, "network_error");
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    throw new PesaguardApiError(
      typeof record.message === "string" ? record.message : `Core API request failed with HTTP ${response.status}.`,
      response.status,
      typeof record.error === "string" ? record.error : "api_error",
    );
  }
  return { path: resolvedPath, status: response.status, payload, fetchedAt: new Date().toISOString() };
}

export function dashboardResourceNote(page: DashboardPage, tenantId?: string): string {
  return dashboardResourceDefinition(page, tenantId)?.note ?? "No dedicated Core API endpoint is available for this page yet. No sample data or local-only changes are shown.";
}
