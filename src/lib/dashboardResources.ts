import type { DashboardPage } from "../app/config/routes";
import { API_BASE_URL, PesaguardApiError } from "./api";

export interface DashboardResourceResult {
  path: string;
  status: number;
  payload: unknown;
  fetchedAt: string;
}

type ResourceDefinition = { path: string; note: string; auth?: boolean };

// Only map a page when a matching route exists in the Core API route audit or
// published contract. Unmapped pages deliberately show "not available" rather
// than manufacturing rows or reusing an unrelated resource.
const resources: Partial<Record<DashboardPage, ResourceDefinition>> = {
  home: { path: "/analytics/reconciliation-report", note: "Live reconciliation analytics; not a general-purpose dashboard summary." },
  "executive-overview": { path: "/analytics/reconciliation-report", note: "Live reconciliation analytics only; other executive metrics are not implied." },
  "operational-activity": { path: "/activity-feed", note: "Server activity feed." },
  reconciliation: { path: "/discrepancies", note: "Server discrepancy records; this does not execute a reconciliation run." },
  exceptions: { path: "/discrepancies", note: "Server discrepancy records." },
  "activity-log": { path: "/activity-feed", note: "Server activity feed; confirm audit-event completeness before compliance use." },
  "system-health": { path: "/health", note: "Service dependency health, not tenant business data.", auth: false },
  integrations: { path: "/providers", note: "Configured provider records; verify tenant scoping before production use." },
  "data-sources": { path: "/providers", note: "Provider registry only; this is not a data-quality result." },
  webhooks: { path: "/webhooks", note: "Configured webhook destinations; secrets are never returned by this client." },
  "import-sync-activity": { path: "/api/v1/operations/outbox", note: "Operational outbox records; not a complete import-job history." },
  reports: { path: "/api/v1/customers/{tenant}/reports", note: "Tenant report records from the existing customer-scoped route." },
  "report-builder": { path: "/api/v1/catalog/datasets", note: "Available dataset catalog only; report execution is not implemented by this route." },
  "api-developer-resources": { path: "/api/v1/iam/api-clients", note: "API client metadata; secret material must never be exposed." },
  "tenant-profile": { path: "/tenant/current", note: "Authenticated tenant profile." },
  "organization-profile": { path: "/tenant/current", note: "Authenticated tenant context; this is not organization CRUD." },
  settings: { path: "/v1/settings", note: "Existing settings response; unsupported settings mutations remain unavailable." },
  notifications: { path: "/api/v1/communications/messages", note: "Communication messages; not a full notification-preference service." },
  "notification-center": { path: "/api/v1/communications/messages", note: "Communication messages; not a full notification-preference service." },
  "team-members": { path: "/auth/users", note: "Authenticated user directory; validate tenant scoping and permissions in staging." },
  "risk-events": { path: "/analytics/incident-trends", note: "Incident trend analytics only; not a raw risk-event feed." },
  "risk-overview": { path: "/analytics/incident-trends", note: "Incident trend analytics only; not a calibrated fraud-score summary." },
  "data-lineage": { path: "/api/v1/catalog/datasets", note: "Dataset catalog only; transaction lineage requires a transaction identifier." },
};

export function dashboardResourceDefinition(page: DashboardPage): ResourceDefinition | null {
  return resources[page] ?? null;
}

export async function fetchDashboardResource(
  page: DashboardPage,
  accessToken: string,
  tenantId: string,
  signal?: AbortSignal,
): Promise<DashboardResourceResult> {
  const definition = dashboardResourceDefinition(page);
  if (!definition) {
    throw new PesaguardApiError("This page has no verified Core API endpoint yet. It is unavailable until the backend contract is implemented.", 501, "endpoint_not_implemented");
  }

  const path = definition.path.replace("{tenant}", encodeURIComponent(tenantId));
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(definition.auth === false ? {} : { Authorization: `Bearer ${accessToken}`, "X-Tenant-ID": tenantId }),
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
  return { path, status: response.status, payload, fetchedAt: new Date().toISOString() };
}

export function dashboardResourceNote(page: DashboardPage): string {
  return resources[page]?.note ?? "No verified Core API endpoint is mapped to this page yet.";
}
