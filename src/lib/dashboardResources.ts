import type { DashboardPage } from "../app/config/routes";
import { API_BASE_URL, PesaguardApiError, type LoginResult } from "./api";

export interface DashboardResourceResult {
  path: string;
  status: number;
  payload: unknown;
  fetchedAt: string;
}

type ResourceDefinition = { path: string; note: string; auth?: boolean; paginated?: boolean; statusFilter?: boolean };

// This registry deliberately includes only GET routes found in the Core API
// route audit. It does not claim that a legacy route is production-safe; every
// mapped route still needs tenant-isolation, permission and response-contract
// verification. Pages needing record IDs or unsupported APIs remain unavailable.
const resources: Partial<Record<DashboardPage, ResourceDefinition>> = {
  home: { path: "/api/v1/dashboard/overview", note: "Tenant-scoped persisted transaction and discrepancy metrics from the Core API." },
  "executive-overview": { path: "/api/v1/dashboard/overview", note: "Tenant-scoped persisted transaction and discrepancy metrics; no fabricated risk or revenue KPIs." },
  "risk-overview": { path: "/analytics/incident-trends", note: "Incident trends; not a fraud probability model or financial loss forecast." },
  alerts: { path: "/incidents/search", note: "Operational incident search; verify its tenant scoping before treating results as tenant-specific alerts." },
  "operational-activity": { path: "/activity-feed", note: "Activity feed returned by the Core API." },
  "activity-log": { path: "/v1/customers/{tenant}/audit", note: "Tenant audit events; verify tenant authorization, event coverage and pagination before relying on it." },
  exceptions: { path: "/discrepancies", note: "Discrepancy records returned by the Core API." },
  reconciliation: { path: "/analytics/reconciliation-report", note: "Reconciliation report only; run execution/history requires a dedicated API." },
  "data-imports": { path: "/api/v1/imports", note: "Paginated import job history for the authenticated tenant; upload and import execution are separate actions.", paginated: true, statusFilter: true },
  "failed-transactions": { path: "/api/v1/transactions/search?status=FAILED%2CREJECTED&per_page=100", note: "Tenant-scoped failed/rejected transaction lifecycle records; not refunds or settlement failures." },
  "pending-transactions": { path: "/api/v1/transactions/search?status=RECEIVED%2CVALIDATED%2CPROCESSING%2CRECONCILING&per_page=100", note: "Tenant-scoped in-progress transaction lifecycle records; these states are not reconciliation match outcomes." },
  "system-health": { path: "/public/status", note: "Public API status only; not a full dependency-health dashboard.", auth: false },
  "service-status": { path: "/public/status", note: "Current API status only; not a historical uptime report.", auth: false },
  integrations: { path: "/providers", note: "Provider registry. Only backend-configured, supported provider types should be shown." },
  "data-sources": { path: "/providers", note: "Provider registry only; this is not a data-quality result." },
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

export interface DashboardResourceOptions { page?: number; perPage?: number; status?: string; }

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

  let response: Response;
  try {
    const url = new URL(`${API_BASE_URL}${definition.path}`);
    if (definition.paginated) {
      url.searchParams.set("page", String(Math.max(1, Math.floor(options.page ?? 1))));
      url.searchParams.set("per_page", String(Math.min(100, Math.max(1, Math.floor(options.perPage ?? 25)))));
    }
    if (definition.statusFilter && options.status) url.searchParams.set("status", options.status);
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
  return { path: definition.path, status: response.status, payload, fetchedAt: new Date().toISOString() };
}

export function dashboardResourceNote(page: DashboardPage, tenantId?: string): string {
  return dashboardResourceDefinition(page, tenantId)?.note ?? "No dedicated Core API endpoint is available for this page yet. No sample data or local-only changes are shown.";
}
