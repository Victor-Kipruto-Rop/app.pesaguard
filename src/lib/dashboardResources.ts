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
  reconciliation: { path: "/analytics/reconciliation-report", note: "Reconciliation report only; run execution/history requires a dedicated API." },
  "system-health": { path: "/health", note: "Service dependency health, not tenant business data.", auth: false },
  "service-status": { path: "/health", note: "Service dependency health, not a public uptime history.", auth: false },
  integrations: { path: "/providers", note: "Provider registry. Only backend-configured, supported provider types should be shown." },
  "data-sources": { path: "/providers", note: "Provider registry only; this is not a data-quality result." },
  webhooks: { path: "/webhooks", note: "Webhook destination records; signing secrets are never rendered." },
  "import-sync-activity": { path: "/api/v1/operations/outbox", note: "Operational outbox records; not a complete import-job history." },
  reports: { path: "/api/v1/customers/{tenant}/reports", note: "Tenant reports; the legacy route's tenant enforcement must be verified before release." },
  "report-builder": { path: "/api/v1/catalog/datasets", note: "Dataset catalog only; report execution is not implemented by this route." },
  "tenant-profile": { path: "/tenant/current", note: "Authenticated tenant profile." },
  "organization-profile": { path: "/tenant/current", note: "Authenticated tenant context; not organization CRUD." },
  settings: { path: "/v1/settings", note: "Settings response; unsupported settings mutations remain unavailable." },
  preferences: { path: "/tenant/current/locale", note: "Locale preference only; not a full preference service." },
  notifications: { path: "/api/v1/communications/messages", note: "Communication messages; not notification preferences." },
  "notification-center": { path: "/api/v1/communications/messages", note: "Communication messages; not notification preferences." },
  "access-history": { path: "/api/v1/customers/{tenant}/audit", note: "Tenant audit route; verify tenant authorization and audit coverage before relying on it." },
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
