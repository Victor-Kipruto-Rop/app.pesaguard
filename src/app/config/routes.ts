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
  | "api-developer-resources";

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
};

export function pageFromPath(pathname: string): DashboardPage {
  return routeByPath[pathname.replace(/\/+$/, "") || "/"] ?? "home";
}

export function pathForPage(page: DashboardPage): string {
  return page === "home" ? "/" : `/${page}`;
}
