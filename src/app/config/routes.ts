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
  | "dataset-catalog" | "dataset-catalog-detail" | "resolution-time-analytics" | "operator-performance" | "sla-metrics"
  | "data-quality" | "data-sources" | "validation-results" | "duplicate-detection" | "schema-mapping" | "data-lineage" | "processing-jobs" | "freshness-monitoring"
  | "risk-overview" | "fraud-detection" | "risk-events" | "suspicious-transactions" | "alerts" | "investigations" | "risk-rules"
  | "reconciliation-runs" | "matching-rules" | "matching-history" | "settlement-batches" | "scheduled-reconciliation"
  | "report-builder" | "scheduled-reports" | "export-center" | "approvals" | "webhook-deliveries" | "support-requests" | "retention-privacy"
  | "organization-profile" | "branches" | "user-profile" | "notification-center"
  | "failed-transactions" | "pending-transactions" | "refunds-reversals" | "refund-reversal-detail" | "transaction-import-results"
  | "reconciliation-run-detail" | "matched-transactions" | "unmatched-transactions" | "partial-matches"
  | "manual-matching" | "match-approvals" | "exception-detail" | "matching-rule-detail"
  | "settlement-detail" | "settlement-discrepancies" | "financial-summaries"
  | "data-quality-issues" | "data-quality-issue-detail" | "data-source-health" | "data-quality-trends"
  | "risk-alert-detail" | "flagged-transactions" | "fraud-investigation" | "risk-rule-detail"
  | "report-detail" | "scheduled-report-detail" | "integration-detail" | "webhook-delivery-detail"
  | "alert-detail" | "service-status" | "security-settings" | "active-sessions" | "access-history"
  | "account-closure" | "onboarding-resume" | "first-login-checklist"
  | "transaction-detail" | "transaction-lifecycle" | "provider-callback-history" | "create-reconciliation-run" | "reconciliation-results" | "rematch-confirmation" | "exception-resolution" | "import-wizard" | "column-mapping" | "validation-review" | "mpesa-setup" | "callback-configuration" | "credential-rotation" | "settlement-statement-upload" | "settlement-comparison" | "settlement-variance-review" | "customer-detail" | "team-invitations" | "member-detail" | "role-editor" | "webhook-endpoint-editor" | "webhook-signing-secret" | "webhook-retry" | "report-create" | "report-schedule-config" | "report-recipients" | "export-history" | "branch-detail" | "validation-rule-editor" | "pipeline-failure-detail" | "lineage-record-detail" | "investigation-evidence" | "investigation-notes" | "risk-rule-simulation" | "audit-event-detail" | "data-export-request" | "deletion-request-status" | "notification-preferences" | "notification-delivery-history" | "support-case-detail" | "diagnostic-attachments";

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
  "/dataset-catalog": "dataset-catalog", "/dataset-catalog-detail": "dataset-catalog-detail",
  "/resolution-time-analytics": "resolution-time-analytics", "/operator-performance": "operator-performance", "/sla-metrics": "sla-metrics",
  "/data-quality": "data-quality", "/data-sources": "data-sources", "/validation-results": "validation-results",
  "/duplicate-detection": "duplicate-detection", "/schema-mapping": "schema-mapping", "/data-lineage": "data-lineage",
  "/processing-jobs": "processing-jobs", "/freshness-monitoring": "freshness-monitoring",
  "/risk-overview": "risk-overview", "/fraud-detection": "fraud-detection", "/risk-events": "risk-events",
  "/suspicious-transactions": "suspicious-transactions", "/alerts": "alerts", "/investigations": "investigations", "/risk-rules": "risk-rules",
  "/reconciliation-runs": "reconciliation-runs", "/matching-rules": "matching-rules", "/matching-history": "matching-history",
  "/settlement-batches": "settlement-batches", "/scheduled-reconciliation": "scheduled-reconciliation",
  "/report-builder": "report-builder", "/scheduled-reports": "scheduled-reports", "/export-center": "export-center",
  "/approvals": "approvals", "/webhook-deliveries": "webhook-deliveries", "/support-requests": "support-requests", "/retention-privacy": "retention-privacy",
  "/organization-profile": "organization-profile",
  "/branches": "branches",
  "/user-profile": "user-profile",
  "/notification-center": "notification-center",
  "/failed-transactions": "failed-transactions",
  "/pending-transactions": "pending-transactions",
  "/refunds-reversals": "refunds-reversals",
  "/refund-reversal-detail": "refund-reversal-detail",
  "/transaction-import-results": "transaction-import-results",
  "/reconciliation-run-detail": "reconciliation-run-detail",
  "/matched-transactions": "matched-transactions",
  "/unmatched-transactions": "unmatched-transactions",
  "/partial-matches": "partial-matches",
  "/manual-matching": "manual-matching",
  "/match-approvals": "match-approvals",
  "/exception-detail": "exception-detail",
  "/matching-rule-detail": "matching-rule-detail",
  "/settlement-detail": "settlement-detail",
  "/settlement-discrepancies": "settlement-discrepancies",
  "/financial-summaries": "financial-summaries",
  "/data-quality-issues": "data-quality-issues",
  "/data-quality-issue-detail": "data-quality-issue-detail",
  "/data-source-health": "data-source-health",
  "/data-quality-trends": "data-quality-trends",
  "/risk-alert-detail": "risk-alert-detail",
  "/flagged-transactions": "flagged-transactions",
  "/fraud-investigation": "fraud-investigation",
  "/risk-rule-detail": "risk-rule-detail",
  "/report-detail": "report-detail",
  "/scheduled-report-detail": "scheduled-report-detail",
  "/integration-detail": "integration-detail",
  "/webhook-delivery-detail": "webhook-delivery-detail",
  "/alert-detail": "alert-detail",
  "/service-status": "service-status",
  "/security-settings": "security-settings",
  "/active-sessions": "active-sessions",
  "/access-history": "access-history",
  "/account-closure": "account-closure",
  "/onboarding-resume": "onboarding-resume",
  "/first-login-checklist": "first-login-checklist",
  "/transaction-detail": "transaction-detail",
  "/transaction-lifecycle": "transaction-lifecycle",
  "/provider-callback-history": "provider-callback-history",
  "/create-reconciliation-run": "create-reconciliation-run",
  "/reconciliation-results": "reconciliation-results",
  "/rematch-confirmation": "rematch-confirmation",
  "/exception-resolution": "exception-resolution",
  "/import-wizard": "import-wizard",
  "/column-mapping": "column-mapping",
  "/validation-review": "validation-review",
  "/mpesa-setup": "mpesa-setup",
  "/callback-configuration": "callback-configuration",
  "/credential-rotation": "credential-rotation",
  "/settlement-statement-upload": "settlement-statement-upload",
  "/settlement-comparison": "settlement-comparison",
  "/settlement-variance-review": "settlement-variance-review",
  "/customer-detail": "customer-detail",
  "/team-invitations": "team-invitations",
  "/member-detail": "member-detail",
  "/role-editor": "role-editor",
  "/webhook-endpoint-editor": "webhook-endpoint-editor",
  "/webhook-signing-secret": "webhook-signing-secret",
  "/webhook-retry": "webhook-retry",
  "/report-create": "report-create",
  "/report-schedule-config": "report-schedule-config",
  "/report-recipients": "report-recipients",
  "/export-history": "export-history",
  "/branch-detail": "branch-detail",
  "/validation-rule-editor": "validation-rule-editor",
  "/pipeline-failure-detail": "pipeline-failure-detail",
  "/lineage-record-detail": "lineage-record-detail",
  "/investigation-evidence": "investigation-evidence",
  "/investigation-notes": "investigation-notes",
  "/risk-rule-simulation": "risk-rule-simulation",
  "/audit-event-detail": "audit-event-detail",
  "/data-export-request": "data-export-request",
  "/deletion-request-status": "deletion-request-status",
  "/notification-preferences": "notification-preferences",
  "/notification-delivery-history": "notification-delivery-history",
  "/support-case-detail": "support-case-detail",
  "/diagnostic-attachments": "diagnostic-attachments",
};

export function pageFromPath(pathname: string): DashboardPage {
  return routeByPath[pathname.replace(/\/+$/, "") || "/"] ?? "home";
}

export function pathForPage(page: DashboardPage): string {
  return page === "home" ? "/" : `/${page}`;
}
