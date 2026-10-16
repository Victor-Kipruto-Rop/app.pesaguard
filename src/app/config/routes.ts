export type DashboardPage =
  | "home"
  | "executive-overview"
  | "operational-activity"
  | "transactions"
  | "reconciliation"
  | "exceptions"
  | "payments"
  | "settlements"
  | "reports"
  | "data-imports"
  | "integrations"
  | "webhooks"
  | "import-sync-activity"
  | "activity-log"
  | "security"
  | "system-health"
  | "customers"
  | "team-members"
  | "roles-permissions"
  | "tenant-profile"
  | "settings"
  | "notifications"
  | "account-authentication"
  | "preferences"
  | "help-support"
  | "api-developer-resources"
  | "data-quality" | "data-sources" | "validation-results" | "duplicate-detection" | "schema-mapping" | "data-lineage" | "processing-jobs" | "freshness-monitoring"
  | "risk-overview" | "fraud-detection" | "risk-events" | "suspicious-transactions" | "alerts" | "investigations" | "risk-rules"
  | "reconciliation-runs" | "matching-rules" | "matching-history" | "settlement-batches" | "scheduled-reconciliation"
  | "report-builder" | "scheduled-reports" | "export-center" | "approvals" | "webhook-deliveries" | "support-requests" | "retention-privacy";

const routeByPath: Record<string, DashboardPage> = {
  "/": "home",
  "/executive-overview": "executive-overview",
  "/operational-activity": "operational-activity",
  "/transactions": "transactions",
  "/reconciliation": "reconciliation",
  "/exceptions": "exceptions",
  "/payments": "payments",
  "/settlements": "settlements",
  "/reports": "reports",
  "/data-imports": "data-imports",
  "/integrations": "integrations",
  "/webhooks": "webhooks",
  "/import-sync-activity": "import-sync-activity",
  "/activity-log": "activity-log",
  "/security": "security",
  "/system-health": "system-health",
  "/customers": "customers",
  "/team-members": "team-members",
  "/roles-permissions": "roles-permissions",
  "/tenant-profile": "tenant-profile",
  "/settings": "settings",
  "/notifications": "notifications",
  "/account-authentication": "account-authentication",
  "/preferences": "preferences",
  "/help-support": "help-support",
  "/api-developer-resources": "api-developer-resources",
  "/data-quality": "data-quality", "/data-sources": "data-sources", "/validation-results": "validation-results",
  "/duplicate-detection": "duplicate-detection", "/schema-mapping": "schema-mapping", "/data-lineage": "data-lineage",
  "/processing-jobs": "processing-jobs", "/freshness-monitoring": "freshness-monitoring",
  "/risk-overview": "risk-overview", "/fraud-detection": "fraud-detection", "/risk-events": "risk-events",
  "/suspicious-transactions": "suspicious-transactions", "/alerts": "alerts", "/investigations": "investigations", "/risk-rules": "risk-rules",
  "/reconciliation-runs": "reconciliation-runs", "/matching-rules": "matching-rules", "/matching-history": "matching-history",
  "/settlement-batches": "settlement-batches", "/scheduled-reconciliation": "scheduled-reconciliation",
  "/report-builder": "report-builder", "/scheduled-reports": "scheduled-reports", "/export-center": "export-center",
  "/approvals": "approvals", "/webhook-deliveries": "webhook-deliveries", "/support-requests": "support-requests", "/retention-privacy": "retention-privacy",
};

export function pageFromPath(pathname: string): DashboardPage {
  return routeByPath[pathname.replace(/\/+$/, "") || "/"] ?? "home";
}

export function pathForPage(page: DashboardPage): string {
  return page === "home" ? "/" : `/${page}`;
}
