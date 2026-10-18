import type { DashboardPage } from "../app/config/routes";
import { API_BASE_URL, PesaguardApiError, type LoginResult } from "./api";

export interface DashboardResourceResult {
  path: string;
  status: number;
  payload: unknown;
  fetchedAt: string;
}

type ResourceDefinition = { path: string; note: string; auth?: boolean };

// This registry deliberately includes only GET routes found in the Core API
// route audit. It does not claim that a legacy route is production-safe; every
// mapped route still needs tenant-isolation, permission and response-contract
// verification. Pages needing record IDs or unsupported APIs remain unavailable.
const resources: Partial<Record<DashboardPage, ResourceDefinition>> = {
  home: { path: "/analytics/reconciliation-report", note: "Reconciliation report returned by the Core API; not synthetic executive KPIs." },
  "executive-overview": { path: "/analytics/reconciliation-report", note: "Reconciliation report only; this route does not supply unrelated executive metrics." },
  "operational-activity": { path: "/activity-feed", note: "Activity feed returned by the Core API." },
  "activity-log": { path: "/activity-feed", note: "Activity feed; not a compliance-complete immutable audit log." },
  exceptions: { path: "/discrepancies", note: "Discrepancy records returned by the Core API." },
  "exception-detail": { path: "/discrepancies", note: "Discrepancy collection only. A record-specific endpoint is required for a detail view." },
  reconciliation: { path: "/analytics/reconciliation-report", note: "Reconciliation report only. Reconciliation-run execution/history is not provided by this endpoint." },
  "financial-summaries": { path: "/analytics/reconciliation-report", note: "Reconciliation report only; not a settlement or accounting ledger." },
  "system-health": { path: "/health", note: "Service dependency health, not tenant business data.", auth: false },
  "service-status": { path: "/health", note: "Service dependency health, not a public uptime history.", auth: false },
  integrations: { path: "/providers", note: "Provider registry. Only backend-configured, supported provider types should be shown." },
  "data-sources": { path: "/providers", note: "Provider registry only; this is not a data-quality result." },
  "data-source-health": { path: "/providers", note: "Provider registry only; connection-health status needs its own verified contract." },
  webhooks: { path: "/webhooks", note: "Webhook destination records. Signing secrets are never rendered by this page." },
  "webhook-deliveries": { path: "/webhooks", note: "Webhook endpoints only; delivery history requires a selected endpoint ID." },
  "import-sync-activity": { path: "/api/v1/operations/outbox", note: "Operational outbox records; not a complete import-job history." },
  "processing-jobs": { path: "/api/v1/operations/outbox", note: "Operational outbox records only; not a general job queue." },
  reports: { path: "/api/v1/customers/{tenant}/reports", note: "Reports for the authenticated tenant path; validate the legacy route's tenant enforcement before release." },
  "report-builder": { path: "/api/v1/catalog/datasets", note: "Dataset catalog only; report execution is not implemented by this route." },
  "api-developer-resources": { path: "/api/v1/iam/api-clients", note: "API client metadata. Never expose secret material." },
  "tenant-profile": { path: "/tenant/current", note: "Authenticated tenant profile." },
  "organization-profile": { path: "/tenant/current", note: "Authenticated tenant context; not organization CRUD." },
  settings: { path: "/v1/settings", note: "Settings response; unsupported settings mutations remain unavailable." },
  "preferences": { path: "/tenant/current/locale", note: "Locale preference only; not a full preference service." },
  "notifications": { path: "/api/v1/communications/messages", note: "Communication messages; not notification preferences." },
  "notification-center": { path: "/api/v1/communications/messages", note: "Communication messages; not notification preferences." },
  "notification-delivery-history": { path: "/api/v1/communications/messages", note: "Communication message history; delivery detail requires a message ID." },
  "data-lineage": { path: "/api/v1/catalog/datasets", note: "Dataset catalog only; transaction lineage requires a transaction ID." },
  "risk-overview": { path: "/analytics/incident-trends", note: "Incident trend analytics only; not a calibrated fraud-score summary." },
  "risk-events": { path: "/incidents/search", note: "Operational incident search; not a verified financial-risk event feed." },
  alerts: { path: "/incidents/search", note: "Operational incidents only; not a dedicated financial alert service." },
  "suspicious-transactions": { path: "/discrepancies", note: "Discrepancy collection only; not a fraud classification result." },
  "failed-transactions": { path: "/api/v1/customers/{tenant}/transactions", note: "Tenant transaction collection; status filtering must be verified against the route contract." },
  "pending-transactions": { path: "/api/v1/customers/{tenant}/transactions", note: "Tenant transaction collection; status filtering must be verified against the route contract." },
  "matched-transactions": { path: "/api/v1/customers/{tenant}/transactions", note: "Tenant transaction collection; match filtering must be verified against the route contract." },
  "unmatched-transactions": { path: "/api/v1/customers/{tenant}/transactions", note: "Tenant transaction collection; match filtering must be verified against the route contract." },
  "partial-matches": { path: "/api/v1/customers/{tenant}/transactions", note: "Tenant transaction collection; partial-match filtering is not implied." },
  "transaction-detail": { path: "/api/v1/customers/{tenant}/transactions", note: "Tenant transaction collection only; select a record-specific transaction endpoint for detail." },
  "transaction-lifecycle": { path: "/api/v1/customers/{tenant}/transactions", note: "Tenant transaction collection only; lifecycle events require a transaction-specific endpoint." },
  "provider-callback-history": { path: "/providers", note: "Provider registry only; callback history is not supplied." },
  "team-members": { path: "/api/v1/organizations", note: "Organization collection only; this is not a team-member list." },
  "branches": { path: "/api/v1/organizations", note: "Organization collection only; branch records require a branch API." },
  "security": { path: "/api/v1/iam/api-clients", note: "API client metadata only; not a complete security-events feed." },
  "access-history": { path: "/api/v1/customers/{tenant}/audit", note: "Tenant audit route; validate tenant authorization and audit coverage before relying on it." },
  "export-center": { path: "/api/v1/export/csv", note: "CSV export route; verify its response/download contract before use." },
  "customers": { path: "/api/v1/organizations", note: "Organization collection is not a customer directory; this page is intentionally not mapped." },
};

const unavailablePages = new Set<DashboardPage>(["customers"]);
void unavailablePages;

export function dashboardResourceDefinition(page: DashboardPage, tenantId?: string): ResourceDefinition | null {
  const definition = resources[page];
  if (!definition) return null;
  if (page === "customers") return null;
  if (definition.path.includes("{tenant}")) {
    if (!tenantId) return null;
    return { ...definition, path: definition.path.replace("{tenant}", encodeURIComponent(tenantId)) };
  }
  return definition;
}

export async function fetchDashboardResource(
  page: DashboardPage,
  session: LoginResult,
  signal?: AbortSignal,
): Promise<DashboardResourceResult> {
  const definition = dashboardResourceDefinition(page, session.tenantId);
  if (!definition) {
    throw new PesaguardApiError("This page has no dedicated, verified Core API resource. It remains unavailable rather than displaying sample data.", 501, "endpoint_not_implemented");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${definition.path}`, {
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
  return { path: definition.path, status: response.status, payload, fetchedAt: new Date().toISOString() };
}

export function dashboardResourceNote(page: DashboardPage, tenantId?: string): string {
  return dashboardResourceDefinition(page, tenantId)?.note ?? "No dedicated Core API endpoint is available for this page yet. No sample data or local-only changes are shown.";
}
